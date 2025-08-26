const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateSecret, verifyToken } = require('../utils/towFactorAuth');

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

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
        secret:user.twoFactorAuth
    });
};



exports.login = async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid Credentials' });
  }

  if (user.twoFactorAuth) {
    if (!token) {
      return res.status(400).json({ message: '2FA token required' });
    }
    const isValid = verifyToken(user.twoFactorAuthSecret, token);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }
  }

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    token: generateToken(user._id),
    secret:user.twoFactorAuth
  });
};

exports.enableTwoFactorAuth = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const secret = generateSecret(user.username);


  user.twoFactorAuthSecret = secret.base32;
  user.twoFactorAuth = true;
  await user.save();

  res.json({
    message: 'Two-factor authentication enabled',
    otpauthUrl: secret.otpauth_url, 
    base32: secret.base32 
  });
};

