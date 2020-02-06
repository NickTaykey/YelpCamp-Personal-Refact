// MODELS
const Campground = require("../models/campground");
const Comment = require("../models/comment");

// campground fields
const formFields = ["name", "price", "description", "location"];

const middlewareOBJ = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.url = req.originalUrl;
    req.session.error = "You need to be logged in to do that";
    res.redirect("/login");
  },
  async checkUserOwnership(req, res, next) {
    let campground = await Campground.findById(req.params.id);
    if (campground && campground.author.equals(req.user._id)) {
      res.locals.campground = campground;
      return next();
    }
    req.session.error = "You don't have the permissions to do that";
    res.redirect("back");
  },
  async checkCommentOwnership(req, res, next) {
    let comment = await Comment.findById(req.params.comment_id);
    if (comment && comment.author.equals(req.user._id)) {
      res.locals.comment = comment;
      return next();
    }
    req.session.error = "you don't have the permision to do that";
    res.redirect("back");
  },
  destroyFormCookies(req, res, next) {
    const delImgs = [];
    formFields.forEach(n => res.clearCookie(n));
    if (req.params.length)
      for (let i = 0; i < 4; i++) {
        if (req.cookies[`deleteImg${i}`]) {
          res.clearCookie(`deleteImg${i}`);
          delImgs.push(req.cookies[`deleteImg${i}`]);
        }
      }
    res.locals.delImgs = delImgs;
    formFields.forEach(n => (res.locals[n] = req.cookies[n]));
    next();
  },
  validateCampground(req, res, next) {
    const campground = req.method === "PUT" ? req.body.campground : req.body,
      errors = [],
      fields = {};
    formFields.forEach(n => {
      if (campground[n].length) fields[n] = campground[n];
      else errors.push(n);
    });
    if (!errors.length) return next();
    let msg = `You have to provide${errors.length > 1 ? ":" : ""} `,
      i = 0;
    errors.forEach(
      (err, i) =>
        (msg += `${err}${
          i === errors.length - 2
            ? " and "
            : i !== errors.length - 1
            ? ", "
            : ""
        }`)
    );
    formFields.forEach(n => {
      if (fields[n]) res.cookie(n, fields[n]);
    });
    req.session.error = msg;
    res.redirect("back");
  },
  validateComment(req, res, next) {
    if (req.body.comment.text.length) return next();
    req.session.error = "you have to provide the text";
    res.redirect("back");
  },
  async checkCampground(req, res, next) {
    let campground = await Campground.findById(req.params.id);
    if (campground) return next();
    req.session.error = "campground not found";
    res.redirect("/campgrounds");
  }
};
module.exports = middlewareOBJ;
