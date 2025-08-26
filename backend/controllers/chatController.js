const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// Get list of chats (only with users you follow)
const getChats = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).populate("following", "username profilePicture");

  // filter chats only with following
  const chats = await Chat.find({ participants: req.user._id })
    .populate("participants", "username profilePicture");

  // optional: filter only following users
  const filtered = chats.filter(chat =>
    me.following.some(f => chat.participants.map(p => p._id.toString()).includes(f._id.toString()))
  );

  res.json(filtered);
});

// Create / get chat with a following user
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // check if you are following them
  const me = await User.findById(req.user._id);
  if (!me.following.includes(userId)) {
    return res.status(403).json({ message: "You can only chat with users you follow" });
  }

  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, userId] }
  }).populate("participants", "username profilePicture");

  if (!chat) {
    chat = await Chat.create({ participants: [req.user._id, userId] });
  }

  res.json(chat);
});

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  const message = await Message.create({
    chat: chatId,
    sender: req.user._id,
    content
  });

  const populated = await message.populate("sender", "username profilePicture");

 
 // emit via socket.io
req.io.to(chatId).emit("messageReceived", populated);


  res.json(populated);
});

// Get messages
const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username profilePicture")
    .sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = { getChats, accessChat, sendMessage, getMessages };
