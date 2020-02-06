const crypto = require("crypto");
const cloudinary = require("cloudinary");
const multerCloudinary = require("multer-storage-cloudinary");
cloudinary.config({
  cloud_name: "dmxuerbxv",
  api_key: "529692727915557",
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = multerCloudinary({
  cloudinary,
  folder: "YelpCamp",
  allowedFormats: ["jpg", "jpeg", "png", "gif"],
  filename(req, file, cb) {
    let buffer = crypto.randomBytes(16);
    buffer = buffer.toString("hex");
    let newName =
      file.originalname.replace(/\.jpg|\.jpeg|\.png|\.gif/gi, "") + buffer;
    cb(undefined, newName);
  }
});

module.exports = { cloudinary, storage };
