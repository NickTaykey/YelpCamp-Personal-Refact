// PACKAGES
const passport = require("passport");
const util = require("util");
const { cloudinary } = require("../cloudinary");
// MODELS
const User = require("../models/user");
const Comment = require("../models/comment");
const Campground = require("../models/campground");
// MIDLEWARES
const { deleteImage } = require("../middleware/modelsMiddleware");

module.exports = {
  landing: async (req, res, next) => {
    let campgrounds = await Campground.find();
    res.render("landing", { campgrounds });
  },
  registerGet: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/campgrounds");
    }
    res.render("register", { username: "", email: "" });
  },
  registerPost: async (req, res, next) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email
    });
    if (req.file) {
      newUser.image = {
        secure_url: req.file.secure_url,
        public_id: req.file.public_id
      };
    }
    try {
      let user = await User.register(newUser, req.body.password);
      passport.authenticate("local")(req, res, () => {
        req.session.success = `Wellcome on YelpCamp ${user.username}!`;
        const url = req.session.url ? req.session.url : "/campgrounds";
        delete req.session.url;
        res.redirect(url);
      });
    } catch (err) {
      await deleteImage(req);
      let error = err.message;
      if (
        error.includes("E11000 duplicate key error collection") &&
        error.includes("email_1 dup key:")
      ) {
        error = "Another user is registered with this email";
      }
      res.render("register", {
        error,
        username: req.body.username,
        email: req.body.email
      });
    }
  },
  loginGet: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/campgrounds");
    }
    res.render("login", { username: "" });
  },
  loginPost: async (req, res, next) => {
    const { username, password } = req.body;
    const { err, user } = await User.authenticate()(username, password);
    if (!err && user) {
      req.login(user, function() {
        req.session.success = `Welcome back ${username}!`;
        const url = req.session.url ? req.session.url : "/campgrounds";
        delete req.session.url;
        res.redirect(url);
      });
    } else if (!user) {
      const error = "Invalid username or password!";
      res.render("login", { error, username });
    } else next(err);
  },
  logout: (req, res, next) => {
    req.logout();
    req.session.success = "You are logged out!";
    res.redirect("/campgrounds");
  },
  profileGet: async (req, res, next) => {
    const user = res.locals.user;
    let campgrounds = await Campground.find({}, null, { sort: { _id: -1 } })
      .where("author")
      .equals(user._id)
      .populate("comments")
      .exec();
    let comments = await Comment.find({}, null, { sort: { _id: -1 } })
      .where("author")
      .equals(user._id)
      .exec();
    const avgRatings = [];
    for (let c of campgrounds) {
      avgRatings.push(await c.calcAvgRating());
    }
    res.render("profile", { campgrounds, comments, avgRatings });
  },
  profileEdit(req, res, next) {
    res.render("editProfile");
  },
  async profileUpdate(req, res, next) {
    const { user } = res.locals;
    const { username, email } = req.body;
    try {
      if (username && username.length) user.username = username;
      if (email && email.length) user.email = email;
      await user.save();
    } catch (e) {
      await deleteImage(req);
      let msg;
      if (
        e.message.includes(
          "E11000 duplicate key error collection: YelpCamp_user_profile.users index: email_1 dup key:"
        )
      ) {
        msg = "E-mail alerady in use";
      } else {
        msg = "Username alerady in use";
      }
      req.session.error = msg;
      return res.redirect(`/users/${req.user.username}/edit`);
    }
    if (req.file) {
      // eliminiamo l'immagine attuale
      if (user.image.public_id)
        await cloudinary.v2.uploader.destroy(user.image.public_id);
      // settiamo nel DB quella nuova
      user.image = {
        secure_url: req.file.secure_url,
        public_id: req.file.public_id
      };
    }
    // ri autentichiamo l'utente (nel caso dello username aggiornato la sessione attuale nn è più valida)
    const login = util.promisify(req.login.bind(req));
    await login(user);
    req.session.success = "profile successfully updated!";
    res.redirect(`/users/${user.username}/edit`);
  }
};
