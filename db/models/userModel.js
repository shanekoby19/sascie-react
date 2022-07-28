const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const AppError = require('../utils/appError');


const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: [true, 'You must provide a first name.']
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, 'You must provide a last name.']
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'You must provide a valid email address.'],
        unique: true,
        lowercase: true,
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'You must provide a password.'],
        minLength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    confirmPassword: {
        type: String,
        trim: true,
        required: [true, 'You must provide a password confirmation.'],
        minLength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'inputer', 'viewer'],
            message: 'Please select a valid role for this user. (admin, inputer, viewer)'
        },
        required: true,
        default: 'viewer'
    },
    active: {
        type: Boolean,
        default: true,
    },
    refreshToken: {
        type: String,
        default: "",
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: Date,
    programs: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Program'
        }
    ],
    serviceAreas: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'ServiceArea'
        }
    ]
});

// DOCUMENT MIDDLEWARE

// Confirm the password and confirmPassword fields match.
userSchema.pre('save', async function(next) {
    // If the password has already been removed then we can skip this step.
    if(this.password) { 
        // Check to ensure the passwords match.
        if(this.password !== this.confirmPassword) {
            return next(new AppError('Your passwords do not match'));
        }

        // Hash the password before saving to the database.
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmPassword = '';
    }

    next();
});

// QUERY MIDDLEWARE

// Populate service areas on the users collection
userSchema.pre(/^find/, function(next) {
    this.populate('programs').populate('serviceAreas');

    next();
})


// Encrypt password data on password updates
userSchema.pre('findOneAndUpdate', async function(next) {
    const updatedDoc = this._update;

    // Check the updated document to ensure password is valid.
    // Encrypt the plain text password using bcrypt.
    if(updatedDoc?.password || updatedDoc?.confirmPassword) {
        if(updatedDoc?.password?.length < 8 || updatedDoc?.confirmPassword?.length < 8) return next(new AppError('One of your password fields does not meet the length requirement. Length must be at least 8 characters'));
        if(updatedDoc?.password !== updatedDoc?.confirmPassword) return next(new AppError('Password do not match.'));
        this._update.password = await bcrypt.hash(this._update.password, 12);
        this._update.confirmPassword = ''
    }

    // Check to updated document to ensure a valid role was provided.
    if(updatedDoc?.role && !['admin', 'viewer', 'inputer'].includes(updatedDoc.role)) {
        return next(new AppError(`Role must be: 'admin', 'viewer', or 'inputer'.`))
    }

    next();
});

userSchema.methods.createPasswordResetToken = function() {
    // Create the reset token
    const resetPasswordToken = crypto.randomBytes(8).toString('hex');

    // Encrypt the token before saving to the database.
    this.passwordResetToken = crypto.createHash('sha256')
                                    .update(resetPasswordToken)
                                    .digest('hex');
    // Set the the minute timer.
    this.passwordResetExpires = Date.now() + 1000 * 60 * 10;

    return resetPasswordToken;
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;