// PACKAGES
const express = require("express"),
  router = express.Router();

// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment");

// MIDDLEWARE
const { checkUserOwnership } = require("../middleware/modelsMiddleware"),
  { isLoggedIn } = require("../middleware/authMiddleware"),
  { asyncErrorHandler } = require("../middleware");

// INDEX
router.get(
  "/",
  asyncErrorHandler(async (req, res, next) => {
    let campgrounds = await Campground.find();
    res.render("campgrounds", { campgrounds });
  })
);

// NEW
router.get("/new", isLoggedIn, (req, res, next) =>
  res.render("campgrounds/new")
);

// SHOW
router.get(
  "/:id",
  asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id;
    let campground = await Campground.findById(id).populate("comments");
    if (campground) res.render("campgrounds/show", { campground });
    else {
      req.flash("error", "campground not found");
      res.redirect("/campgrounds");
    }
  })
);

// CREATE
router.post(
  "/",
  isLoggedIn,
  asyncErrorHandler(async (req, res, next) => {
    let { name, image, description, price } = req.body;
    let newCampGround = {
      name,
      image,
      description,
      price,
      author: { username: req.user.username, id: req.user._id }
    };
    let newCamp = await Campground.create(newCampGround);
    req.flash("success", newCamp.name + " successfully created");
    res.redirect("/campgrounds");
  })
);

// EDIT
router.get(
  "/:id/edit",
  checkUserOwnership,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id);
    if (campground) res.render("campgrounds/edit", { campground });
    else {
      req.flash("error", "campground not found");
      res.redirect("/campgrounds");
    }
  })
);

// UPDATE
router.put(
  "/:id",
  checkUserOwnership,
  asyncErrorHandler(async (req, res, next) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    req.flash("success", "Campground successfully updated");
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

// DESTROY
router.delete(
  "/:id",
  checkUserOwnership,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findByIdAndRemove(req.params.id);
    campground.comments.forEach(
      async id => await Comment.findByIdAndRemove(id)
    );
    req.flash("success", "campground successfully deleted");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
