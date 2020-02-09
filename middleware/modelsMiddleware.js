// MODELS
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const User = require("../models/user");
const { cloudinary } = require("../cloudinary");

// campground fields
const formFields = ["name", "price", "description", "location"];

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
  }
};
module.exports = middlewareOBJ;
