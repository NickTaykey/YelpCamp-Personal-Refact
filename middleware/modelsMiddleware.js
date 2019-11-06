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
    const context = req.method === "PUT" ? true : false;
    if (req.files.length) {
      // iteriamo su req.files
      for (const file of req.files) {
        // se il file non è valido facciamo redirect con flash msg
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          const campgroud = context ? req.body.campground : req.body;
          // settaggio dei cookie
          res.cookie("name", campgroud.name);
          res.cookie("description", campgroud.description);
          res.cookie("price", campgroud.price);
          if (context) {
            let i = 0;
            for (const delImg of req.body.deleteImages) {
              res.cookie(`deleteImg${i}`, delImg);
              i++;
            }
          }
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
    } else if (!context) {
      // settaggio dei cookie
      res.cookie("name", req.body.name);
      res.cookie("description", req.body.description);
      res.cookie("price", req.body.price);
      req.flash("error", "You have to provvide at least one image! ");
      return res.redirect("back");
    } else next();
  },
  destroyFormCookies(req, res, next) {
    res.clearCookie("name");
    res.clearCookie("description");
    res.clearCookie("price");
    let delImgs = [];
    if (req.path.split("/")[2] === "edit")
      for (let i = 0; i < 4; i++) {
        if (req.cookies[`deleteImg${i}`]) {
          res.clearCookie(`deleteImg${i}`);
          delImgs.push(req.cookies[`deleteImg${i}`]);
        }
      }
    res.locals.delImgs = delImgs;
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
