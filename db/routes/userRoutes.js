const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter
    .route('/')
    .get(authController.refreshToken, authController.protect, userController.getUsers)
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin'), userController.addUser);

userRouter
    .route('/me')
    .patch(authController.refreshToken, authController.protect, authController.restrictTo('admin', 'inputer'), userController.uploadUserPhoto, userController.updateMe)

userRouter
    .route('/:id')
    .patch(authController.refreshToken, authController.protect, authController.restrictTo('admin'), userController.updateUser)
    .delete(authController.refreshToken, authController.protect, authController.restrictTo('admin'), userController.hideUser)

userRouter
    .route('/file')
    .post(authController.refreshToken, authController.protect, userController.getUserProfilePicture)

userRouter
    .route('/updateProfilePicture')
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin', 'inputer'), userController.uploadUserPhoto, userController.updateAuthUserPhoto)

module.exports = userRouter;