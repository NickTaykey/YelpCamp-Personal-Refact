// PACAKGES
const fs = require("fs");

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
  },
  validateImgs(req, res, next) {
    if (req.files.length) {
      // iteriamo su req.files
      for (const file of req.files) {
        // se il file non è valido facciamo redirect con flash msg
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          // settaggio dei cookie
          res.cookie("name", req.body.name);
          res.cookie("description", req.body.description);
          res.cookie("price", req.body.price);
          // redirect con flash message
          req.flash(
            "error",
            "Only image files jpg, jpeg, png, or gif are allowed! "
          );
          return res.redirect("back");
        }
      }
      // se tutti i file sono validi invochiamo next
      next();
    } else {
      // settaggio dei cookie
      res.cookie("name", req.body.name);
      res.cookie("description", req.body.description);
      res.cookie("price", req.body.price);
      req.flash("error", "You have to provvide at least one image! ");
      return res.redirect("back");
    }
  },
  destroyFormCookies(req, res, next) {
    res.clearCookie("name");
    res.clearCookie("description");
    res.clearCookie("price");
    res.locals.name = req.cookies.name;
    res.locals.description = req.cookies.description;
    res.locals.price = req.cookies.price;
    next();
  },
  deleteImages(req, res, next) {
    for (const file of req.files) {
      fs.unlinkSync(file.path);
    }
  }
};
module.exports = middlewareOBJ;
