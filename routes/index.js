// PACAKGES
const express = require("express");
const Router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
// multer config
const upload = multer({ storage });

// MIDDLEWARES
const { asyncErrorHandler } = require("../middleware");
const {
  checkIfUserExists,
  checkUserIdentify,
  checkUserPassword,
  setNewPassword,
  isLoggedIn,
  validatePasswordResetToken
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
  profileUpdate,
  forgotGet,
  forgotPut,
  resetGet,
  resetPut
} = require("../controllers");

// LANDING
Router.get("/", asyncErrorHandler(landing));

// REGISTER GET
Router.get("/register", registerGet);

// REGISTER POST
Router.post("/register", upload.single("image"), registerPost);

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
  upload.single("image"),
  asyncErrorHandler(checkUserPassword),
  asyncErrorHandler(setNewPassword),
  asyncErrorHandler(profileUpdate)
);

// PASSWORD RESET ROUTES

// GET render forgot password form
Router.get("/forgot-password", forgotGet);
// PUT process data from the former form, send an email with a token
Router.put("/forgot-password", asyncErrorHandler(forgotPut));
// GET validate token to render reset form
Router.get(
  "/reset-password/:token",
  asyncErrorHandler(validatePasswordResetToken),
  asyncErrorHandler(resetGet)
);
// PUT process reset form data and change the password
Router.put(
  "/reset-password/:token",
  asyncErrorHandler(validatePasswordResetToken),
  asyncErrorHandler(resetPut)
);

module.exports = Router;
