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
Router.get("/register", (req, res, next) => res.render("register"));

// SIGNUP CODE
Router.post("/register", async (req, res, next) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email
  });
  try {
    let user = await User.register(newUser, req.body.password);
    passport.authenticate("local")(req, res, () => {
      req.session.success = `wellcome on YelpCamp ${user.username}!`;
      res.redirect("/campgrounds");
    });
  } catch (err) {
    req.session.error = err.message;
    return res.redirect("/register");
  }
});

// LOGIN FORM
Router.get("/login", (req, res, next) => res.render("login"));

// LOGIN CODE
Router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  })
);

// LOGOUT
Router.get("/logout", (req, res, next) => {
  req.logout();
  req.session.success = "You are logged out!";
  res.redirect("back");
});

module.exports = Router;
