require("dotenv").config();
const faker = require("faker");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const User = require("./models/user");
const data = require("./campgroundGeoData");
const cities = require("./cities");
const author = "5e24b3523ea92f052b463f79";

const campgroundNumber = 40;
const commentsNumber = 20;
module.exports = async () => {
  await Campground.deleteMany({});
  await Comment.deleteMany({});
  // create campgroundNumber campgrounds
  for (let i of new Array(campgroundNumber)) {
    let num = Math.round(Math.random() * 133);
    const { name, description } = data[num];
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
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1578250326/n5jlsqihiynsp7ca6gvu.jpg",
          public_id: "n5jlsqihiynsp7ca6gvu"
        },
        {
          url:
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1578250362/k0bz85um5g0zhgrtvw4v.jpg",
          public_id: "k0bz85um5g0zhgrtvw4v"
        }
      ]
    };

    campgroundObj.location = state;
    campgroundObj.place_name = city;

    campgroundObj.geometry = {
      type: "Point",
      coordinates: [longitude, latitude]
    };
    let campground = await Campground.create(campgroundObj);
    campground.properties.description = `<h5><img src='${campground.images[0].url}' style="max-width: 220px;"><br><a href='/campgrounds/${campground.id}'>${name}</a></h5><strong>${campground.price}</strong>$ per night<br>${city}, ${state}`;
    // create commentsNumber comments
    for (let n of new Array(commentsNumber)) {
      const comment = {
        text: faker.lorem.words(5),
        rating: Math.round(Math.random() * 5) + 1,
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
