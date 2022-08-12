const mongoose = require('mongoose');


const Post = require('../models/postModel');
const Indicator = require('../models/indicatorModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const aws = require('aws-sdk');
const { create } = require('../models/postModel');

exports.getAllPosts = handlerFactory.getAll(Post);
exports.getPost = handlerFactory.getOne(Post);

// POST FILE MIDDLEWARE
exports.getPostFile = catchAsync(async (req, res, next) => {

    // Set the AWS config using secure keys from HEROKU.
    aws.config.setPromisesDependency();
    aws.config.update({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
        region: 'us-west-1',
    });

    // PARAMETER DEFINITION
    const s3 = new aws.S3();

    const params = {
        Bucket: 'sascie',
        Key: req.body.key
    }

    const response = await s3.getObject(params).promise();

    res.status(200).send({
        status: 'success',
        data: response
    })
})

exports.addPost = catchAsync(async(req, res, next) => {
    const indicatorId = req.params?.indicatorId ? mongoose.Types.ObjectId(req.params.indicatorId) : undefined;
    const createdAt = Date.now();

    // Add all post files to AWS S3 
    if(req.files.length !== 0) {

        // Set the AWS config using secure keys from HEROKU.
        aws.config.setPromisesDependency();
        aws.config.update({
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET,
            region: 'us-west-1',
        });

        // PARAMETER DEFINITION
        const s3 = new aws.S3();

        // For every file, store the file in the S3 bucket and return it's location.
        await Promise.all(req.files.map(async file => {
            const params = {
                Body: file.buffer,
                Bucket: 'sascie',
                Key: `posts/docs/${file.originalname.split('.')[0]}-${createdAt}.${file.originalname.split('.')[1]}`,
                ContentType: file.mimetype
            }

            await s3.putObject(params).promise();

        }));
    }

    const fileNames = req.files.map(file => `${file.originalname.split('.')[0]}-${createdAt}.${file.originalname.split('.')[1]}`);

    // Create a new post with all the data except the files.
    const post = await Post.create({
        comment: req.body.comment,
        lastUpdatedAt: Date.now(),
        photo: req.user.photo,
        files: fileNames,
        createdBy: `${req.user.firstName} ${req.user.lastName}`,
        createdAt,
    });

    if(indicatorId) {
        await Indicator.findByIdAndUpdate(indicatorId, {
            $push: { posts: post._id }   
        })
    }

    res.status(201).json({
        status: 'success',
        data: {
            post,
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

    // We need to find the post so we can delete any files from AWS S3 bucket.
    const post = await Post.findById(postId);
    post.remove();

    // Add all post files to AWS S3 
    if(post.files.length !== 0) {

        // Set the AWS config using secure keys from HEROKU.
        aws.config.setPromisesDependency();
        aws.config.update({
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET,
            region: 'us-west-1',
        });

        // PARAMETER DEFINITION
        const s3 = new aws.S3();
        const fileNames = post.files.map(file => ({ Key: `posts/docs/${file}` }));

        // For every file, store the file in the S3 bucket and return it's location.
        const params = {
            Bucket: 'sascie',
            Delete: {
                Objects: fileNames
            }
        }

        await s3.deleteObjects(params).promise();
    }

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