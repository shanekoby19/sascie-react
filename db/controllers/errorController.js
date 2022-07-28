const AppError = require("../utils/appError");

// const handleCastErrorDB = (err) => {
//     const message = `Invalid ${err.path}: ${err.value}`
//     return new AppError(message, 400);
// }

// const handleDuplicateFieldsDB = (err) => {
//     const duplicateName = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
//     const message = `Duplicate field value: ${duplicateName}. Please use another value.`
//     return new AppError(message, 400);
// }

// const handleValidationErrorDB = (err) => {
//     const errorMessages = Object.values(err.errors).map(errObj => errObj.message)

//     const message = `Invalid input data: ${errorMessages.join('. ')}`
//     return new AppError(message, 400);
// }

// const handleJWTErrorDB = () => new AppError('Invalid token. Please log in again.', 401);

// const handleJWTExpiredErrorDB = () => new AppError('Your web token has expired, please login again.', 401);

// const sendErrorDev = (err, res) => {
//     res.status(err.statusCode).json({
//         status: err.status,
//         error: err,
//         message: err.message,
//         stack: err.stack
//     });
// };

// const sendErrorProd = (err, res) => {
//     if(err.isOperational) {
//         return res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message,
//         });
//     }

//     // If the error isn't operational (thrown by us) then send a generic message to the client.
//     // Log error for internal use.
//     console.error(`⛔️ ERROR: ${err.message}`);

//     // Send the generic message 
//     res.status(500).json({
//         status: 'error',
//         message: 'Something went wrong.',
//     });
// }

// module.exports = (err, req, res, next) => {
//     // Define a status code and status value if none is given.
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error'

//     if(process.env.NODE_ENV === 'development') {
//         sendErrorDev(err, res);
//     } 
//     else if(process.env.NODE_ENV === 'production') {
//         let error = Object.assign(err);

//         if(error.name === 'CastError') {
//             error = handleCastErrorDB(error);
//         }
//         if(error.code === 11000) {
//             error = handleDuplicateFieldsDB(error);
//         }
//         if(error.name === 'ValidationError') {
//             error = handleValidationErrorDB(error);
//         }
//         if(error.name === 'JsonWebTokenError') {
//             error = handleJWTErrorDB();
//         }
//         if(error.name === 'TokenExpiredError') {
//             error = handleJWTExpiredErrorDB();
//         }

//         sendErrorProd(error, res);
//     }

    
//     next();
// };

const sendDevError = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        statusCode: err.statusCode,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const handleDuplicationErrorDB = (err) => {
    // Use a regular express to find the duplicate field name.
    // Example Error: E11000 duplicate key error collection: Sassie.users index: email_1 dup key: { email: \"skobylecky1@gmail.com\" }
    const duplicateName = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${duplicateName}. Please use another value.`;
    return new AppError(message, 400);
}


const sendProdError = (err, res) => {
    let error = Object.assign(err);

    // Check for a duplicate error key.
    if(error.code === 11000) {
        error = handleDuplicationErrorDB(error);
    }

    return res.status(error.statusCode).json({
        status: error.status,
        error: error.message
    });
}

module.exports = (err, req, res, next) => {
    // If the error does not have a status code set it to internal server error (500)
    if(!err.statusCode) err.statusCode = 500;
    if(!err.status) err.status = err.statusCode === 500 ? 'error' : 'fail';


    if(process.env.NODE_ENV === 'development') {
        return sendDevError(err, res);
    }
    else {
        return sendProdError(err, res);
    }
}