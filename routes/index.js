// PACAKGES
const express = require("express");
const Router = express.Router();

// MIDDLEWARES
const { asyncErrorHandler } = require("../middleware/index");

// CONTROLLERS
const {
  landing,
  loginGet,
  loginPost,
  registerGet,
  registerPost,
  logout
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

module.exports = Router;
