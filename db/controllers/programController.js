const Program = require('../models/programModel');

const handlerFactory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const { default: mongoose } = require('mongoose');
const AppError = require('../utils/appError');

exports.getPrograms = handlerFactory.getAll(Program);
exports.getProgram = handlerFactory.getOne(Program);

exports.addProgram = catchAsync(async(req, res, next) => {
    const program = await Program.create({
        name: req.body.name,
        serviceAreas: req.body.serviceAreas,
    });

    res.status(201).json({
        status: 'success',
        data: {
            program
        }
    })
});

exports.updateProgram = catchAsync(async(req, res, next) => {
    const programId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;

    if(!programId) return next(new AppError('The program ID is required when updating a program.'));

    const updatedProgram = await Program.findByIdAndUpdate(programId, {
        name: req.body.name,
        serviceAreas: req.body.serviceAreas
    });

    res.status(200).send({
        status: 'success',
        data: {
            doc: updatedProgram,
            serviceAreaIds: req.body.serviceAreas
        }
    })
})