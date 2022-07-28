const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    const docs = await Model.find();

    res.status(200).json({
        status: 'success',
        data: {
            docs
        }
    })
});

exports.getOne = (Model) => catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const doc = await Model.findById(id);

    if(!doc) return next(new AppError('We could not find a document with the given id.'));

    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
});

exports.hideOne = (Model) => catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id);
    if(!doc) return next(new AppError('We were unable to find a document with that ID', 401));

    const updatedUser = await Model.findByIdAndUpdate(id, { active: false }, {
        new: true,
    });
    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    });
});

exports.updateOne = (Model) => catchAsync(async(req, res, next) => {
    // Check to see if a userId was given in the route parameter.
    const { id } = req.params;
    if(!id) return next(new AppError('Invalid user id, please resubmit this request with a valid user id', 401));

    // Check to see if the userId given was a valid id for a current user.
    let doc = await Model.findById(id).exec();
    if(!doc) return next(new AppError('No document found with the given id', 401));

    doc = await Model.findByIdAndUpdate(id, req.body, {
        new: true,
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            doc,
        }
    });
})