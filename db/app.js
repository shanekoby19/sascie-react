// MIDDLEWARE / EXPRESS
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// ROUTERS
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const programRouter = require('./routes/programRoutes');
const serviceAreaRouter = require('./routes/serviceAreaRoutes');
const itemRouter = require('./routes/itemRoutes');
const executionRouter = require('./routes/executionRoutes');
const indicatorRouter = require('./routes/indicatorRoutes');
const postRouter = require('./routes/postRoutes');

// HELPERS
const globalErrorHandler = require('./controllers/errorController');
const credentials = require('./utils/credentials');
const AppError = require('./utils/appError');

// APPLICATION
const app = express();

app.use(credentials);

app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    optionsSuccessStatus: 200
}));

// Apply cookie middleware for parsing cookies from incoming requests.
app.use(cookieParser());

// Parse incoming requests with JSON payloads. (Content-type: "Applcation/JSON")
app.use(express.json());

// Mount User Router to '/api/v1/users'.
app.use('/api/v1/users', userRouter);

// Mount Auth Router to '/api/v1/auth'.
app.use('/api/v1/auth', authRouter);

// Mount Program Router to '/api/v1/programs'.
app.use('/api/v1/programs', programRouter);

// Mount Service Area Router to '/api/v1/service-areas'.
app.use('/api/v1/service-areas', serviceAreaRouter);

// Mount Item Router to '/api/v1/items'.
app.use('/api/v1/items', itemRouter);

// Mount Execution Router to '/api/v1/exections'.
app.use('/api/v1/executions', executionRouter);

// Mount Indicator Router to '/api/v1/indicators'.
app.use('/api/v1/indicators', indicatorRouter);

// Mount Item Router to '/api/v1/items'.
app.use('/api/v1/posts', postRouter);

// Compresses the text sent to a client in the response object.
app.use(compression());

// Middleware for any route that does not exist on the server.
app.use('*', (req, res, next) => {
    return next(new AppError('This route does not exists, redirecting in 3s', 400));
})

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;