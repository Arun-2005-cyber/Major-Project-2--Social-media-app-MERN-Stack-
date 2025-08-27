const express = require("express");
const { protect } = require("../middleware/authMiddleWare");
const {
  uploadProfilePicture,
  getUserProfile,
  searchUsers,
  unfollowUser,
  followUser,
  getFollowing,
  getFollowers,
} = require("../controllers/userController");

const upload = require("../middleware/upload"); // ✅ multer-cloudinary setup

const router = express.Router();

// ✅ Upload profile picture (POST)
router.post(
  "/profile/upload",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// ✅ Get profile (GET) / Update profile picture (PUT)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("profilePicture"), uploadProfilePicture);

// ✅ Search users
router.get("/search", protect, searchUsers);

// ✅ Follow / Unfollow
router.post("/follow/:id", protect, followUser);
router.post("/unfollow/:id", protect, unfollowUser);

// ✅ Following / Followers
router.get("/following", protect, getFollowing);
router.get("/followers", protect, getFollowers);

module.exports = router;
