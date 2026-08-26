const Lead = require('../models/Lead');
const mongoose = require('mongoose');

const getAdminDashboard = async (req, res, next) => {
    try {
        const totalLeads = await Lead.countDocuments();
        const newLeads = await Lead.countDocuments({ status: 'New' });
        const contacted = await Lead.countDocuments({ status: 'Contacted' });
        const followUp = await Lead.countDocuments({ status: 'Follow-up' });
        const proposalSent = await Lead.countDocuments({ status: 'Proposal Sent' });
        const negotiation = await Lead.countDocuments({ status: 'Negotiation' });
        const won = await Lead.countDocuments({ status: 'Won' });
        const lost = await Lead.countDocuments({ status: 'Lost' });

        const totalValueResult = await Lead.aggregate([
            { $match: { status: 'Won' } },
            { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
        ]);
        const wonBusinessValue = totalValueResult.length > 0 ? totalValueResult[0].total : 0;

        const leadsByStatus = await Lead.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const leadsByService = await Lead.aggregate([
            { $group: { _id: '$serviceRequired', count: { $sum: 1 } } }
        ]);

        const leadsByUser = await Lead.aggregate([
            {
                $group: {
                    _id: '$assignedTo',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    userName: '$userInfo.name',
                    userEmail: '$userInfo.email'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalLeads,
                    newLeads,
                    contacted,
                    followUp,
                    proposalSent,
                    negotiation,
                    won,
                    lost,
                    potentialBusinessValue: wonBusinessValue
                },
                charts: {
                    leadsByStatus,
                    leadsByService,
                    leadsByUser
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const getUserDashboard = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const myTotalLeads = await Lead.countDocuments({ assignedTo: userId });
        const myNewLeads = await Lead.countDocuments({ assignedTo: userId, status: 'New' });
        const myContactedLeads = await Lead.countDocuments({ assignedTo: userId, status: 'Contacted' });
        const myFollowUpLeads = await Lead.countDocuments({ assignedTo: userId, status: 'Follow-up' });
        const myProposalLeads = await Lead.countDocuments({ assignedTo: userId, status: 'Proposal Sent' });
        const myWonLeads = await Lead.countDocuments({ assignedTo: userId, status: 'Won' });
        const myLostLeads = await Lead.countDocuments({ assignedTo: userId, status: 'Lost' });

        const totalValueResult = await Lead.aggregate([
            { $match: { assignedTo: userId, status: 'Won' } },
            { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
        ]);
        const myPotentialBusinessValue = totalValueResult.length > 0 ? totalValueResult[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                metrics: {
                    myTotalLeads,
                    myNewLeads,
                    myContactedLeads,
                    myFollowUpLeads,
                    myProposalLeads,
                    myWonLeads,
                    myLostLeads,
                    myPotentialBusinessValue
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
    getUserDashboard
};
