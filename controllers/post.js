const UserModel = require("../models/user");
const postModel = require("../models/post");
const message = require("../models/message");


const createPost = async function (req, res) {
  try {
    const { title, description } = req.body
    const fileName = req.file?.filename;
    const loggedInUserId = req.user.id;
    const existedPost = await postModel.findOne({ title })
    if (!title || !description || !fileName) {
      res.status(400).json({ message: "All fields are required" })
    } else if (existedPost) {
      res.status(400).json({ message: "Try different title" })
    } else {
      const user = await UserModel.findById(loggedInUserId)
      const post = await postModel.create({
        title,
        description,
        picture: fileName,
        author: loggedInUserId,
      })
      user.posts.push(post._id)
      await user.save()
      res.json({ msg: "Post created", body: req.body, files: req.files })
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error })
  }
}

const postLike = async function (req, res) {
  try {
    const user = await UserModel.findById(req.user.id);
    const post = await postModel.findById(req.params.postId)
    if (post.likes.includes(req.user.id)) return;
    user.likedPosts.push(post._id);
    post.likes.push(user._id);
    await user.save();
    await post.save();
    res.status(200).json({ postId: post._id })
  } catch (error) {
    res.json({ msg: error })
  }
}

const savePost = async function (req, res) {
  const post = await postModel.findById(req.params.postId);
  const user = await UserModel.findById(req.user.id);
  if (user.savedPosts.includes(req.params.postId)) {
    res.json({ "message": "Post is already saved." })
    return;
  };
  user.savedPosts.push(post._id);
  await user.save();
  res.json(user)
}

const feed = async function (req, res) {
  const posts = await postModel.find().populate("author")
  res.json(posts)
}

const getUsersToChat = async (req, res) => {
  try {
    // const user = await UserModel.findById(req.user.id).populate("following");

    // const users = await Promise.all(
    //   user.following.map(async (followedUser) => {
    //     const lastMessage = await message.findOne({
    //       $or: [
    //         { sender: req.user.username, receiver: followedUser.username },
    //         { sender: followedUser.username, receiver: req.user.username }
    //       ]
    //     })
    //       .sort({ createdAt: -1 })
    //       .limit(1);

    //     return {
    //       user: { ...followedUser._doc, lastMessage: lastMessage } // Using _doc here
    //     };
    //   })
    // );
    // res.json(users);

    const user = await UserModel.findById(req.user.id);
    console.log("Chatted User", user.username)
    const allChatUsers = await message.find({
      $or: [
        { sender: user.username },
        { receiver: user.username }
      ]
    }).sort({ createdAt: -1 })
    const seenUsers = new Set();
    const uniqueChatUsers = [];

    for (const msg of allChatUsers) {
      // figure out the "other" user in the conversation
      const otherUser = msg.sender === user.username ? msg.receiver : msg.sender;

      if (!seenUsers.has(otherUser)) {
        seenUsers.add(otherUser);
        uniqueChatUsers.push(msg); // or push whole msg if you want message preview
      }
    }


    console.log("sorted msgs", uniqueChatUsers, seenUsers)
    const finalUsers = await UserModel.find({username: {$in: Array.from(seenUsers) }})
    const usersWithMessages = finalUsers.map(usr => {
      const msg = uniqueChatUsers.find(m =>
        m.sender === usr.username || m.receiver === usr.username
      );
      return {
        ...usr.toObject(),
        msg // attach corresponding message
      };
    });
    res.json(usersWithMessages)

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const getMessages = async function (req, res) {
  try {
    const sender = await UserModel.findOne({ username: `${req.query.sender}` })
    const receiver = await UserModel.findOne({ username: `${req.query.receiver}` })

    const messages = await message.find({
      $or: [
        { sender: req.query.sender, receiver: req.query.receiver },
        { sender: req.query.receiver, receiver: req.query.sender }
      ]
    }).sort({ createdAt: -1 }).limit(50)
    res.json({ messages, receiver })
  } catch (error) {
    res.json(error)
  }
}

const postViewer = async function (req, res) {
  try {
    const post = await postModel.findById(req.params.postId).populate("author")
    console.log("post", post)
    res.json(post)
  } catch (error) {
    console.log("error", error)
    res.json(error)
  }
}

module.exports = { createPost, postLike, savePost, feed, getUsersToChat, getMessages, postViewer }