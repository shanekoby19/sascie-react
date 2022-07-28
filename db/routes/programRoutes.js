const express = require('express');
const authController = require('../controllers/authController');
const programController = require('../controllers/programController');
const serviceAreaRouter = require('./serviceAreaRoutes')

const programRouter = express.Router();

programRouter.use('/:programId/service-areas', serviceAreaRouter);

programRouter
    .route('/')
    .get(authController.refreshToken, authController.protect, programController.getPrograms)
    .post(authController.refreshToken, authController.protect, authController.restrictTo('admin'), programController.addProgram)
    
programRouter
    .route('/:id')
    .get(authController.refreshToken, authController.protect, programController.getProgram)
    .patch(authController.refreshToken, authController.protect, authController.restrictTo('admin'), programController.updateProgram)

module.exports = programRouter;