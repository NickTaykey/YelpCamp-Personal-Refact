// PACKAGES
const passport = require("passport");
// MODELS
const User = require("../models/user");
const Campground = require("../models/campground");
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
    try {
      let user = await User.register(newUser, req.body.password);
      passport.authenticate("local")(req, res, () => {
        req.session.success = `Wellcome on YelpCamp ${user.username}!`;
        const url = req.session.url ? req.session.url : "/campgrounds";
        delete req.session.url;
        res.redirect(url);
      });
    } catch (err) {
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
  }
};
