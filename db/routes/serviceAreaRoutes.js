const express = require('express');

const ItemRouter = require('./itemRoutes');
const authController = require('../controllers/authController');
const serviceAreaController = require('../controllers/serviceAreaController');

const serviceAreaRouter = express.Router({ mergeParams: true });

serviceAreaRouter.use('/:serviceAreaId/items', ItemRouter)

serviceAreaRouter
    .route('/')
    .get(authController.refreshToken, authController.protect, serviceAreaController.getServiceAreas)
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin'), serviceAreaController.addServiceArea);

serviceAreaRouter
    .route('/:id')
    .get(authController.refreshToken, authController.protect, serviceAreaController.getServiceArea)
    .patch(authController.refreshToken, authController.protect, serviceAreaController.updateServiceArea)
    .delete(authController.refreshToken, authController.protect, serviceAreaController.deleteServiceArea);


module.exports = serviceAreaRouter;