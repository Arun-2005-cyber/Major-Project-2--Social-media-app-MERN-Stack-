const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const User = require("../models/User")


// Set up multer for file uploading

const fs = require('fs');


const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}


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

//@Routes POST /api/users/profile/upload

// controllers/userController.js


const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.profilePicture = req.file.path; // ✅ Cloudinary URL
  await user.save();

  res.json({ profilePicture: user.profilePicture });
});






// @route GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('followers following').select('-password')

    if (user) {
        res.json(user)
    }
    else {
        res.status(404);
        throw new Error('user is not found')
    }
})


//@routes PUT/api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updateUser = await user.save();

        res.json({
            _id: updateUser._id,
            username: updateUser.username,
            email: updateUser.email,
            profilePicture: updateUser.profilePicture,
            followers: updateUser.followers,
            following: updateUser.following
        });
    }
})

//@route GET /api/users/search
const searchUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword ? {
        username: {
            $regex: req.query.keyword,
            $options: 'i'
        }
    } : {}
    const users = await User.find({ ...keyword }).select('-password');
    res.json(users)

})

// routes POST /api/users/follow/:id

const followUser = asyncHandler(async (req, res) => {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id)

    if (userToFollow && currentUser) {
        if (userToFollow._id.toString() === currentUser._id.toString()) {
            res.status(400);
            throw new Error('You cannot follow yourself...')
        }
        else if (!currentUser.following.includes(userToFollow._id)) {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            await currentUser.save()
            await userToFollow.save()
            res.json({ message: "User Followed" })
        }
        else {
            res.json({ message: "Already following this user" })
        }
    }
    else {
        res.status(404);
        throw new Error("User not found")
    }
})

// routes POST /api/users/unfollow/:id
const unfollowUser = asyncHandler(async (req, res) => {
    const userToUnFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id)

    if (userToUnFollow && currentUser) {
        if (userToUnFollow._id.toString() === currentUser._id.toString()) {
            res.status(400);
            throw new Error('You cannot follow yourself...')
        }
        else if (currentUser.following.includes(userToUnFollow._id)) {
            currentUser.following = currentUser.following.filter(
                (followId) => followId.toString() !== userToUnFollow._id.toString()
            )
            userToUnFollow.followers = userToUnFollow.following.filter(
                (followId) => followId.toString() !== userToUnFollow._id.toString()
            );

            await currentUser.save();
            await userToUnFollow.save();
            res.json({ message: "User Unfollowed" })
        }
        else {
            res.json({ message: "Not following this user" })
        }
    }
    else {
        res.status(404);
        throw new Error("User not found")
    }
})

// @route GET /api/users/following
const getFollowing = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("following", "username email profilePicture");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json(user.following);
});

// @route GET /api/users/followers
const getFollowers = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("followers", "username email profilePicture");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json(user.followers);
});





module.exports = { uploadProfilePicture, updateUserProfile, getUserProfile, searchUsers, followUser, unfollowUser,getFollowing, 
  getFollowers  }