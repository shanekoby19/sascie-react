const express = require('express');

const authController = require('../controllers/authController');
const indicatorController = require('../controllers/indicatorController');
const postRouter = require('./postRoutes');

const indicatorRouter = express.Router({ mergeParams: true });

indicatorRouter.use('/:indicatorId/posts', postRouter)

indicatorRouter
    .route('/')
    .get(authController.refreshToken, authController.protect, indicatorController.getIndicators)
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin'), indicatorController.addIndicator);

indicatorRouter
    .route('/:id')
    .get(authController.refreshToken, authController.protect, indicatorController.getIndicator)
    .patch(authController.refreshToken, authController.protect, authController.restrictTo('admin', 'inputer'), indicatorController.updateIndicator)
    .delete(authController.refreshToken, authController.protect, authController.restrictTo('admin'), indicatorController.deleteIndicator);

module.exports = indicatorRouter;