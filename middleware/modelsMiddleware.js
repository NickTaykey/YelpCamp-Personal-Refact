// PACAKGES
const fs = require("fs");

// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment");

// campground fields
const formFields = ["name", "price", "description", "location"];

let isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return typeof next === "boolean" ? next : next();
    req.session.error = "You need to be logged in to do that";
    res.redirect("/login");
  },
  deleteImages = (req, res, next) => {
    for (const file of req.files) fs.unlinkSync(file.path);
  };
let middlewareOBJ = {
  async checkUserOwnership(req, res, next) {
    if (isLoggedIn(req, res, true)) {
      let campgroud = await Campground.findById(req.params.id);
      if (campgroud && campgroud.author.id.equals(req.user._id)) return next();
      req.session.error = "You don't have the permissions to do that";
      res.redirect("back");
    }
  },
  async checkCommentOwnership(req, res, next) {
    if (isLoggedIn(req, res, true)) {
      let comment = await Comment.findById(req.params.comment_id);
      if (comment && comment.author.id.equals(req.user._id)) return next();
      req.session.error = "you don't have the permision to do that";
      res.redirect("back");
    }
  },
  validateImgs(req, res, next) {
    const context = req.method === "PUT" ? true : false;
    if (req.files.length) {
      for (const file of req.files) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          const campgroud = context ? req.body.campground : req.body;
          formFields.forEach(n => res.cookie(n, campgroud[n]));
          if (context)
            req.body.deleteImages.forEach((delImg, i) =>
              res.cookie(`deleteImg${i}`, delImg)
            );
          deleteImages(req, res, next);
          req.session.error =
            "Only image files jpg, jpeg, png, or gif are allowed! ";

          return res.redirect("back");
        }
      }
      next();
    } else if (!context) {
      formFields.forEach(n => res.cookie(n, req.body[n]));
      req.session.error = "You have to provvide at least one image! ";
      return res.redirect("back");
    } else next();
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
  deleteImages,
  isLoggedIn,
  // middleware to validate a campground
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
    deleteImages(req, res, next);
    req.session.error = msg;
    res.redirect("back");
  },
  validateComment(req, res, next) {
    if (req.body.comment.text.length) return next();
    req.session.error = "you have to provide the text";
    res.redirect("back");
  },
  async checkCampground(req, res, next) {
    let campgroud = await Campground.findById(req.params.id);
    if (campgroud) return next();
    req.session.error = "campground not found";
    res.redirect("/campgrounds");
  }
};
module.exports = middlewareOBJ;
