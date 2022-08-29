const multer = require('multer');
const mongoose = require('mongoose');

const handlerFactory = require('./handlerFactory');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const removeSensitiveKeys = require('../utils/removeSensitiveKeys');
const aws = require('aws-sdk');
const { createAsyncThunk } = require('@reduxjs/toolkit');

exports.hideUser = handlerFactory.hideOne(User);

// Define the middleware function with some the storage and fileFilter options.
const upload = multer();

// Multer photo upload middleware.
exports.uploadUserPhoto = upload.single('photo');

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
        photo = req.file.originalname;

        // Set the aws configurations.
        aws.config.setPromisesDependency();
        aws.config.update({
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET,
            region: 'us-west-1',
        });

        // PARAMETER DEFINITION
        const s3 = new aws.S3();

        // Ensure we do not delete the default user image from the AWS bucket.
        if(req.body.oldKey !== 'img/users/default-user.png') {
            // Delete the old file
            let params = {
                Bucket: 'sascie',
                Delete: {
                    Objects: [{
                        Key: req.body.oldKey
                    }]
                }
            }
            await s3.deleteObjects(params).promise();
        }

        // Add the new file
        params = {
            Body: req.file.buffer,
            Bucket: 'sascie',
            Key: req.body.newKey,
            ContentType: req.file.mimetype
        }

        await s3.putObject(params).promise();

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

exports.getUserProfilePicture = catchAsync(async(req, res, next) => {
    // Set the AWS config using secure keys from HEROKU.
    aws.config.setPromisesDependency();
    aws.config.update({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
        region: 'us-west-1',
    });

    // PARAMETER DEFINITION
    const s3 = new aws.S3();

    const params = {
        Bucket: 'sascie',
        Key: req.body.key
    }

    const response = await s3.getObject(params).promise();

    res.status(200).send({
        status: 'success',
        data: response
    })
})

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
        photo: 'default-user.png',
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

exports.updateAuthUserPhoto = createAsyncThunk(async(req, res, next) => {
    // // Set the AWS config using secure keys from HEROKU.
    // aws.config.setPromisesDependency();
    // aws.config.update({
    //     accessKeyId: process.env.AWS_KEY,
    //     secretAccessKey: process.env.AWS_SECRET,
    //     region: 'us-west-1',
    // });

    // // PARAMETER DEFINITION
    // const s3 = new aws.S3();

    // // Delete the old file
    // let params = {
    //     Bucket: 'sascie',
    //     Delete: {
    //         Objects: [{
    //             Key: oldKey
    //         }]
    //     }
    // }
    // await s3.deleteObjects(params).promise();

    // // Add the new file
    // params = {
    //     Body: Buffer.from(newFile),
    //     Bucket: 'sascie',
    //     Key: newKey,
    //     ContentType: newFile.mimetype
    // }

    // await s3.putObject(params).promise();

    res.status(200).json({
        status: 'success'
    })
})
