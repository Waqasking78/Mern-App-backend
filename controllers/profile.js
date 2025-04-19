const UserModel = require("../models/user")

const Profile = async function (req, res) {
    const user = req.user;
    const profileUser = await UserModel.findById(user.id).populate("posts").populate("savedPosts");
    res.json({ message: "You are logged in", profileUser });
};

const editProfile = async function (req, res) {
    if (!req.body.username || !req.body.bio) {
        res.status(400).json({ err: "Username and Bio is required." })
    } else {
        if (req.body.username && req.body.bio) {
            const existingUsername = await UserModel.findOne({ username: req.body.userame, bio: req.body.bio });
            const userId = req.user.id;
            const user = await UserModel.findById(userId)
            if (!existingUsername) {
                try {
                    user.username = req.body.username;
                    user.bio = req.body.bio;
                    const editedUser = await user.save()
                    console.log(editedUser);
                    res.json({ message: "Successfully updated.", profileUser: editedUser })
                } catch (error) {
                    res.status(400).json({ "err": "Username registered" })
                }
            }
        }
    }

}

const userProfile = async function (req, res) {
    const username = req.params.username;
    const user = await UserModel.findOne({ username }).populate("posts");
    res.json(user)
}

const follow = async function (req, res) {
    const user = req.user;
    const userId = req.params.userId;
    const userFollowing = await UserModel.findById(user.id) // user is going to follow increament in following
    const userToFollow = await UserModel.findById(userId) // that is increament in follower

    if (userFollowing.following.includes(userId)) {
        return res.status(400).json({ message: "Already following" });
    }
    userFollowing.following.push(userId);
    userToFollow.followers.push(user.id);
    await userFollowing.save();
    await userToFollow.save();
    res.json({ message: "Followed", userFollowing, userToFollow });
}

const famousUsers = async function (req, res) {
    try {
        const users = await UserModel.find().sort({ followers: -1 }).limit(req.query.l || 5).select("profilePicture username followers -_id")
        res.json(users)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
}

module.exports = { Profile, editProfile, userProfile, follow, famousUsers }