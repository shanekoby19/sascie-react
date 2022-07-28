const express = require('express');

const executionRouter = require('../routes/executionRoutes');
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');

const itemRouter = express.Router({ mergeParams: true });

itemRouter.use('/:itemId/executions', executionRouter);

itemRouter
    .route('/')
    .get(authController.refreshToken, authController.protect, itemController.getItems)
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin'), itemController.addItem);

itemRouter
    .route('/:id')
    .get(authController.refreshToken, authController.protect, itemController.getItem)
    .patch(authController.refreshToken, authController.protect, authController.restrictTo('admin'), itemController.updateItem)
    .delete(authController.refreshToken, authController.protect, authController.restrictTo('admin'), itemController.deleteItem);

module.exports = itemRouter;