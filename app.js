const express = require('express');
const app = express();
const session = require('express-session');
const cookie = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const path = require('path');
const cors = require("cors");
const DB = require('./utils/db');
const { Server } = require("socket.io")
const { createServer } = require("node:http");
const message = require("./models/message");
const { GenerateHash, CompareHash } = require('./middlewares/bcrypt');
require("dotenv").config({ path: __dirname + '/.env' })

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(session({
    secret: 'poauwefh',
    resave: false,
    saveUninitialized: false,
}));

app.use("/static", express.static(path.join(__dirname, "public")))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookie());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);

const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

DB().then(() => {
    server.listen(process.env.PORT || 3000, (err) => {

        if (err) {
            process.exit(1)
        } else {
            console.log("Sever is running");
        }
    });
})

let users = new Map();

io.on("connection", (socket) => {
    socket.on('register', (username) => {
        if (username && username !== 'null') {  // Validate username is not null or 'null'
            users.set(username, socket.id);
            const onlineUsers = Array.from(users)
            const onlineUsernames = onlineUsers.map((user, index)=>{
                return user[0]
            })
            io.emit("user-online", onlineUsernames)
            console.log(`${username} registered with ID: ${socket.id}`);
        }
    });


    socket.on("chat-msg", async ({msg, receiver, sender}) => {
        console.log(`${sender} sending message to ${receiver}: ${msg}`);
        if(!msg) return;
        const createdMessage = await message.create({
            receiver,
            sender,
            msg,
            status: "sent",
        });
        console.log("id-msg", createdMessage, users.get(sender), users)
        io.to(users.get(sender)).emit("id-msg", {createdMessage})
        const receiverSocketId = users.get(receiver);  // Corrected line
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive-msg", {msg, sender, receiver, messageId: createdMessage._id});

            createdMessage.status = 'delivered';
            await createdMessage.save();

            io.to(receiverSocketId).emit("message-status-updated", {
                messageId: createdMessage._id,
                status: "delivered"
            })
            console.log("updated to receiver")
            const senderSocketId = users.get(sender);
            if (senderSocketId) {
                io.to(senderSocketId).emit("message-status-updated", {
                    messageId: createdMessage._id,
                    status: "delivered",
                });
                console.log("updated to sender")

            }
            
        }
    });

    socket.on("msg-seen", async ({sender, receiver})=>{
        const unseenMessages = await message.find({
            sender,
            receiver,
            status: { $ne: "seen" }
          });
        const updatedMsgs = await message.updateMany({
            sender,
            receiver,
            status: { $ne: "seen" }
          }, {
            $set: { status: "seen" }
          });
        const senderSocketId = users.get(sender)
        if (senderSocketId) {
            unseenMessages.forEach((msg) => {
              io.to(senderSocketId).emit("message-status-updated", {
                messageId: msg._id,
                status: "seen",
              });
            });
          }
    })



    socket.on("disconnect", () => {
        let offlineUser = "";
        for (let [name, socketId] of users) {
            if (socketId === socket.id) {
                offlineUser = name;
                console.log("Disconnected:", offlineUser);
                users.delete(name);  // Corrected line
                io.emit("user-offline", offlineUser)
                break;
            }
        }
    });
});



module.exports = io;