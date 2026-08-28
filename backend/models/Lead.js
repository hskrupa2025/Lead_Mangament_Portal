const mongoose = require('mongoose');
const { LEAD_STATUSES, SERVICES, LEAD_SOURCES } = require('../config/constants');

const leadSchema = new mongoose.Schema(
    {
        leadName: {
            type: String,
            required: [true, 'Lead name is required'],
            trim: true,
            index: true
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            index: true
        },
        mobile: {
            type: String,
            required: [true, 'Mobile number is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            index: true
        },
        serviceRequired: {
            type: String,
            required: [true, 'Service required is mandatory'],
            enum: SERVICES,
            index: true
        },
        leadSource: {
            type: String,
            required: [true, 'Lead source is mandatory'],
            enum: LEAD_SOURCES
        },
        estimatedValue: {
            type: Number,
            required: [true, 'Estimated value is required'],
            min: [0, 'Estimated value cannot be negative'],
            default: 0
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigned user is required'],
            index: true
        },
        remarks: {
            type: String,
            default: '',
            trim: true
        },
        status: {
            type: String,
            required: [true, 'Status is required'],
            enum: LEAD_STATUSES,
            default: 'New',
            index: true
        },
        statusHistory: [{
            fromStatus: {
                type: String,
                enum: LEAD_STATUSES
            },
            toStatus: {
                type: String,
                required: true,
                enum: LEAD_STATUSES
            },
            changedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            changedAt: {
                type: Date,
                default: Date.now
            }
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);