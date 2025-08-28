const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post")
const fs = require("fs");

// Set up multer for file uploading

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        const allowed = ['image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }

    }
})

//create a new post
//POST/api/posts



const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "Image is required" });
  }

  const post = new Post({
    user: req.user._id,
    content,
    image: req.file.path, 
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});



//Get post from following users or own post
// GET /api/posts

const getPost=asyncHandler(async(req,res)=>{
    const user=req.user;
    const following=user.following;
    const posts=await Post.find({
        $or:[
            {user:{$in:following}},
            {user:user._id}
        ]
    })
    .populate('user','username profilePicture')
    .populate('comments.user','username profilePicture')


    res.json(posts)
})

//create a new comment
//POST /api/posts/:id/comments

const createComment=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    const post=await Post.findById(req.params.id);
    if(post){
        const comment={
            user:req.user._id,
            content,
        };
        post.comments.push(comment);
        await post.save();

        res.status(201).json({message:"Comment Added"})
    }
    else{
        res.status(401);
        throw new Error("post not found")
    }
})

//get post by id
// /api/posts/:id

const getPostById=asyncHandler(async(req,res)=>{
    const post=await Post.findById(req.params.id)
    .populate('user','username profilePicture')
    .populate('comments.user','username profilePicture')

    if(post){
        res.json(post)
    }
    else{
        res.status(404);
        throw new Error('Post not found')
    }

});

//get users post

const getUserPosts=asyncHandler(async(req,res)=>{
    const posts=await Post.find({user:req.params.userId}).populate('user','username profilePicture').populate('comments.user','username');
    res.json(posts)
});

//delete post

const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
        if (post.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("You are not authorized to delete this post");
        }

        // Delete uploaded image file if exists
        if (post.image) {
            const imagePath = path.join(__dirname, '..', post.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Post.deleteOne({ _id: req.params.id });
        res.json({ message: "Post Removed" });
    } else {
        res.status(404);
        throw new Error("Post not found");
    }
});

module.exports={
    createPost,
    getPost,
    createComment,
    getPostById,
    getUserPosts,
    deletePost
}