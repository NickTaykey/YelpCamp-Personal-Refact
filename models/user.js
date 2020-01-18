const mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: { type: String, required: true, unique: true }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
