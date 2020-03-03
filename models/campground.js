const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const campgroundSchema = new mongoose.Schema({
  name: String,
  images: [{ url: String, public_id: String }],
  price: String,
  description: String,
  location: String,
  place_name: String,
  features: {
    baths: String,
    freeWiFi: { type: Boolean, default: false },
    carParkings: String,
    hasSwimingPool: { type: Boolean, default: false }
  },
  geometry: {
    coordinates: { type: [Number], require: true },
    type: { type: String, enum: ["Point"] }
  },
  properties: {
    description: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  avgRating: { type: Number, default: 0 }
});

campgroundSchema.plugin(mongoosePaginate);

// method to calculate the average rating
campgroundSchema.methods.calcAvgRating = async function() {
  let stars = 0,
    floorRating = 0;
  if (this.comments.length) {
    this.comments.forEach(c => (stars += c.rating));
    this.avgRating = Math.round((stars / this.comments.length) * 10) / 10;
    floorRating = Math.floor(this.avgRating);
    await this.save();
  }
  return floorRating;
};

module.exports = mongoose.model("Campground", campgroundSchema);
