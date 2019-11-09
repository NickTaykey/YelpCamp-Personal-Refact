// PACKAGES
const express = require("express"),
  Router = express.Router({ mergeParams: true });

// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment");

// MIDDLEWARE
const {
    checkCommentOwnership,
    validateComment
  } = require("../middleware/modelsMiddleware"),
  { isLoggedIn } = require("../middleware/authMiddleware"),
  { asyncErrorHandler } = require("../middleware");

// ========================
// COMMENTS ROUTES
// ========================

// NEW
Router.get(
  "/new",
  isLoggedIn,
  asyncErrorHandler(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (campground) res.render("comments/new", { campground });
    else {
      req.flash("error", "campground not found");
      res.redirect("/campgrounds");
    }
  })
);

// CREATE
Router.post(
  "/",
  isLoggedIn,
  validateComment,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id);
    if (campground) {
      let comment = await Comment.create(req.body.comment);
      comment.author.id = req.user._id;
      comment.author.username = req.user.username;
      await comment.save();
      campground.comments.push(comment);
      await campground.save();
      req.flash("success", "comment successfully added");
      res.redirect("/campgrounds/" + req.params.id);
    } else {
      req.flash("error", "campground not found");
      res.redirect("/campgrounds");
    }
  })
);

// EDIT
Router.get(
  "/:comment_id/edit",
  checkCommentOwnership,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id);
    if (campground) {
      let comment = await Comment.findById(req.params.comment_id);
      if (comment) {
        res.render("comments/edit", {
          campground_id: req.params.id,
          comment
        });
      } else {
        req.flash("error", "comment not found");
        res.redirect("back");
      }
    } else {
      req.flash("error", "campground not found");
      res.redirect("/campgrounds");
    }
  })
);

// UPDATE
Router.put(
  "/:comment_id",
  checkCommentOwnership,
  validateComment,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id);
    if (campground) {
      await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
      req.flash("success", "comment successfully updated");
      res.redirect("/campgrounds/" + req.params.id);
    } else {
      req.flash("error", "campground not found");
      res.redirect("/campgrounds");
    }
  })
);

// DESTROY
Router.delete(
  "/:comment_id",
  checkCommentOwnership,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id);
    if (campground) {
      await Comment.findByIdAndRemove(req.params.comment_id);
      req.flash("success", "comment successfully deleted");
      res.redirect(`/campgrounds/${req.params.id}`);
    } else {
      req.flash("error", "campground not found");
      res.redirect("/campgrounds");
    }
  })
);

module.exports = Router;
