const mongoose = require('mongoose');

const Indicator = require('../models/indicatorModel');
const Execution = require('../models/executionModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getIndicator = handlerFactory.getOne(Indicator);
exports.getIndicators = handlerFactory.getAll(Indicator);

exports.addIndicator = catchAsync(async(req, res, next) => {
    // If provided, store the program id as a mongoose ObjectId
    const executionId = req.params?.executionId ? mongoose.Types.ObjectId(req.params?.executionId) : undefined;

    // Create the new execution
    const indicator = await Indicator.create({
        description: req.body.description,
        posts: req.body.posts,
    });

    // If the executionId was passed, add the indicator to the execution.
    if(executionId) {
        await Execution.findByIdAndUpdate(executionId, {
            $push: { indicators: indicator._id }
        })
    }

    res.status(201).json({
        status: 'success',
        data: {
            indicator,
            executionId
        }
    })

});


exports.deleteIndicator = catchAsync(async(req, res, next) => {
    const executionId = req.params?.executionId ? mongoose.Types.ObjectId(req.params.executionId) : undefined;
    const indicatorId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;

    const indicator = await Indicator.findById(indicatorId);
    if(!indicator) return next(new AppError('We could not find an indicator with the id that was given.'));

    await Indicator.findByIdAndDelete(indicatorId);

    if(executionId) {
        await Execution.findByIdAndUpdate(executionId, {
            $pull: { indicators: indicator._id }
        });
    }

    res.status(201).json({
        status: 'success',
        data: {
            indicatorId,
            executionId,
        }
    });
});

exports.updateIndicator = catchAsync(async(req, res, next) => {
    const indicatorId = mongoose.Types.ObjectId(req.params.id);

    // Return an error if no indicatorId was provided
    if(!indicatorId) return next('An valid indicator id is required to delete an indicator.');

    // Update the indicator description and status.
    const updatedIndicator = await Indicator.findByIdAndUpdate(indicatorId, {
        description: req.body.description,
        status: req.body.status
    }, { 
        new: true,
        runValidators: true
     });

    res.status(201).json({
        status: 'success',
        data: {
            updatedIndicator
        }
    })
});