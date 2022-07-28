const express = require('express');

const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

const postRouter = express.Router({ mergeParams: true });

postRouter
    .route('/')
    .get(authController.refreshToken, authController.protect, postController.getAllPosts)
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin', 'inputer'), postController.uploadFiles, postController.addPost)

postRouter
    .route('/:id')
    .get(authController.refreshToken, authController.protect, postController.getPost)
    .patch(authController.refreshToken, authController.protect, authController.restrictTo('admin', 'inputer'), postController.updatePost)
    .delete(authController.refreshToken, authController.protect, authController.restrictTo('admin', 'inputer'), postController.deletePost)

module.exports = postRouter;