const mongoose = require('mongoose');
const multer = require('multer');

const Post = require('../models/postModel');
const Indicator = require('../models/indicatorModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const fse = require('fs-extra');

exports.getAllPosts = handlerFactory.getAll(Post);
exports.getPost = handlerFactory.getOne(Post);

// Handle File Uploads
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'sascie-react/public/docs/posts/')
    },
    filename: (req, file, cb) => {
        cb(null, `post-${file.originalname}`)
    },
});

const multerFilter = (req, file, cb) => {
    const { originalname } = file;
    const ext = originalname.split('.')[1];
    const allowedExts = ['csv', 'pdf', 'xlsx', 'xls', 'xlsm', '.doc', '.docx'];

    if(file.mimetype.includes('image') || allowedExts.includes(ext)) {
        cb(null, true)
    }
    else {
        cb(new AppError('File must be an image, pdf or csv.', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadFiles = upload.array('file', 3);

exports.addPost = catchAsync(async(req, res, next) => {
    const indicatorId = req.params?.indicatorId ? mongoose.Types.ObjectId(req.params.indicatorId) : undefined;

    // Create a new post with all the data except the files.
    const post = await Post.create({
        comment: req.body.comment,
        lastUpdatedAt: Date.now(),
        photo: req.user.photo,
        createdBy: `${req.user.firstName} ${req.user.lastName}`,
    });

    // Get a list of the filenames that were attached to this post.
    const fileNames = req.files.map(file => 
        `/docs/posts/${post._id}/${file.originalname}`
    );

    // Update the newly created post with the appropriate filenames.
    const updatedPost = await Post.findByIdAndUpdate(post._id, {
        files: fileNames
    }, {
        new: true,
    });

    // Store the original file paths and original file names.
    const originalFilePaths = req.files.map(file => 
        `sascie-react/public/docs/posts/post-${file.originalname}`
    )
    const originalFileNames = req.files.map(file => file.originalname);

    // Move the files from their outer directory into their own directory by post id.
    originalFilePaths.forEach((originalFilePath, index) => {
        fse.move(originalFilePath, `sascie-react/public/docs/posts/${post._id}/${originalFileNames[index]}`, err => {
            return
        });
    })

    if(indicatorId) {
        await Indicator.findByIdAndUpdate(indicatorId, {
            $push: { posts: post._id }   
        })
    }

    res.status(201).json({
        status: 'success',
        data: {
            updatedPost,
            indicatorId
        }
    })
});

exports.updatePost = catchAsync(async(req, res, next) => {
    const postId = mongoose.Types.ObjectId(req.params?.id);

    // Find the post with the given ID, return an error if no post exists with the given id.
    const post = await Post.findById(postId);
    if(!post) return next(new AppError('Sorry, we could not find a post with that id.', 401));

    // Return an error if the person who is trying to edit the post is not it's creator.
    if(post.createdBy !== `${req.user.firstName} ${req.user.lastName}`) {
        return next(new AppError(`Only the user who created this comment (${post.createdBy}) can edit it.`), 401)
    }

    // Update the post.
    const updatedPost = await Post.findByIdAndUpdate(postId, {
        comment: req.body.comment,
        lastUpdatedAt: Date.now()
    }, {
        new: true,
    });

    res.status(201).json({
        status: 'success',
        data: {
            updatedPost
        }
    })
});

exports.deletePost = catchAsync(async(req, res, next) => {
    const indicatorId = req.params?.indicatorId ? mongoose.Types.ObjectId(req.params.indicatorId) : undefined;
    const postId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;

    await Post.findByIdAndDelete(postId);

    if(indicatorId) {
        await Indicator.findByIdAndUpdate(indicatorId, {
            $pull: { posts: postId }
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            indicatorId,
            postId,
        }
    });
})