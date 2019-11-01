// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment");

let isLoggedIn = (req, res) => {
  if (req.isAuthenticated()) return true;
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

let middlewareOBJ = {
  async checkUserOwnership(req, res, next) {
    if (isLoggedIn(req, res)) {
      let campgroud = await Campground.findById(req.params.id);
      if (campgroud && campgroud.author.id.equals(req.user._id)) return next();
      req.flash("error", "You don't have the permissions to do that");
      res.redirect("back");
    }
  },
  async checkCommentOwnership(req, res, next) {
    if (isLoggedIn(req, res)) {
      let comment = await Comment.findById(req.params.comment_id);
      if (comment && comment.author.id.equals(req.user._id)) return next();
      req.flash("error", "you don't have the permision to do that");
      res.redirect("back");
    }
  }
};
module.exports = middlewareOBJ;
