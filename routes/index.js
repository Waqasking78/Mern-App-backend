const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { verifyToken } = require("../utils/jwt");
const {
  createPost,
  postLike,
  savePost,
  feed,
  getUsersToChat,
  getMessages,
  postViewer,
} = require("../controllers/post");
const {
  Profile,
  editProfile,
  userProfile,
  follow,
  famousUsers,
} = require("../controllers/profile");
const { Register, Login, profilePicUpload, Logout } = require("../controllers/auth");
const {
  createStory,
  getStories,
  userStories,
  search,
} = require("../controllers/story");
const cleanupUserStories = require("../middlewares/storyCleanup");
const { settings, hideStory } = require("../controllers/settings");

router.post("/register", Register);

router.post("/login", Login);

router.post("/profile", verifyToken, cleanupUserStories, Profile);

router.post(
  "/profilePic/upload",
  verifyToken,
  upload.single("file"),
  profilePicUpload
);

router.post("/create-post", verifyToken, upload.single("picture"), createPost);

router.post("/feed", feed);

router.post("/user/:username", userProfile);

router.post("/post/:postId", postViewer);

router.post("/edit-profile", verifyToken, editProfile);

router.post("/post/like/:postId", verifyToken, postLike);

router.post("/post/save/:postId", verifyToken, savePost);

router.post("/follow/:userId", verifyToken, follow);

router.post("/create-story", verifyToken, upload.single("file"), createStory);

router.post("/get-stories", verifyToken, getStories);

router.post("/user-stories", verifyToken, cleanupUserStories, userStories);

router.post("/search/user", search);

router.post("/get-friends", verifyToken, getUsersToChat);

router.post("/get-messages", verifyToken, getMessages);

router.post("/famous-users", verifyToken, famousUsers);

router.post("/settings", verifyToken, settings);

router.post("/hide-story", verifyToken, hideStory);

router.post("/logout", verifyToken, Logout)

module.exports = router;
