const mongoose = require('mongoose');

const Item = require('../models/itemModel');
const ServiceArea = require('../models/serviceAreaModel');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getItems = handlerFactory.getAll(Item);
exports.getItem = handlerFactory.getOne(Item);
exports.updateItem = handlerFactory.updateOne(Item);

exports.addItem = catchAsync(async(req, res, next) => {
    const serviceAreaId = req.params?.serviceAreaId;

    const item = await Item.create({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        executions: req.body.executions
    });

    if(serviceAreaId) {
        await ServiceArea.findByIdAndUpdate(serviceAreaId, {
            $push: { items: item._id }
        });
    }

    res.status(201).json({
        status: 'success',
        data: {
            item,
            serviceAreaId
        }
    });
});

exports.deleteItem = catchAsync(async(req, res, next) => {
    const serviceAreaId = req.params?.serviceAreaId ? mongoose.Types.ObjectId(req.params.serviceAreaId) : undefined;
    const itemId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;

    const item = await Item.findById(itemId);
    if(!item) return next(new AppError('We could not find an item with the id that was given.'));

    await Item.findByIdAndDelete(itemId);

    if(serviceAreaId) {
        await ServiceArea.findByIdAndUpdate(serviceAreaId, {
            $pull: { items: itemId }
        });
    }

    res.status(201).json({
        status: 'success',
        data: {
            itemId,
            serviceAreaId
        }
    });
});