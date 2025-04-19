const multer = require("multer")
const path = require("path")

const allowedMimeTypes = ["image/jpeg", "image/png", "video/mp4", "image/avif"];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    return cb(new Error("Invalid file type. Only images and videos are allowed."));
  }
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/") // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;