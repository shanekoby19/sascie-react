const express = require('express');

const authController = require('../controllers/authController');
const executionController = require('../controllers/executionController');
const indicatorRouter = require('./indicatorRoutes');

const executionRouter = express.Router({ mergeParams: true });

executionRouter.use('/:executionId/indicators', indicatorRouter);

executionRouter
    .route('/')
    .get(authController.refreshToken, authController.protect, executionController.getExecutions)
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin'), executionController.addExecution);

executionRouter
    .route('/:id')
    .get(authController.refreshToken, authController.protect, executionController.getExecution)
    .patch(authController.refreshToken, authController.protect, executionController.updateExecution)
    .delete(authController.refreshToken, authController.protect, authController.restrictTo('admin'), executionController.deleteExecution);

module.exports = executionRouter;