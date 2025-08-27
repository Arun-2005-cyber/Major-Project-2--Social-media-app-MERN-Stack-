const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateSecret, verifyToken } = require('../utils/towFactorAuth');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExistsEmail = await User.findOne({ email });
    const userExistsUsername = await User.findOne({ username });

    if (userExistsEmail || userExistsUsername) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
      twoFactorAuth: user.twoFactorAuth || false, // safer
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};




exports.login = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // ✅ If 2FA enabled
    if (user.twoFactorAuth) {
      if (!token) {
        return res.status(400).json({ message: "2FA token required" });
      }
      const isValid = verifyToken(user.twoFactorAuthSecret, token);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid 2FA token" });
      }
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
      twoFactorAuth: user.twoFactorAuth || false
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.enableTwoFactorAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = generateSecret(user.username);

    // Save secret + enable 2FA
    user.twoFactorAuthSecret = secret.base32;
    user.twoFactorAuth = true;
    await user.save();

    res.json({
      message: "Two-factor authentication enabled",
      otpauthUrl: secret.otpauth_url,
      base32: secret.base32
    });
  } catch (err) {
    console.error("❌ Enable 2FA error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


