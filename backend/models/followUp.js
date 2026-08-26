const mongoose = require('mongoose');
const { FOLLOWUP_TYPES } = require('../config/constants');

const followUpSchema = new mongoose.Schema(
    {
        leadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lead',
            required: [true, 'Lead reference is required'],
            index: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator reference is required']
        },
        date: {
            type: Date,
            required: [true, 'Follow-up date is required'],
            default: Date.now
        },
        followUpType: {
            type: String,
            required: [true, 'Follow-up type is required'],
            enum: FOLLOWUP_TYPES
        },
        remarks: {
            type: String,
            required: [true, 'Remarks are required'],
            trim: true
        },
        nextFollowUpDate: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true
    }
);

followUpSchema.index({ leadId: 1, date: -1 });

module.exports = mongoose.model('FollowUp', followUpSchema);