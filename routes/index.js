// PACAKGES
const express = require("express"),
  passport = require("passport"),
  Router = express.Router();

// MODELS
const User = require("../models/user");

// ROUTES

// LANDING
Router.get("/", (req, res, next) => res.render("landing"));

// =======================
// AUTH ROUTES
// =======================

// SIGNUP FORM
Router.get("/register", (req, res, next) => res.render("register"));

// SIGNUP CODE
Router.post("/register", async (req, res, next) => {
  const newUser = new User({
    username: req.body.username
  });
  try {
    let user = await User.register(newUser, req.body.password);
    passport.authenticate("local")(req, res, () => {
      req.flash("success", `wellcome on YelpCamp ${user.username}!`);
      res.redirect("/campgrounds");
    });
  } catch (err) {
    req.flash("error", err.message);
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
  req.flash("success", "You are logged out!");
  res.redirect("back");
});

module.exports = Router;
