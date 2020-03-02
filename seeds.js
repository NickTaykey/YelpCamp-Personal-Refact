require("dotenv").config();
const faker = require("faker");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const data = require("./campgroundGeoData");
const cities = require("./cities");
const User = require("./models/user");

const campgroundNumber = 40;
const commentsNumber = 20;
module.exports = async () => {
  const { _id } = await User.findById("5e5d62e2efe05c03b8e14c4e");
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
      author: _id,
      images: [
        {
          url:
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1581016750/YelpCamp/photo-1455763916899-e8b50eca9967_uofry2.jpg"
        },
        {
          url:
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1581016721/YelpCamp/photo-1504851149312-7a075b496cc7_w3wii1.jpg"
        },
        {
          url:
            "https://res.cloudinary.com/dmxuerbxv/image/upload/v1581016750/YelpCamp/photo-1455763916899-e8b50eca9967_uofry2.jpg"
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
        campgroundName: campground.name,
        author: _id
      };
      campground.comments.push(await Comment.create(comment));
    }
    await campground.save();
  }
  console.log(
    `${campgroundNumber} campgrounds created with ${commentsNumber} comments each`
  );
};
