const FollowUp = require('../models/followUp');
const Lead = require('../models/Lead');
const { ROLES } = require('../config/constants');

const getFollowUpsForLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Associated lead not found'
            });
        }

        if (req.user.role === ROLES.USER && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You cannot view follow-ups for this lead.'
            });
        }

        const followUps = await FollowUp.find({ leadId: req.params.id })
            .populate('createdBy', 'name email role')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: followUps.length,
            data: followUps
        });
    } catch (error) {
        next(error);
    }
};

const createFollowUp = async (req, res, next) => {
    try {
        const { followUpDate, type, remarks, nextFollowUpDate } = req.body;

        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Associated lead not found'
            });
        }

        if (req.user.role === ROLES.USER && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You cannot add follow-ups for this lead.'
            });
        }

        const followUp = await FollowUp.create({
            leadId: req.params.id,
            createdBy: req.user._id,
            date: followUpDate,
            followUpType: type,
            remarks,
            nextFollowUpDate: nextFollowUpDate || undefined
        });

        if (lead.status === 'New') {
            const previousStatus = lead.status;
            lead.status = 'Contacted';
            lead.statusHistory = lead.statusHistory || [];
            lead.statusHistory.push({
                fromStatus: previousStatus,
                toStatus: lead.status,
                changedBy: req.user._id
            });
            await lead.save();
        }

        const populatedFollowUp = await FollowUp.findById(followUp._id).populate('createdBy', 'name email role');

        res.status(201).json({
            success: true,
            message: 'Follow-up logged successfully',
            data: populatedFollowUp
        });
    } catch (error) {
        next(error);
    }
};

const updateFollowUp = async (req, res, next) => {
    try {
        let followUp = await FollowUp.findById(req.params.id);
        if (!followUp) {
            return res.status(404).json({
                success: false,
                message: 'Follow-up entry not found'
            });
        }

        const lead = await Lead.findById(followUp.leadId);
        if (req.user.role === ROLES.USER && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You cannot modify this follow-up.'
            });
        }

        followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Follow-up record updated successfully',
            data: followUp
        });
    } catch (error) {
        next(error);
    }
};

const deleteFollowUp = async (req, res, next) => {
    try {
        const followUp = await FollowUp.findById(req.params.id);
        if (!followUp) {
            return res.status(404).json({
                success: false,
                message: 'Follow-up record not found'
            });
        }

        await followUp.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Follow-up record deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFollowUpsForLead,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
};
