const express=require("express")
const {protect}=require("../middleware/authMiddleWare")
const multer = require('multer');
const path = require('path');
const {
    createPost,
    getPost,
    createComment,
    getPostById,
    getUserPosts,
    deletePost
}=require('../controllers/postController')

const router=express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        const allowed = ['image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG allowed.'));
        }
    }
});

// "api/posts/"
router.route('/')
  .post(
    protect,
    upload.single('image'),
    createPost
  )
  .get(protect, getPost);

router.route('/:id').get(protect,getPostById);
router.route('/:id/comments').post(protect,createComment);
router.route('/user/:userId').get(protect,getUserPosts);
router.route('/:id').get(protect,getPostById).delete(protect,deletePost);

module.exports=router