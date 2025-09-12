// controllers/userController.js
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// configure cloudinary (ensure env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// helper to upload a buffer to Cloudinary via stream
function uploadBufferToCloudinary(buffer, folder = 'profile_pics') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// ✅ Improved upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    // Debug logs to see what's coming in
    console.log('--- uploadProfilePicture called ---');
    console.log('req.user:', req.user);         // ensure auth middleware populated this
    console.log('req.file:', !!req.file, req.file && Object.keys(req.file)); // inspect keys

    // Ensure user present (auth middleware must set req.user)
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: missing user' });

    // If no file found in request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Use multipart/form-data and field name "profilePicture".' });
    }

    // Try to get a URL from common places (for multer-storage-cloudinary -> path / secure_url / location)
    let imageUrl =
      req.file.path ||
      req.file.secure_url ||
      req.file.location ||
      req.file.url ||
      null;

    // If we are using memoryStorage (buffer present) -> upload buffer to Cloudinary
    if (!imageUrl && req.file.buffer) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'profile_pics');
      imageUrl = result.secure_url || result.url;
    }

    if (!imageUrl) {
      return res.status(500).json({ message: 'Could not determine uploaded image URL' });
    }

    // Save to DB
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePicture = imageUrl;
    await user.save();

    return res.json({ message: 'Profile picture uploaded successfully', profilePicture: imageUrl });
  } catch (error) {
    console.error('Upload Profile Error:', error);

    // Helpful specific checks
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user id', error: error.message });
    }
    if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'File upload error', error: error.code });
    }

    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



// 📌 Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Search Users
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q || "";
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("username profilePicture");
    res.json(users);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Follow User
const followUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.following.includes(targetUser._id)) {
      return res.status(400).json({ message: "Already following" });
    }

    user.following.push(targetUser._id);
    targetUser.followers.push(user._id);

    await user.save();
    await targetUser.save();

    res.json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Follow Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Unfollow User
const unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    user.following = user.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== user._id.toString()
    );

    await user.save();
    await targetUser.save();

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Get Following
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "following",
      "username profilePicture"
    );
    res.json(user.following);
  } catch (error) {
    console.error("Get Following Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Get Followers
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "followers",
      "username profilePicture"
    );
    res.json(user.followers);
  } catch (error) {
    console.error("Get Followers Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  uploadProfilePicture,
  getUserProfile,
  searchUsers,
  unfollowUser,
  followUser,
  getFollowing,
  getFollowers,
};
