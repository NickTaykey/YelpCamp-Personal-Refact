const Campground = require("./models/campground");
const faker = require("faker");

module.exports = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 40; i++) {
    await Campground.create({
      name: faker.lorem.words(5),
      price: Math.random() * 101,
      description: faker.lorem.paragraphs(4),
      location: "US",
      placeName: faker.random.words(2),
      author: "5dec03ff333d0209b0009a5d"
    });
  }
  console.log("40 new campgrounds created");
};
