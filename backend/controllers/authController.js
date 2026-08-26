const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const identifier = email.trim().toLowerCase();

        // The functional requirement uses "admin" as the administrator's
        // username. The seeded administrator is stored as admin@example.com.
        const loginEmail = identifier === 'admin' ? 'admin@example.com' : identifier;

        const user = await User.findOne({ email: loginEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact administrator.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id, user.role);

        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        };

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Successfully logged out'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    getMe,
    logout
};
