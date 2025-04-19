const post = require("../models/post");
const story = require("../models/story");
const userModel = require("../models/user");
const createStory = async function (req, res) {
  console.log("first")
  const userId = req.user.id;
  const user = await userModel.findById(userId);
  const storyCreated = await story.create({
    url: req.file?.filename,
    author: user._id,
    mediaType: req.file.mimetype,
  });
  console.log("FIle ext", req.file, req.body)
  user.stories.push(storyCreated._id);
  await user.save();
  const stories = await story.find().sort({ createdAt: -1 }).limit(30);
  res.json({ stories, user });
};

const getStories = async function (req, res) {
  const users = await userModel
    .find({ stories: { $exists: true, $ne: [] }, _id: { $ne: req.user.id } })
    .populate("stories")
    .sort({ createdAt: -1 })
    .limit(30);
  res.json(users)
};

const userStories = async function (req, res) {
  const id = req.query.id;
  if (id == "my") {
    try {
      console.log("Start")
      const stories = await story.find({author: req.user.id}).populate("author");
      console.log(stories)
      res.json(stories)
    } catch (error) {
      res.json(error)
    }
  } else if (id != "my") {
    const user = await userModel.findOne({ username: id }).populate("stories")
    res.json(user)
  }
}

const search = async function (req, res) {
  try {
    const query = req.query.q;
  const users = await userModel.find({
    username:
      { $regex: `^${query}`, $options: "i" }
  }).select("username profilePicture -_id")
  console.log("first", users)
  res.json(users)
  } catch (error) {
    console.log(error)
    res.json(error)
  }
}

module.exports = { createStory, getStories, userStories, search };
