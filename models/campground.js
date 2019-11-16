const mongoose = require("mongoose");
const campgroudSchema = new mongoose.Schema({
  name: String,
  images: [{ url: String, public_id: String }],
  price: String,
  description: String,
  location: String,
  coordinates: Array,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

module.exports = mongoose.model("Campground", campgroudSchema);
