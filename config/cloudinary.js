const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Make sure you have these set in your .env file:
// CLOUDINARY_CLOUD_NAME=xxxx
// CLOUDINARY_API_KEY=xxxx
// CLOUDINARY_API_SECRET=xxxx

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

module.exports = cloudinary;


