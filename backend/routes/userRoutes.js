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
  updateUsername,
} = require("../controllers/userController");

const upload = require("../middleware/upload"); // ✅ same upload

const router = express.Router();

router
  .route("/profile/upload")
  .post(protect, upload.single("profilePicture"), uploadProfilePicture);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("profilePicture"), uploadProfilePicture);

router.route("/search").get(protect, searchUsers);
router.route("/follow/:id").post(protect, followUser);
router.route("/unfollow/:id").post(protect, unfollowUser);
router.route("/following").get(protect, getFollowing);
router.route("/followers").get(protect, getFollowers);
router.route("/profile/update-username").put(protect, updateUsername);

module.exports = router;
