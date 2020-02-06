// PACKAGES
const express = require("express");
const Router = express.Router({ mergeParams: true });

// MIDDLEWARE
const {
  checkCommentOwnership,
  checkCampground,
  validateComment,
  isLoggedIn
} = require("../middleware/modelsMiddleware");
const { asyncErrorHandler } = require("../middleware");

// CONTROLLERS
const {
  newComment,
  createComment,
  editComment,
  updateComment,
  destroyComment
} = require("../controllers/comments");

// NEW
Router.get("/new", isLoggedIn, checkCampground, asyncErrorHandler(newComment));

// CREATE
Router.post(
  "/",
  isLoggedIn,
  checkCampground,
  validateComment,
  asyncErrorHandler(createComment)
);

// EDIT
Router.get(
  "/:comment_id/edit",
  checkCampground,
  asyncErrorHandler(checkCommentOwnership),
  asyncErrorHandler(editComment)
);

// UPDATE
Router.put(
  "/:comment_id",
  checkCampground,
  asyncErrorHandler(checkCommentOwnership),
  validateComment,
  asyncErrorHandler(updateComment)
);

// DESTROY
Router.delete(
  "/:comment_id",
  checkCampground,
  asyncErrorHandler(checkCommentOwnership),
  asyncErrorHandler(destroyComment)
);

module.exports = Router;
