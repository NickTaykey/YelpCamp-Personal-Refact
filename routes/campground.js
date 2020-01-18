// PACKAGES
const express = require("express"),
  router = express.Router(),
  // config obj for multer-cloudinary package (WE DO NOT NEED CLOUDINARY HERE)
  { storage, cloudinary } = require("../cloudinary"),
  multer = require("multer"),
  mapbox = require("@mapbox/mapbox-sdk/services/geocoding");

// MULTER CONFIG
const upload = multer({ storage });
// MAPBOX CONFIG with the new storage engine (multer-cloudinary)
let geocodeClient = mapbox({ accessToken: process.env.MAPBOX_TOKEN });

// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment"),
  User = require("../models/user");

// MIDDLEWARE
const {
    checkUserOwnership,
    destroyFormCookies,
    validateCampground,
    isLoggedIn,
    checkCampground
    // validateLocation
  } = require("../middleware/modelsMiddleware"),
  { asyncErrorHandler } = require("../middleware");

// INDEX
router.get(
  "/",
  asyncErrorHandler(async (req, res, next) => {
    let campgrounds = await Campground.paginate(
      {},
      { limit: 8, page: req.query.page || 1, sort: "-_id" }
    );
    campgrounds.page = Number(campgrounds.page);
    campgrounds.pages = Number(campgrounds.pages);
    res.render("campgrounds", { campgrounds });
  })
);

// NEW
router.get("/new", isLoggedIn, destroyFormCookies, (req, res, next) => {
  res.render("campgrounds/new");
});

// SHOW
router.get(
  "/:id",
  checkCampground,
  asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id;
    let campground = await Campground.findById(id).populate({
      path: "comments author",
      options: { sort: "-_id" }
    });
    let floorRating = await campground.calcAvgRating();
    res.render("campgrounds/show", { campground, floorRating });
  })
);

// CREATE
router.post(
  "/",
  isLoggedIn,
  upload.array("images", 4),
  asyncErrorHandler(validateCampground),
  // validateLocation,
  asyncErrorHandler(async (req, res, next) => {
    let { name, description, price, location } = req.body;
    let newCampGround = {
      name,
      description,
      price,
      location,
      geometry: {},
      propeties: {},
      author: req.user._id
    };
    newCampGround.images = [];
    for (const img of req.files) {
      // remove upload images lines because the images has already been uploaded by multer-cloudinary
      newCampGround.images.push({
        url: img.secure_url,
        public_id: img.public_id
      });
    }
    // find out the coordinates of the location
    let response = await geocodeClient
      .forwardGeocode({ query: location, limit: 1 })
      .send();
    // associate the coordinate found through the API to the DB
    newCampGround.geometry.coordinates =
      response.body.features[0].geometry.coordinates;
    newCampGround.geometry.type = "Point";
    newCampGround.location = newCampGround.location;
    newCampGround.placeName = response.body.features[0].place_name;
    let newCamp = new Campground(newCampGround);
    newCamp.properties.description = `<h5><img src='${newCamp.images[0].url}' style="max-width: 220px;"><a href='/campgrounds/${newCamp.id}'>${newCamp.name}</a></h5><strong>${newCamp.price}</strong>$ per night<br>${newCamp.placeName}, ${newCamp.location}`;

    await newCamp.save();
    req.session.success = `${newCamp.name} successfully created`;
    res.redirect("/campgrounds");
    next();
  })
);

// EDIT
router.get(
  "/:id/edit",
  checkCampground,
  checkUserOwnership,
  destroyFormCookies,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

// UPDATE
router.put(
  "/:id",
  checkUserOwnership,
  upload.array("images", 4),
  asyncErrorHandler(validateCampground),
  // validateLocation,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findById(req.params.id),
      bodyCampground = req.body.campground,
      deleteImages = req.body.deleteImages;
    if (deleteImages) {
      for (const public_id of deleteImages) {
        await cloudinary.v2.uploader.destroy(public_id);
        let i = 0;
        for (const img of campground.images) {
          if (img.public_id === public_id) {
            campground.images.splice(i, 1);
            break;
          }
          i++;
        }
      }
    }
    for (const img of req.files) {
      // cloudinary uploaded commented out ALREADY DONE BY multer-cloudinary
      campground.images.push({
        url: img.secure_url,
        public_id: img.public_id
      });
    }
    // checkout if the location has changes
    if (bodyCampground.location !== campground.location) {
      // if yes find out the new coordinates
      let response = await geocodeClient
        .forwardGeocode({ query: bodyCampground.location, limit: 1 })
        .send();
      // associate them and the location to the database
      campground.name = bodyCampground.name;
      campground.price = bodyCampground.price;
      campground.description = bodyCampground.description;
      campground.location = bodyCampground.location;
      campground.geometry.coordinates =
        response.body.features[0].geometry.coordinates;
      campground.placeName = response.body.features[0].place_name;
      campground.properties.description = `<h5><img src='${campground.images[0].url}' style="max-width: 220px;"><a href='/campgrounds/${campground.id}'>${campground.name}</a></h5><strong>${campground.price}</strong>$ per night<br>${campground.placeName}, ${campground.location}`;
    }
    ["name", "price", "description"].forEach(
      n => (campground[n] = bodyCampground[n])
    );
    await campground.save();
    req.session.success = "Campground successfully updated";
    res.redirect(`/campgrounds/${req.params.id}`);
    next();
  })
);

// DESTROY
router.delete(
  "/:id",
  checkUserOwnership,
  asyncErrorHandler(async (req, res, next) => {
    let campground = await Campground.findByIdAndRemove(req.params.id);
    for (const id of campground.comments) await Comment.findByIdAndRemove(id);
    for (const img of campground.images)
      await cloudinary.v2.uploader.destroy(img.public_id);
    req.session.success = "campground successfully deleted";
    res.redirect("/campgrounds");
  })
);

module.exports = router;
