const UserModel = require("../models/user")
const StoryModel = require("../models/story")


 async function UserStoryCleanup(userId) {
    const user = await UserModel.findById(userId)
    if (!user || !user.stories || !user.stories.length === 0) return;

    // const userStories = user.stories
    const existingStories = await StoryModel.find({ _id: { $in: user.stories } })
    const existingStoriesIds = existingStories.map((story) => story._id.toString())

    console.log("existingStories", existingStories)
    console.log("existingStories", existingStoriesIds)

    if (existingStories.length !== user.stories.length) {
        user.stories = existingStoriesIds;
        await user.save();
        console.log(`🧹 Cleaned up invalid stories for user ${user._id}`);
      } else if (existingStories.length == 0) {
        user.stories = [];
        await user.save();
      }
}

async function cleanupUserStories(req, res, next) {
  if (req.user && req.user.id) {  // Ensure user is logged in and has an ID
      await UserStoryCleanup(req.user.id);
  }
  next();  // Pass control to the next middleware or route handler
}

module.exports = cleanupUserStories