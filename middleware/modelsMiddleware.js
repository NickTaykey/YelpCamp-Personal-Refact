// MODELS
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const User = require("../models/user");
const { cloudinary } = require("../cloudinary");

// to deal with location in searchAndFiltering middleware
const mapbox = require("@mapbox/mapbox-sdk/services/geocoding");
let geocodeClient = mapbox({ accessToken: process.env.MAPBOX_TOKEN });

// campground fields
const formFields = ["name", "price", "description", "location"];

/* 
add a \ before any special regex character (valid in the regexps) in order to escape it
USED IN searchAndFilterCampgrounds MIDLEWARE TO DEAL WITH USER TYPED STRINGS
*/
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

const middlewareOBJ = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.url = req.originalUrl;
    req.session.error = "You need to be logged in to do that";
    res.redirect("/login");
  },
  async checkUserOwnership(req, res, next) {
    let campground = await Campground.findById(req.params.id);
    if (campground && campground.author.equals(req.user._id)) {
      res.locals.campground = campground;
      return next();
    }
    req.session.error = "You don't have the permissions to do that";
    res.redirect("back");
  },
  async checkCommentOwnership(req, res, next) {
    let comment = await Comment.findById(req.params.comment_id);
    if (comment && comment.author.equals(req.user._id)) {
      res.locals.comment = comment;
      return next();
    }
    req.session.error = "you don't have the permision to do that";
    res.redirect("back");
  },
  async checkIfUserExists(req, res, next) {
    let user = await User.findOne({ username: req.params.username });
    if (user) {
      res.locals.user = user;
      return next();
    }
    req.session.error = `404 user '${req.params.username}' not found`;
    res.redirect("/campgrounds");
  },
  async checkUserIdentify(req, res, next) {
    if (req.user.username && req.user.username === req.params.username) {
      res.locals.user = await User.findById(req.user._id);
      return next();
    }
    req.session.error = `You are not authorized to do that`;
    res.redirect("/campgrounds");
  },
  // PROFILE UPDATE, controlla se la password attuale che l'utente ha inserito è corretta
  async checkUserPassword(req, res, next) {
    const { password } = req.body;
    let { err, user } = await User.authenticate()(req.user.username, password);
    if (!err && user) {
      // utente autorizzato
      return next();
    }
    await module.exports.deleteImage(req);
    // utente non autorizzato, errore
    req.session.error = "Wrong password!";
    res.redirect("back");
  },
  // PROFILE UPDATE, setta la nuova password
  async setNewPassword(req, res, next) {
    const user = res.locals.user;
    const { newPassword, confirmPassword } = req.body;
    let errMsg;
    // se ci sono entrambe le password le settiamo
    if (newPassword && confirmPassword) {
      if (newPassword === confirmPassword) {
        await user.setPassword(newPassword);
        res.locals.user = await user.save();
      } else {
        errMsg = "The passwords do not match";
      }
      // se ne manca una diamo un errore
    } else if (!newPassword.length && confirmPassword.length) {
      errMsg = "Missing new password";
    } else if (newPassword.length && !confirmPassword.length) {
      errMsg = "Missing password confirmation";
    }
    if (errMsg) {
      await module.exports.deleteImage(req);
      req.session.error = errMsg;
      return res.redirect("back");
    }
    next();
  },
  destroyFormCookies(req, res, next) {
    const delImgs = [];
    formFields.forEach(n => res.clearCookie(n));
    if (req.params.length)
      for (let i = 0; i < 4; i++) {
        if (req.cookies[`deleteImg${i}`]) {
          res.clearCookie(`deleteImg${i}`);
          delImgs.push(req.cookies[`deleteImg${i}`]);
        }
      }
    res.locals.delImgs = delImgs;
    formFields.forEach(n => (res.locals[n] = req.cookies[n]));
    next();
  },
  validateCampground(req, res, next) {
    const campground = req.method === "PUT" ? req.body.campground : req.body,
      errors = [],
      fields = {};
    formFields.forEach(n => {
      if (campground[n].length) fields[n] = campground[n];
      else errors.push(n);
    });
    if (!errors.length) return next();
    let msg = `You have to provide${errors.length > 1 ? ":" : ""} `,
      i = 0;
    errors.forEach(
      (err, i) =>
        (msg += `${err}${
          i === errors.length - 2
            ? " and "
            : i !== errors.length - 1
            ? ", "
            : ""
        }`)
    );
    formFields.forEach(n => {
      if (fields[n]) res.cookie(n, fields[n]);
    });
    req.session.error = msg;
    res.redirect("back");
  },
  validateComment(req, res, next) {
    if (req.body.comment.text.length) return next();
    req.session.error = "you have to provide the text";
    res.redirect("back");
  },
  async checkCampground(req, res, next) {
    let campground = await Campground.findById(req.params.id);
    if (campground) return next();
    req.session.error = "campground not found";
    res.redirect("/campgrounds");
  },
  // REGISTER POST, PROFILE PUT in caso di errore elimina l'immagine uploadata
  async deleteImage(req) {
    if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
  },
  // validate password reset token
  async validatePasswordResetToken(req, res, next) {
    const { token } = req.params;
    // check if there are users with that token (not expired)
    const user = await User.findOne({ passwordResetToken: token })
      .where("passwordResetExpires")
      .gt(Date.now())
      .exec();
    // if there is not the token, raise an error
    if (!user) {
      req.session.error = "Token invalid or expired";
      return res.redirect("/forgot-password");
    }
    res.locals.user = user;
    next();
  },
  // make the search and filter query if there are filters otherwise, select all the campgrounds
  async searchAndFilterCampgrounds(req, res, next) {
    const keys = Object.keys(req.query);
    // the subqueries are stored here
    const dbQueries = [];
    // if there is something in query string we may have to build a query
    if (keys.length) {
      let {
        search,
        avgRating,
        location,
        distanceObj,
        price,
        features
      } = req.query;
      // if there is a keyword to search with
      if (search) {
        // escape the whole string and convert it to a regex
        search = new RegExp(escapeRegExp(search), "gi");
        // select all the posts where there is the keyword search
        dbQueries.push({
          $or: [
            { name: search },
            { description: search },
            { location: search },
            { place_name: search }
          ]
        });
      }
      // if there are numbers of stars
      if (avgRating) {
        /* add query that selects all the posts whose avgRating is included in the avgRating array of
        the ones specified by the user in the form */
        dbQueries.push({ avgRating: { $in: avgRating } });
      }
      // if there is a base location and a distance
      if (location) {
        // find out the geo coordinates of the location
        const response = await geocodeClient
          .forwardGeocode({ query: location, limit: 1 })
          .send();
        const { coordinates } = response.body.features[0].geometry;
        let { customDistance, distance } = distanceObj;
        // check if a distance or a custom one was provided, otherwise use the default one 25km
        if (customDistance) distance = customDistance;
        else if (!distance) distance = 10;
        // convert the distance to meters from kilometers
        distance *= 1000;
        /* find all the carpgrounds in the nearby (all the campgrounds far from the referement point at the most distance) */
        dbQueries.push({
          geometry: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates
              },
              $maxDistance: distance
            }
          }
        });
      }
      // if there is a price
      if (price) {
        /* build 2 queries if the max is defined select all the campground with that max price if the min is defined
         do the same but with the all the campgrounds with that minimum price SO WE CAN ALSO IMPLEMENT PRICE INTERVALS */
        if (price.min) dbQueries.push({ price: { $gte: price.min } });
        if (price.max) dbQueries.push({ price: { $lte: price.max } });
      }
      // if there are features wanted
      if (features) {
        /* select all the campgrounds with the specified features included
        use the . notation to get access to nested objs */
        let { freeWiFi, hasSwimmingPool, baths, carParking } = features;
        freeWiFi = eval(freeWiFi);
        hasSwimmingPool = eval(hasSwimmingPool);
        if (freeWiFi)
          dbQueries.push({
            "features.freeWiFi": freeWiFi
          });
        if (hasSwimmingPool)
          dbQueries.push({
            "features.hasSwimingPool": hasSwimmingPool
          });
        // eval(require("locus"));
        if (baths) dbQueries.push({ "features.baths": baths });
        if (carParking) dbQueries.push({ "features.carParkings": carParking });
      }
    }
    // build the dbQuery object use undefined instead of {} cuz is simpler to handle in the ifs
    res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : undefined;
    // we want to conserve the form in the view of the results
    res.locals.query = req.query;
    // run the controller
    next();
  }
};
module.exports = middlewareOBJ;
