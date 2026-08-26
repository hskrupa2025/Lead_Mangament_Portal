const { body } = require('express-validator');
const { ROLES } = require('../config/constants');

const createUserValidator = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid user role')
];

const updateUserValidator = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid user role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

module.exports = {
    createUserValidator,
    updateUserValidator
};
