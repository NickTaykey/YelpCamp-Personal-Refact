const faker = require("faker");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const User = require("./models/user");

module.exports = async () => {
  await Campground.deleteMany({});
  await Comment.deleteMany({});
  // user to associate with any campground or comment
  let { _id, username } = await User.findById("5e0a5dbf787e9706c984c95f");
  let i = 0;
  while (i < 40) {
    let campgound = await Campground.create({
      name: faker.lorem.words(5),
      price: Math.floor(Math.random() * 101),
      description: faker.lorem.words(20),
      location: "US",
      placeName: faker.random.words(2),
      author: { id: _id, username }
    });
    for (let i = 0; i < 20; i++) {
      let comment = await Comment.create({
        text: faker.lorem.words(5),
        rating: Math.floor(Math.random() * 6),
        author: { id: _id, username }
      });
      campgound.comments.push(comment);
    }
    await campgound.calcAvgRating();
    await campgound.save();
    i++;
  }
  console.log("40 new campgrounds created");
};
