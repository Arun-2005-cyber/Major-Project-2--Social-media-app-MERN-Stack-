const Post = require("../models/Post");

// 📌 Create Post
const createPost = async (req, res) => {


  try {
    console.log("REQ FILE:", req.file);
    console.log("REQ BODY:", req.body);
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = req.file.path; // ✅ Cloudinary URL

    const post = await Post.create({
      user: req.user.id,
      image: imageUrl,
      content: req.body.content || "",
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Get All Posts
const getPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Get Post By ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "username profilePicture"
    )
    .populate("comments.user", "username profilePicture");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Get Post By ID Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Get User Posts
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture");

    res.json(posts);
  } catch (error) {
    console.error("Get User Posts Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 📌 Create Comment
const createComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user.id,
      content: req.body.content,
    };

    post.comments.push(comment);
    await post.save();

    // Return updated post with populated comments
    const updatedPost = await Post.findById(req.params.id)
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture");

    res.json(updatedPost);
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



// 📌 Delete Post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createPost,
  getPost,
  createComment,
  getPostById,
  getUserPosts,
  deletePost,
};
