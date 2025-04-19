const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: { 
        type: String,
         default: "sent"
    } // 'sent', 'delivered', 'seen'
},{timestamps: true});

module.exports = mongoose.model('Message', messageSchema);