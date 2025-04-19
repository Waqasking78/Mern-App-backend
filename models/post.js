const mongoose = require("mongoose")

const DEFAULT_SERVER_URL = "http://localhost:3000/images/"

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    picture: {
        type: String,
        required: true,
        set: function (fileName) {
            return DEFAULT_SERVER_URL + fileName;
        }
    },
},{timestamps: true})

module.exports = mongoose.model("Post", postSchema)