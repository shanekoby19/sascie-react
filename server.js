;const mongoose = require('mongoose')
require('dotenv').config({path: './config.env'});

const app = require('./db/app');

const connectToDatabase = async () => {
    const connectionString = process.env.CONN_STRING
                         .replace('<username>', process.env.DB_USERNAME)
                         .replace('<password>', process.env.DB_PASSWORD)
                         .replace('<dbName>', process.env.DB_NAME)

    await mongoose.connect(connectionString);
}

connectToDatabase();

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});