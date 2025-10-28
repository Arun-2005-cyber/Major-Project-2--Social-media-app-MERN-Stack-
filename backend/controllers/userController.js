// controllers/userController.js
const User = require("../models/User");

// 📌 Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log("--- uploadProfilePicture called ---");
    console.log("req.user:", req.user);
    console.log("req.file:", req.file);

    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({
        message:
          'No file uploaded. Send form-data with field name "profilePicture".',
      });
    }

    // multer-storage-cloudinary already uploads the file and gives us path/url
    const imageUrl =
      req.file.path || req.file.secure_url || req.file.url || null;

    if (!imageUrl) {
      return res.status(500).json({ message: "Could not get image URL" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePicture = imageUrl;
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
// 📌 Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 📌 Search Users
// 📌 Search Users
const searchUsers = async (req, res) => {
  try {
    const query = req.query.keyword?.trim();

    // If query is empty or null, return empty array
    if (!query) {
      return res.json([]);
    }

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

// 📌 Update Username
const updateUsername = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Username already exists" });
    }

    user.username = req.body.username || user.username;
    const updatedUser = await user.save();

    res.json({
      message: "Username updated successfully",
      username: updatedUser.username,
    });
  } catch (error) {
    console.error("Update Username Error:", error);
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
  updateUsername,
};
