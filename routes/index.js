// PACAKGES
const express = require("express");
const Router = express.Router();

// MIDDLEWARES
const { asyncErrorHandler } = require("../middleware");
const {
  checkIfUserExists,
  checkUserIdentify,
  checkUserPassword,
  setNewPassword,
  isLoggedIn
} = require("../middleware/modelsMiddleware");

// CONTROLLERS
const {
  landing,
  loginGet,
  loginPost,
  registerGet,
  registerPost,
  logout,
  profileGet,
  profileEdit,
  profileUpdate
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

// PROFILE EDIT
Router.get(
  "/users/:username/edit",
  isLoggedIn,
  asyncErrorHandler(checkUserIdentify),
  profileEdit
);

// PROFILE UPDATE
Router.put(
  "/users/:username",
  isLoggedIn,
  asyncErrorHandler(checkUserIdentify),
  asyncErrorHandler(checkUserPassword),
  asyncErrorHandler(setNewPassword),
  asyncErrorHandler(profileUpdate)
);

module.exports = Router;
