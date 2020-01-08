const crypto = require("crypto");
const cloudinary = require("cloudinary");
const multerCloudinary = require("multer-storage-cloudinary");
// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: "dmxuerbxv",
  api_key: "529692727915557",
  api_secret: process.env.CLOUDINARY_SECRET
});

// multer-cloudinary config
const storage = multerCloudinary({
  cloudinary,
  folder: "YelpCamp",
  allowedFormats: ["jpg", "jpeg", "png", "gif"],
  // rename the file randomly
  filename(req, file, cb) {
    // find a random name
    let buffer = crypto.randomBytes(16);
    buffer = buffer.toString("hex");
    // set the new name for the file without extention (originalName + random string 32 chars)
    let newName =
      file.originalname.replace(/\.jpg|\.jpeg|\.png|\.gif/gi, "") + buffer;
    // call the callback in order to rename the file with the new generated name (undefined for errors, no errors happened here)
    cb(undefined, newName);
  }
});

// exports configuration objs for cloudinary and multer-cloudinary
module.exports = { cloudinary, storage };
