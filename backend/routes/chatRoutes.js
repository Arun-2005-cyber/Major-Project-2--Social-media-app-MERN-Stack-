const express = require("express");
const { protect } = require("../middleware/authMiddleWare");
const { getChats, accessChat, sendMessage, getMessages } = require("../controllers/chatController");

const router = express.Router();

router.get("/", protect, getChats);              // list my chats
router.post("/:userId", protect, accessChat);    // start chat
router.post("/message/:chatId", protect, sendMessage); // send message
router.get("/message/:chatId", protect, getMessages);  // fetch messages

module.exports = router;
