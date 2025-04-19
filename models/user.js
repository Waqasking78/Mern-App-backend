const mongoose = require("mongoose");


const DEFAULT_SERVER_URL = "http://localhost:3000/images/";
const DEFAULT_PROFILE_PICTURE = "default_profile_image.png"; // Default image file

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  bio: {
    type: String,
    default: ""
  },

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }],

  profilePicture: {
    type: String,
    default: DEFAULT_PROFILE_PICTURE, // Ensures a default image is always set
    set: function (filename) {
      if (!filename) return DEFAULT_SERVER_URL + DEFAULT_PROFILE_PICTURE; // If no file uploaded, use a default profile picture
      if (filename) return DEFAULT_SERVER_URL + filename;
    }
  },

  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }],

  likedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }],

  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
  }],

  settings: {
    hideStoryFrom: {
      type: [String],
    },
    privateAcc: {
      type: Boolean,
      default: false,
    },
    whoCanSeePosts: {
      type: String,
      default: "anyone",
      enum: ["anyone", "followers", "following", "only you"]
    },
    whoCanMsgMe: {
      type: String,
      default: "anyone",
      enum: ["anyone", "followers", "following"]
    },
    hideLikes: {
      type: Boolean,
      default: false,
    },
    blockUserPosts: {
      type: [String]
    },
    

  } 

}, { timestamps: true });

userSchema.pre("save", function (next) {
  this.email.toLowerCase();
  next();
});

module.exports = mongoose.model("User", userSchema);
