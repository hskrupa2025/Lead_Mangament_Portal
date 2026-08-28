const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./backend/config/db');

const PORT = process.env.PORT || 5001;
let server;

const startServer = async () => {
    try {
        await connectDB();

        server = app.listen(PORT, () => {
            console.log(`[Server] API service listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`[Server Error] Port ${PORT} is already in use. Stop the existing server or set a different PORT in .env.`);
            } else {
                console.error(`[Server Error] ${err.message}`);
            }

            process.exit(1);
        });
    } catch (error) {
        console.error(`[Database Error] ${error.message}`);
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', (err, promise) => {
    console.error(`[Unhandled Promise Rejection] Error: ${err.message}`);
    if (server) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});