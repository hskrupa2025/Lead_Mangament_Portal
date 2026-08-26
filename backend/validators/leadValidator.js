const { body } = require('express-validator');
const mongoose = require('mongoose');
const { LEAD_STATUSES, SERVICES, LEAD_SOURCES } = require('../config/constants');

const createLeadValidator = [
    body('leadName').trim().notEmpty().withMessage('Lead name is required'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('mobile')
        .trim()
        .matches(/^\d{10}$/)
        .withMessage('Mobile number must contain exactly 10 digits'),
    body('email').isEmail().withMessage('Valid email address is required').normalizeEmail(),
    body('serviceRequired')
        .isIn(SERVICES)
        .withMessage('Invalid service selection'),
    body('leadSource')
        .isIn(LEAD_SOURCES)
        .withMessage('Invalid lead source selection'),
    body('estimatedValue')
        .isNumeric()
        .withMessage('Estimated value must be a number')
        .custom((val) => val >= 0)
        .withMessage('Estimated value cannot be negative'),
    body('assignedTo')
        .custom((val) => mongoose.Types.ObjectId.isValid(val))
        .withMessage('Invalid assigned user ID format'),
    body('status')
        .optional()
        .isIn(LEAD_STATUSES)
        .withMessage('Invalid lead status'),
    body('remarks').optional().trim()
];

const updateLeadValidator = [
    body('leadName').optional().trim().notEmpty().withMessage('Lead name cannot be empty'),
    body('companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
    body('mobile')
        .optional()
        .trim()
        .matches(/^\d{10}$/)
        .withMessage('Mobile number must contain exactly 10 digits'),
    body('email').optional().isEmail().withMessage('Valid email address is required').normalizeEmail(),
    body('serviceRequired')
        .optional()
        .isIn(SERVICES)
        .withMessage('Invalid service selection'),
    body('leadSource')
        .optional()
        .isIn(LEAD_SOURCES)
        .withMessage('Invalid lead source selection'),
    body('estimatedValue')
        .optional()
        .isNumeric()
        .withMessage('Estimated value must be a number')
        .custom((val) => val >= 0)
        .withMessage('Estimated value cannot be negative'),
    body('assignedTo')
        .optional()
        .custom((val) => mongoose.Types.ObjectId.isValid(val))
        .withMessage('Invalid assigned user ID format'),
    body('status')
        .optional()
        .isIn(LEAD_STATUSES)
        .withMessage('Invalid lead status'),
    body('remarks').optional().trim()
];

const assignLeadValidator = [
    body('assignedTo')
        .custom((val) => mongoose.Types.ObjectId.isValid(val))
        .withMessage('Invalid assigned user ID format')
];

const statusLeadValidator = [
    body('status')
        .isIn(LEAD_STATUSES)
        .withMessage('Invalid lead status')
];
const followUpValidator = [
    body('followUpDate').isISO8601().withMessage('Valid follow-up date is required'),
    body('type').notEmpty().withMessage('Follow-up type is required'),
    body('remarks').trim().notEmpty().withMessage('Remarks are required'),
    body('nextFollowUpDate')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601()
        .withMessage('Valid next follow-up date is required')
];
module.exports = {
    createLeadValidator,
    updateLeadValidator,
    assignLeadValidator,
    statusLeadValidator,
    followUpValidator
};