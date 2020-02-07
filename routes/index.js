// PACAKGES
const express = require("express");
const Router = express.Router();

// MIDDLEWARES
const { asyncErrorHandler } = require("../middleware");
const { checkIfUserExists } = require("../middleware/modelsMiddleware");

// CONTROLLERS
const {
  landing,
  loginGet,
  loginPost,
  registerGet,
  registerPost,
  logout,
  profileGet
} = require("../controllers");

// LANDING
Router.get("/", asyncErrorHandler(landing));

// REGISTER GET
Router.get("/register", registerGet);

// REGISTER POST
Router.post("/register", registerPost);

// LOGIN GET
Router.get("/login", loginGet);

// LOGIN POST
Router.post("/login", asyncErrorHandler(loginPost));

// LOGOUT
Router.get("/logout", logout);

// PROFILE GET
Router.get(
  "/users/:username",
  asyncErrorHandler(checkIfUserExists),
  asyncErrorHandler(profileGet)
);

module.exports = Router;
