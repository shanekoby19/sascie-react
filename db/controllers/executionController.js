const mongoose = require('mongoose');
const Execution = require('../models/executionModel');
const Item = require('../models/itemModel');

const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getExecutions = handlerFactory.getAll(Execution);
exports.getExecution = handlerFactory.getOne(Execution);

exports.addExecution = catchAsync(async (req, res, next) => {
    // If provided, store the program id as a mongoose ObjectId
    const itemId = req.params?.itemId ? mongoose.Types.ObjectId(req.params?.itemId) : undefined;

    // Create the new execution
    const execution = await Execution.create({
        metric: req.body.metric,
        status: req.body.status,
        indicators: req.body?.indicators || [],
        lastUpdatedBy: `${req.user.firstName} ${req.user.lastName}`,
        lastUpdatedAt: Date.now(),
        required: req.body.required,
    });

    // If the itemId was passed, and the execution to the item.
    if(itemId) {
        await Item.findByIdAndUpdate(itemId, {
            $push: { executions: execution._id }
        })
    }

    res.status(201).json({
        status: 'success',
        data: {
            execution,
            itemId
        }
    })
});

exports.deleteExecution = catchAsync(async(req, res, next) => {
    const executionId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;
    const itemId = req.params?.itemId ? mongoose.Types.ObjectId(req.params.itemId) : undefined;

    if(!executionId) return next(new AppError('An execution id is required to delete an execution', 401));
    await Execution.findByIdAndDelete(executionId);

    if(itemId) {
        await Item.findByIdAndUpdate(itemId, {
            $pull: { executions: executionId }
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            executionId,
            itemId,
        }
    })
});

exports.updateExecution = catchAsync(async(req, res, next) => {
    // Check to see if the execution id was provided in the request.
    const { id } = req.params;
    if(!id) return next(new AppError('Invalid execution id, please resubmit this request with a valid execution id', 401));

    // Check to see if the execution given was a valid id for a current execution.
    let doc = await Execution.findById(id).exec();
    if(!doc) return next(new AppError('No document found with the given id', 401));

    doc = await Execution.findByIdAndUpdate(id, {
        ...req.body,
        lastUpdatedAt: Date.now(),
        lastUpdatedBy: `${req.user.firstName} ${req.user.lastName}`
    }, {
        new: true,
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            doc,
        }
    });
})