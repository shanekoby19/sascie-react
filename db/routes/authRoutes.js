const express = require('express');
const authController = require('../controllers/authController');

const authRouter = express.Router();

authRouter
    .route('/login')
    .post(authController.login);

authRouter
    .route('/logout')
    .post(authController.logout);

authRouter
    .route('/send-reset-token')
    .post(authController.sendResetToken);

authRouter
    .route('/reset-password/:passwordResetToken')
    .post(authController.resetPassword);

module.exports = authRouter;