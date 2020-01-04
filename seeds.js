require("dotenv").config();
const faker = require("faker");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const User = require("./models/user");
const data = require("./campgroundGeoData");
const cities = require("./cities");

const campgroundNumber = 40;
const commentsNumber = 20;
module.exports = async () => {
  await Campground.deleteMany({});
  await Comment.deleteMany({});
  // create campgroundNumber campgrounds
  for (let i of new Array(campgroundNumber)) {
    let num = Math.round(Math.random() * 133);
    const { name, description } = data[num];
    let { username, _id } = await User.findOne({ username: "nick" });
    const author = {
      username,
      _id
    };
    // find random city
    num = Math.round(Math.random() * 998);
    const { city, longitude, latitude, state } = cities[num];
    // name, description, location, placeName,
    const campgroundObj = {
      name,
      description,
      price: Math.round(Math.random() * 100),
      author,
      images: [
        {
          url:
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1578074116/lqprnywdbv7vqjle6uuh.jpg",
          public_id: "lqprnywdbv7vqjle6uuh"
        },
        {
          url:
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1578074125/nywcxmdhspmw5dak0kjz.jpg",
          public_id: "nywcxmdhspmw5dak0kjz"
        },
        {
          url:
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1578074127/cm3fkcfyafqwtn0q55xf.jpg",
          public_id: "cm3fkcfyafqwtn0q55xf"
        }
      ]
    };

    campgroundObj.location = state;
    campgroundObj.placeName = city;

    campgroundObj.geometry = {
      type: "Point",
      coordinates: [longitude, latitude]
    };
    let campground = await Campground.create(campgroundObj);
    campground.propreties.description = `<h5><img src='${campground.images[0].url}'><a href='/campgrounds/${campground.id}'>${name}</a></h5><strong>${campground.price}</strong>$ per night<br>${city}, ${state}`;
    // create commentsNumber comments
    for (let n of new Array(commentsNumber)) {
      const comment = {
        text: faker.lorem.words(5),
        rating: Math.round(Math.random() * 5),
        author
      };
      campground.comments.push(await Comment.create(comment));
    }
    await campground.save();
  }
  console.log(
    `${campgroundNumber} campgrounds created with ${commentsNumber} comments each`
  );
};
