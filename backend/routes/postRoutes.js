const express = require("express");
const { protect } = require("../middleware/authMiddleWare");
const {
  createPost,
  getPost,
  createComment,
  getPostById,
  getUserPosts,
  deletePost,
} = require("../controllers/postController");

const upload = require("../middleware/upload"); // ✅ your cloudinary multer

const router = express.Router();

// "api/posts/"
router
  .route("/")
  .post(protect, upload.single("image"), createPost) // ✅ use cloudinary upload
  .get(protect, getPost);

router.route("/:id").get(protect, getPostById).delete(protect, deletePost);
router.route("/:id/comments").post(protect, createComment);
router.route("/user/:userId").get(protect, getUserPosts);

module.exports = router;
