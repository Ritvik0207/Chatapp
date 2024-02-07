const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const accessChat = asyncHandler(async (req, res) => {

    const { userId } = req.body;
    if (!userId) {
        console.log("userId  is not sent in request");
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: userId } } },
            { users: { $elemMatch: { $eq: req.user._id } } }
        ]
    }).populate("users", "-password").populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });
    if (isChat.length < 0) {
        res.send(isChat[0]);
    } else {
        var chatdata = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };
        try {
            const createChat = await Chat.create(chatdata);

            const fullChat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password");
            res.status(200).send(fullChat);

        } catch (error) {
            console.log(error);
            res.status(400);
            throw new Error(error.message)
        }
    }

});
const fetchChats = asyncHandler(async (req, res) => {

    try {
        var result = await Chat.find({
            users: { $elemMatch: { $eq: req.user._id } }
        }).populate("users", "-password").populate("latestMessage").populate("groupAdmin", "-password").populate({
            path: "latestMessage.sender",
            select: "name pic email"
        })
        res.status(200).send(result);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }


});

const createGroupChat = asyncHandler(async (req, res) => {
});

const renameGroup = asyncHandler(async (req, res) => {
});

const removeFromGroup = asyncHandler(async (req, res) => {
});

const addToGroup = asyncHandler(async (req, res) => {
});


module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup }
