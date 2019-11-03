// PACKAGES
const express = require("express"),
  router = express.Router(),
  multer = require("multer"),
  cloudinary = require("cloudinary");

// MULTER CONFIG
const upload = multer({ dest: "uploads/" });
// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: "dmxuerbxv",
  api_key: "529692727915557",
  api_secret: process.env.CLOUDINARY_SECRET
});

// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment");

// MIDDLEWARE
const {
    checkUserOwnership,
    validateImgs,
    destroyFormCookies,
    deleteImages
  } = require("../middleware/modelsMiddleware"),
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
router.get("/new", destroyFormCookies, isLoggedIn, (req, res, next) =>
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
  upload.array("images", 4),
  validateImgs,
  asyncErrorHandler(async (req, res, next) => {
    let { name, description, price } = req.body;
    let newCampGround = {
      name,
      description,
      price,
      author: { username: req.user.username, id: req.user._id }
    };
    newCampGround.images = [];
    for (const file of req.files) {
      // upload
      let img = await cloudinary.v2.uploader.upload(file.path);
      // associazione
      newCampGround.images.push({
        url: img.secure_url,
        public_id: img.public_id
      });
    }
    // creiamo il campground
    let newCamp = await Campground.create(newCampGround);
    req.flash("success", newCamp.name + " successfully created");
    res.redirect("/campgrounds");
    next();
  }),
  deleteImages
);

// EDIT
router.get(
  "/:id/edit",
  checkUserOwnership,
  destroyFormCookies,
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
  upload.array("images", 4),
  validateImgs,
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
    // eliminiamo i commenti del campground
    for (const id of campground.comments) {
      await Comment.findByIdAndRemove(id);
    }
    // eliminiamo le foto del campground
    for (const img of campground.images) {
      await cloudinary.v2.uploader.destroy(img.public_id);
    }
    req.flash("success", "campground successfully deleted");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
