const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured. Add it to your .env file.');
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};

module.exports = connectDB;
