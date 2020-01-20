// PACAKGES
const express = require("express"),
  passport = require("passport"),
  Router = express.Router();

// MODELS
const User = require("../models/user");
const Campground = require("../models/campground");

// MIDDLEWARES
const { asyncErrorHandler } = require("../middleware/index");

// ROUTES

// LANDING
Router.get(
  "/",
  asyncErrorHandler(async (req, res, next) => {
    let campgrounds = await Campground.find();
    res.render("landing", { campgrounds });
  })
);

// =======================
// AUTH ROUTES
// =======================

// SIGNUP FORM
Router.get("/register", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/campgrounds");
  }
  res.render("register", { username: "", email: "" });
});

// SIGNUP CODE
Router.post("/register", async (req, res, next) => {
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
});

// LOGIN FORM
Router.get("/login", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/campgrounds");
  }
  res.render("login", { username: "" });
});

// LOGIN CODE
Router.post(
  "/login",
  asyncErrorHandler(async (req, res, next) => {
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
  })
);

// LOGOUT
Router.get("/logout", (req, res, next) => {
  req.logout();
  req.session.success = "You are logged out!";
  res.redirect("/campgrounds");
});

module.exports = Router;
