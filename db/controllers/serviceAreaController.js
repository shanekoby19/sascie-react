const mongoose = require('mongoose');
const handlerFactory = require('./handlerFactory');
const ServiceArea = require('../models/serviceAreaModel');
const Program = require('../models/programModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getServiceAreas = handlerFactory.getAll(ServiceArea);
exports.getServiceArea = handlerFactory.getOne(ServiceArea);

exports.addServiceArea = catchAsync(async(req, res, next) => {
    const programId = req.params?.programId ? mongoose.Types.ObjectId(req.params.programId) : undefined;

    // Create the new service area.
    const serviceArea = await ServiceArea.create({
        name: req.body.name,
        items: req.body.items,
    });

    // If the programId was passed through, add the service area to the program.
    if(programId) {
        await Program.findByIdAndUpdate(programId, {
            $push: { serviceAreas: serviceArea._id }
        }, {
            new: true,
        });
    }

    res.status(201).json({
        status: 'success',
        data: {
            serviceArea
        }
    });
});

exports.deleteServiceArea = catchAsync(async(req, res, next) => {
    const programId = req.params?.programId ? mongoose.Types.ObjectId(req.params.programId) : undefined;
    const serviceAreaId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;

    // Return an error if programId or serviceAreaId is undefined.
    if(!serviceAreaId) return next('A service area id is required to delete a service area.');

    // Remove the service area from the program, if the programId was given.
    if(programId) {
        await Program.findByIdAndUpdate(programId, {
            $pull: { serviceAreas: serviceAreaId }
        }, {
            new: true,
        });
    }

    // Remove the service area from the servicearea collection.
    await ServiceArea.findByIdAndDelete(serviceAreaId);

    res.status(201).json({
        status: 'success',
        data: {
            programId,
            serviceAreaId
        }
    })
});

exports.updateServiceArea = catchAsync(async(req, res, next) => {
    // const programId = req.params?.programId ? mongoose.Types.ObjectId(req.params.programId) : undefined;
    const serviceAreaId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;

    // Return an error if serviceAreaId is undefined.
    // if(!programId) return next('A program id is required to delete a service area.');
    if(!serviceAreaId) return next('A service area id is required to delete a service area.');

    // Update the service area name and it's items array.
    const newServiceArea = await ServiceArea.findByIdAndUpdate(serviceAreaId, {
        name: req.body.name,
        $push: { items: { $each: req.body.items } }
    }, { new: true });

    res.status(201).json({
        status: 'success',
        data: {
            newServiceArea
        }
    })
});