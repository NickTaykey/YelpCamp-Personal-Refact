const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  text: String,
  rating: Number,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Comment", commentSchema);
