// upload.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// configure cloudinary with env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: !!process.env.CLOUDINARY_API_KEY,
  secret: !!process.env.CLOUDINARY_API_SECRET,
});

// set up storage on cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "myapp_uploads", // folder inside Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// multer middleware
const upload = multer({ storage });

module.exports = upload;
