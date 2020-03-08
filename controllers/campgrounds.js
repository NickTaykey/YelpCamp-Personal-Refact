// PCACKAGES
const mapbox = require("@mapbox/mapbox-sdk/services/geocoding");
const { cloudinary } = require("../cloudinary");
let geocodeClient = mapbox({ accessToken: process.env.MAPBOX_TOKEN });

// MODELS
const Campground = require("../models/campground"),
  Comment = require("../models/comment");

module.exports = {
  indexCampground: async (req, res, next) => {
    // use the query provided by searchAndFilter middleware to retrive the campgrounds from the DB
    const { dbQuery } = res.locals;
    let campgrounds = await Campground.paginate(dbQuery, {
      limit: 8,
      page: req.query.page || 1,
      sort: "-_id"
    });
    // set "not found" err message if there was a query and no campgrounds found
    if (!campgrounds.docs.length && dbQuery)
      res.locals.error = "Campgrounds not found for this query!";
    // set a successfull message if the query produced results (only if we are at the first page of the research)
    else if (campgrounds.docs.length && dbQuery)
      res.locals.success = `${campgrounds.total} Campgrounds found!`;
    campgrounds.page = Number(campgrounds.page);
    campgrounds.pages = Number(campgrounds.pages);
    delete res.locals.dbQuery; // delete the dbQuery to save space
    res.render("campgrounds", { campgrounds });
  },
  newCampground: (req, res, next) => {
    res.render("campgrounds/new");
  },
  showCampground: async (req, res, next) => {
    const id = req.params.id;
    let campground = await Campground.findById(id).populate({
      path: "comments author",
      options: { sort: "-_id" }
    });
    let floorRating = await campground.calcAvgRating();
    res.render("campgrounds/show", { campground, floorRating });
  },
  createCampground: async (req, res, next) => {
    let {
      name,
      description,
      price,
      location,
      baths,
      freeWiFi,
      carParkings,
      hasSwimingPool
    } = req.body;
    let newCampGround = {
      name,
      description,
      price,
      location,
      geometry: {},
      propeties: {},
      author: req.user._id,
      features: {
        baths,
        freeWiFi: eval(freeWiFi) ? true : false,
        carParkings,
        hasSwimingPool: eval(hasSwimingPool) ? true : false
      }
    };
    newCampGround.images = [];
    for (const img of req.files) {
      newCampGround.images.push({
        url: img.secure_url,
        public_id: img.public_id
      });
    }
    let response = await geocodeClient
      .forwardGeocode({ query: location, limit: 1 })
      .send();
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
  },
  editCampground: async (req, res, next) => {
    res.render("campgrounds/edit", { campground: res.locals.campground });
  },
  updateCampground: async (req, res, next) => {
    let { campground } = res.locals,
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
      campground.images.push({
        url: img.secure_url,
        public_id: img.public_id
      });
    }
    if (bodyCampground.location !== campground.location) {
      let response = await geocodeClient
        .forwardGeocode({ query: bodyCampground.location, limit: 1 })
        .send();
      campground.name = bodyCampground.name;
      campground.price = bodyCampground.price;
      campground.description = bodyCampground.description;
      campground.location = bodyCampground.location;
      campground.features = {
        baths,
        freeWiFi: eval(bodyCampground.freeWiFi) ? true : false,
        carParkings,
        hasSwimingPool: eval(bodyCampground.hasSwimingPool) ? true : false
      };
      campground.geometry.coordinates =
        response.body.features[0].geometry.coordinates;
      campground.placeName = response.body.features[0].place_name;
      campground.properties.description = `<h5><img src='${campground.images[0].url}' style="max-width: 220px;"><a href='/campgrounds/${campground.id}'>${campground.name}</a></h5><strong>${campground.price}</strong>$ per night<br>${campground.placeName}, ${campground.location}`;
    }
    ["name", "price", "description"].forEach(
      n => (campground[n] = bodyCampground[n])
    );
    campground.features = {
      baths: bodyCampground.baths,
      freeWiFi: eval(bodyCampground.freeWiFi) ? true : false,
      carParkings: bodyCampground.carParkings,
      hasSwimingPool: eval(bodyCampground.hasSwimingPool) ? true : false
    };
    await campground.save();
    req.session.success = "Campground successfully updated";
    res.redirect(`/campgrounds/${req.params.id}`);
    next();
  },
  destroyCampground: async (req, res, next) => {
    let { campground } = res.locals;
    await campground.remove();
    for (const id of campground.comments) await Comment.findByIdAndRemove(id);
    for (const img of campground.images)
      await cloudinary.v2.uploader.destroy(img.public_id);
    req.session.success = "campground successfully deleted";
    res.redirect("/campgrounds");
  }
};
