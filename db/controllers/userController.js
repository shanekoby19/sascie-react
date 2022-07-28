const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');

const handlerFactory = require('./handlerFactory');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const removeSensitiveKeys = require('../utils/removeSensitiveKeys');
const AppError = require('../utils/appError');
const fse = require('fs-extra');

const multerStorage = multer.memoryStorage();

// Check to see if the uploaded file is an image.
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload a valid image file.', 400), false)
    }
}

// Define the middleware function with some the storage and fileFilter options.
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});



exports.hideUser = handlerFactory.hideOne(User);

// Multer photo upload middleware.
exports.uploadUserPhoto = upload.single('photo');

// Custom middleware to resize the user photo and store it into our filesystem.
exports.resizeUserPhoto = (req, res, next) => {
    if(!req.file) return next();

    // Store the filename on the req.file for the next middleware function.
    req.file.filename = `user-${req.user._id}.jpeg`;

    // resize the image, convert it to a jpeg, give it 90% quality and save it to our image directory.
    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`sascie-react/public/img/users/${req.file.filename}`);

    next();
};

exports.getUsers = catchAsync(async(req, res, next) => {
    let users = await User.find();

    // When returning users, only return the information needed for our table.
    // Returning all user info is too costly for the state tree.
    users = users.map(user => ({
        ...user._doc,
        programs: user.programs.map(program => ({
            _id: program._id,
            name: program.name,
            serviceAreas: program.serviceAreas.map(serviceArea => ({
                name: serviceArea.name,
                _id: serviceArea._id
            }))
        })),
        serviceAreas: user.serviceAreas.map(serviceArea => ({
            _id: serviceArea._id,
            name: serviceArea.name,
            items: serviceArea.items.map(item => ({
                name: item.name,
                _id: item._id
            }))
        }))
    }));

    res.status(200).json({
        status: 'success',
        data: {
            docs: users
        }
    })
});

exports.updateMe = catchAsync(async(req, res, next) => {
    // Get the user id from the user object store on the request. (comes from protect middleware)\
    const { _id } = req.user;
    let photo;

    // If a file was not uploaded check to see if a user already has a profile image other than the default.
    if(!req.file) {
        photo = req.user.photo || 'user-default.png';
    } else {
        photo = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(_id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        photo,
    }, {
        new: true,
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    });
});

exports.updateUser = catchAsync(async(req, res, next) => {
    // Get the user id from the user object store on the request. (comes from protect middleware)\
    const userId = req.params?.id ? mongoose.Types.ObjectId(req.params.id) : undefined;

    doc = await User.findByIdAndUpdate(userId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        active: req.body.active,
        serviceAreas: req.body.serviceAreas,
        programs: req.body.programs
    }, {
        new: true,
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    });
});

exports.addUser = catchAsync(async(req, res, next) => {
    let doc = await User.create({
        email: req.body.email,
        role: req.body.role,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        programs: req.body.programs,
        serviceAreas: req.body.serviceAreas,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        programs: req.body.programs,
    });

    // Create a copy of the default photo and save it to the user.
    await fse.copy(`sascie-react/public/img/users/user-default.jpeg`, `sascie-react/public/img/users/user-${doc._id}.jpeg`)

    // Update and return the new document
    doc = await User.findByIdAndUpdate(doc._id, {
        photo: `user-${doc._id}.jpeg`
    }, {
        new: true,
    });

    // Remove sensitive information
    removeSensitiveKeys(doc._doc, 'password', 'confirmPassword');

    res.status(201).json({
        status: 'success',
        data: {
            doc
        }
    });
});
