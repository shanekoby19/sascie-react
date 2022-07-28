const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const removeSensitiveKeys = require('../utils/removeSensitiveKeys');
const sendEmail = require('../utils/email');

// Helper function to sign a token given payload, secret and expiration.
const signToken = (payload, secret, timeString) => {
    const token = jwt.sign(payload, secret, {
        expiresIn: timeString,
    });

    return token;
}

// Logs the user in granting an accessToken and storing a refresh token.
exports.login = catchAsync(async (req, res, next) => {
    // Check to see if email and password were sent in the request.
    if(!req.body.email || !req.body.password) {
        return next(new AppError('Username and password must be provided to login.', 401))
    }

    // Check to see if the a user exists with the given email address.
    let user = await User.findOne({ email: req.body.email }, {firstName: 1, lastName: 1, email: 1, password: 1, role: 1, active: 1, serviceAreas: 1, programs: 1});
    if(!user) return next(new AppError('Invalid email address or password, please try again.', 401))

    // Check to see if the user is active.
    if(!user.active) return next(new AppError('You account has been deactivated, please contact your system administrator.', 401))

    // Check to see if the password given matches the user found.
    const passwordMatched = await bcrypt.compare(req.body.password, user.password);
    if(!passwordMatched) {
        return next(new AppError('Invalid email address or password, please try again.', 401))
    }

    // Remove the password before sending the user back to the client.
    removeSensitiveKeys(user._doc, 'password');

    // Create the access token - expires quickly only for login.
    const accessToken = signToken({id: user._id}, process.env.ACCESS_TOKEN_SECRET, '15m');

    // Create the refresh token - expires in three hours - stored in httpOnly cookie
    const refreshToken = signToken({id: user._id}, process.env.REFRESH_TOKEN_SECRET, '3hr');
    res.cookie('jwt', refreshToken, {
        maxAge: 1000 * 60 * 60 * 3, // 3 hours
        httpOnly: true,
        sameSite: 'Strict',
    });

    // Store the refresh token in the database.
    user = await User.findByIdAndUpdate(user._id, { refreshToken }, {
        new: true,
        runValidators: true,
    });

    // Send the user back.
    res.status(200).json({
        status: 'success',
        data: {
            user
        },
        accessToken,
    });
});

exports.logout = catchAsync(async(req, res, next) => {
    const refreshToken = req.cookies?.jwt;

    if(!refreshToken) return next(new AppError('Invalid refresh token, please login again to gain access to this route', 401));

    // Set the freshToken to an empty string in the database.
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });

    // Clear the httpOnly cookie from the res.cookie
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'Strict',
    })

    // Send a blank access token back to the user. -- For clean up on front-end;
    res.status(200).json({
        data: {
            accessToken: '',
        }
    })
});


// Refreshes the users access token.
exports.refreshToken = catchAsync(async (req, res, next) => {
    // Get the httpOnly cookie where the jwt was set.
    const refreshToken = req.cookies?.jwt;

    // If no cookie was set, send an authorization error.
    if(!refreshToken) return next(new AppError('No authorization cookie provided, please login again.', 401));

    // Verify that the users refresh token is still valid - 3hr window
    const verified = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if(!verified) return next(new AppError('Your refresh token has expired, please log in again to get a new one.', 401));

    // Create a new access token and send it along with the request.
    // verified.id is the _id of the user who the token belongs to.    
    const newAccessToken = signToken({id: verified.id}, process.env.ACCESS_TOKEN_SECRET, '15m');

    // Set the new access token that will be verified by the protect middleware
    req.headers.authorization = `Bearer: ${newAccessToken}`;

    next();
});

// Sends a reset token to the users email so they can reset their password.
exports.sendResetToken = catchAsync(async(req, res, next) => {
    // Make sure an email was provided in the request.
    const { email } = req.body;
    if(!email) return next(new AppError('You must provide an email to reset your password.'), 401);

    // Make sure the email belongs to a user in the database.
    const user = await User.findOne({ email });
    if(!user) return next(new AppError('No user was found with the given email address.'), 401);

    // Make sure the user is an active user.
    if(!user.active) return next(new AppError('You account has been deactivated, please contact your system administrator.'), 401);

    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send the email to the given email address.
    const message = `Forgot your password? Please submit the code provided below to the forgot password form.\n${resetToken}\nIf you didn\'t forgot your password, please contact your system administration right away.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message,
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Please try again later.'), 500);
    }

    // Send the email that was upd
    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    })
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    // Get the token, password, and confirm password from the request.
    const { passwordResetToken } = req.params;
    const { password, confirmPassword } = req.body;

    // If password or confirm password isn't present return the appropriate error.
    if(!password || !confirmPassword) return next(new AppError('Password and confirm password are required fields.'), 400)

    // Recreate the hashed token and see if it matches a user in the database.
    const hashedToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken });
    if(!user) return next(new AppError('No user was found with the given reset token. Please check the token and try again.'), 401);

    // Check to see if the update happened in the required 10 minute timeframe.
    if(user.passwordResetExpires < Date.now()) return next(new AppError('Password reset token has expired, please request another one at the login screen.'), 401);

    // Get the updated user after applying the password updates.
    const updatedUser = await User.findByIdAndUpdate(user._id, {
        password,
        confirmPassword
    }, {
        new: true,
    })

    // Send the updatedUser back to the client.
    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    })
});

// Protects routes by verifing an access token.
exports.protect = catchAsync(async (req, res, next) => {
    // Check to see if the JWT was provided in the request.
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next(new AppError('You must be authenticated to access this route.', 400));
    }

    // Get the token from the authorization header.
    const token = req.headers.authorization.split(' ')[1];

    // Verify that the token is valid
    const verified = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!verified) return next(new AppError('Invalid token, please request another one and retry.', 400));

    // Check to see if the user still exists
    const user = await User.findById(verified.id);
    if(!user) return next(new AppError('The user associated with this token no longer exists.', 400));

    // Pass the user to the next request
    req.user = user;

    next();
});

// Restricts routes given any number of string parameters
// OPTIONS - 'inputer', 'admin'
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) return next(new AppError('You are not authorized to perform this action. Please contact your account administrator', 400));
        
        next();
    };
}