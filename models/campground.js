const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const campgroudSchema = new mongoose.Schema({
  name: String,
  images: [{ url: String, public_id: String }],
  price: String,
  description: String,
  location: String,
  placeName: String,
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

campgroudSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Campground", campgroudSchema);
