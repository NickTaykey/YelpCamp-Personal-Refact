// PACKAGES
const express = require("express");
const router = express.Router();
const { storage } = require("../cloudinary");
const multer = require("multer");

// MULTER CONFIG
const upload = multer({ storage });

// CONTROLLERS
const {
  indexCampground,
  showCampground,
  newCampground,
  createCampground,
  editCampground,
  updateCampground,
  destroyCampground
} = require("../controllers/campgrounds");

// MIDDLEWARE
const {
    checkUserOwnership,
    destroyFormCookies,
    validateCampground,
    isLoggedIn,
    checkCampground,
    searchAndFilterCampgrounds
  } = require("../middleware/modelsMiddleware"),
  { asyncErrorHandler } = require("../middleware");

// INDEX
router.get(
  "/",
  asyncErrorHandler(searchAndFilterCampgrounds),
  asyncErrorHandler(indexCampground)
);

// NEW
router.get("/new", isLoggedIn, destroyFormCookies, newCampground);

// SHOW
router.get("/:id", checkCampground, asyncErrorHandler(showCampground));

// CREATE
router.post(
  "/",
  isLoggedIn,
  upload.array("images", 4),
  asyncErrorHandler(validateCampground),
  asyncErrorHandler(createCampground)
);

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  checkCampground,
  asyncErrorHandler(checkUserOwnership),
  destroyFormCookies,
  asyncErrorHandler(editCampground)
);

// UPDATE
router.put(
  "/:id",
  isLoggedIn,
  checkCampground,
  asyncErrorHandler(checkUserOwnership),
  upload.array("images", 4),
  asyncErrorHandler(validateCampground),
  asyncErrorHandler(updateCampground)
);

// DESTROY
router.delete(
  "/:id",
  isLoggedIn,
  checkCampground,
  asyncErrorHandler(checkUserOwnership),
  asyncErrorHandler(destroyCampground)
);

module.exports = router;
