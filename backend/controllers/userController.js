const User = require("../models/userModel");

// 📌 Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path; // ✅ Cloudinary URL

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = imageUrl; // save to DB
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: imageUrl,
    });
  } catch (error) {
    console.error("Upload Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
