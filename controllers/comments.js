// MODELS
const Campground = require("../models/campground");
const Comment = require("../models/comment");
module.exports = {
  newComment: async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("comments/new", { campground });
  },
  createComment: async (req, res, next) => {
    let campground = await Campground.findById(req.params.id),
      comment = await Comment.create(req.body.comment);
    comment.campgroundName = campground.name;
    comment.author = req.user._id;
    await comment.save();
    campground.comments.push(comment);
    await campground.save();
    req.session.success = "comment successfully added";
    res.redirect("/campgrounds/" + req.params.id);
  },
  editComment: async (req, res, next) => {
    res.render("comments/edit", {
      campground_id: req.params.id,
      comment: res.locals.comment
    });
  },
  updateComment: async (req, res, next) => {
    await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
    req.session.success = "comment successfully updated";
    res.redirect("/campgrounds/" + req.params.id);
  },
  destroyComment: async (req, res, next) => {
    let { comment } = res.locals;
    await comment.remove();
    req.session.success = "comment successfully deleted";
    res.redirect(`/campgrounds/${req.params.id}`);
  }
};
