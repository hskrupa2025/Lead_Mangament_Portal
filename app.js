const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./backend/middleware/errorMiddleware');

const authRoutes = require('./backend/routes/authRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const leadRoutes = require('./backend/routes/leadRoutes');
const followUpRoutes = require('./backend/routes/followUpRoutes');
const dashboardRoutes = require('./backend/routes/dashboardRoutes');

const app = express();

// Disabled strict Content Security Policy to allow inline scripts and CDN assets
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
    process.env.CLIENT_URL || 'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000'
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Serve the browser application from the same server as the API.
app.use(express.static(path.join(__dirname, 'frontend')));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Lead Management API is operational',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API Endpoint Not Found - ${req.originalUrl}`
    });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(errorMiddleware);

module.exports = app;