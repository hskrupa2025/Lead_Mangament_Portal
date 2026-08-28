const Lead = require('../models/Lead');
const User = require('../models/User');
const FollowUp = require('../models/followUp');
const { ROLES } = require('../config/constants');

const getLeads = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const query = {};

        if (req.user.role === ROLES.USER) {
            query.assignedTo = req.user._id;
        } else if (req.query.assignedTo) {
            query.assignedTo = req.query.assignedTo;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.service) {
            query.serviceRequired = req.query.service;
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { leadName: searchRegex },
                { companyName: searchRegex },
                { email: searchRegex },
                { mobile: searchRegex }
            ];
        }

        const allowedSortFields = ['createdAt', 'estimatedValue', 'leadName', 'status'];
        const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sortOptions = { [sortBy]: sortOrder };

        const total = await Lead.countDocuments(query);
        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name email')
            .sort(sortOptions)
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: leads.length,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: leads
        });
    } catch (error) {
        next(error);
    }
};

const getLeadById = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name email')
            .populate('statusHistory.changedBy', 'name email');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (req.user.role === ROLES.USER && lead.assignedTo._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You do not have permission to view this lead.'
            });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

const createLead = async (req, res, next) => {
    try {
        const {
            leadName,
            companyName,
            mobile,
            email,
            serviceRequired,
            leadSource,
            estimatedValue,
            assignedTo,
            remarks,
        } = req.body;

        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || !assignedUser.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Assigned user does not exist or is inactive'
            });
        }

        const lead = await Lead.create({
            leadName,
            companyName,
            mobile,
            email,
            serviceRequired,
            leadSource,
            estimatedValue: estimatedValue || 0,
            assignedTo,
            remarks: remarks || '',
            status: 'New',
            statusHistory: [{
                toStatus: 'New',
                changedBy: req.user._id
            }],
            createdBy: req.user._id
        });

        const populatedLead = await Lead.findById(lead._id)
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: populatedLead
        });
    } catch (error) {
        next(error);
    }
};

const updateLead = async (req, res, next) => {
    try {
        let lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (req.user.role === ROLES.USER && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You are not authorized to modify this lead.'
            });
        }

        if (req.user.role === ROLES.USER) {
            delete req.body.assignedTo;
        }

        if (req.body.assignedTo) {
            const assignedUser = await User.findById(req.body.assignedTo);
            if (!assignedUser || !assignedUser.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Target assigned user does not exist or is inactive'
                });
            }
        }

        if (req.body.status && req.body.status !== lead.status) {
            lead.statusHistory = lead.statusHistory || [];
            lead.statusHistory.push({
                fromStatus: lead.status,
                toStatus: req.body.status,
                changedBy: req.user._id
            });
        }

        lead = await Lead.findByIdAndUpdate(req.params.id, {
            ...req.body,
            ...(req.body.status && req.body.status !== lead.status
                ? { statusHistory: lead.statusHistory }
                : {})
        }, {
            new: true,
            runValidators: true
        })
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Lead updated successfully',
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

const deleteLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (req.user.role === ROLES.USER && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You are not authorized to delete this lead.'
            });
        }

        await FollowUp.deleteMany({ leadId: lead._id });
        await lead.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Lead and associated follow-up history deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

const assignLead = async (req, res, next) => {
    try {
        const { assignedTo } = req.body;

        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || !assignedUser.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Target assigned user does not exist or is inactive'
            });
        }

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email role');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lead assignment updated successfully',
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

const updateLeadStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        let lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (req.user.role === ROLES.USER && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You are not authorized to modify this lead.'
            });
        }

        if (lead.status !== status) {
            const previousStatus = lead.status;
            lead.status = status;
            lead.statusHistory = lead.statusHistory || [];
            lead.statusHistory.push({
                fromStatus: previousStatus,
                toStatus: status,
                changedBy: req.user._id
            });
            await lead.save();
        }

        res.status(200).json({
            success: true,
            message: 'Lead status updated successfully',
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
    updateLeadStatus
};