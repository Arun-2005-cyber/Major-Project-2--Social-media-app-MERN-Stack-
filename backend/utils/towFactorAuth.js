// utils/twoFactorAuth.js
const speakeasy = require('speakeasy');

const generateSecret = (username) => {
  return speakeasy.generateSecret({
    length: 20,
    name: `Social Media (${username})`,
  });
};

const verifyToken = (secretBase32, token) => {
  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token: token,
    window: 2,
  });
};

module.exports = { generateSecret, verifyToken };
