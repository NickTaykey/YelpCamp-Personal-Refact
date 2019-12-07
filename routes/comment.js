// PACKAGES
const express = require("express"),
  Router = express.Router({ mergeParams: true });

// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment");

// MIDDLEWARE
const {
    checkCommentOwnership,
    checkCampground,
    validateComment,
    isLoggedIn
  } = require("../middleware/modelsMiddleware"),
  { asyncErrorHandler } = require("../middleware");

// ========================
// COMMENTS ROUTES
// ========================

// NEW
Router.get(
  "/new",
  isLoggedIn,
  checkCampground,
  asyncErrorHandler(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("comments/new", { campground });
  })
);

// CREATE
Router.post(
  "/",
  isLoggedIn,
  checkCampground,
  validateComment,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id),
      comment = await Comment.create(req.body.comment);
    comment.author.id = req.user._id;
    comment.author.username = req.user.username;
    await comment.save();
    campground.comments.push(comment);
    await campground.save();
    req.session.success = "comment successfully added";
    res.redirect("/campgrounds/" + req.params.id);
  })
);

// EDIT
Router.get(
  "/:comment_id/edit",
  checkCampground,
  checkCommentOwnership,
  asyncErrorHandler(async (req, res, next) => {
    let comment = await Comment.findById(req.params.comment_id);
    res.render("comments/edit", {
      campground_id: req.params.id,
      comment
    });
  })
);

// UPDATE
Router.put(
  "/:comment_id",
  checkCampground,
  checkCommentOwnership,
  validateComment,
  asyncErrorHandler(async (req, res, next) => {
    await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
    req.session.success = "comment successfully updated";
    res.redirect("/campgrounds/" + req.params.id);
  })
);

// DESTROY
Router.delete(
  "/:comment_id",
  checkCampground,
  checkCommentOwnership,
  asyncErrorHandler(async (req, res, next) => {
    await Comment.findByIdAndRemove(req.params.comment_id);
    req.session.success = "comment successfully deleted";
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

module.exports = Router;
