const mongoose = require("mongoose")

const DEFAULT_SERVER_URL = "http://localhost:3000/images/"


const storySchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    seen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    mediaType: {
        type: String,
    },
    url: {
        type: String,
        set: function (filename) {
            return DEFAULT_SERVER_URL + filename;
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400,
    }
})


module.exports = mongoose.model("Story", storySchema)