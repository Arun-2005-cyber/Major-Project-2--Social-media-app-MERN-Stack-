const express = require('express');
const { signup, login,enableTwoFactorAuth } = require('../controllers/authController');
const {protect}=require("../middleware/authMiddleWare");
const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/enable-2fa",protect,enableTwoFactorAuth)

module.exports = router;