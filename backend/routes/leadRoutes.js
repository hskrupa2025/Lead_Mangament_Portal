const express = require('express');
const router = express.Router();
const {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
    updateLeadStatus
} = require('../controllers/leadController');

// 1. Import follow-up controllers and validators here
const {
    getFollowUpsForLead,
    createFollowUp
} = require('../controllers/followUpController');
const { followUpValidator } = require('../validators/leadValidator');

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
    createLeadValidator,
    updateLeadValidator,
    assignLeadValidator,
    statusLeadValidator
} = require('../validators/leadValidator');
const { validate } = require('../middleware/validationMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', requireRole(ROLES.ADMIN), createLeadValidator, validate, createLead);
router.put('/:id', updateLeadValidator, validate, updateLead);
router.delete('/:id', deleteLead);
router.patch('/:id/assign', requireRole(ROLES.ADMIN), assignLeadValidator, validate, assignLead);
router.patch('/:id/status', statusLeadValidator, validate, updateLeadStatus);

// 2. Add these routes so /api/leads/:id/followups works seamlessly
router.get('/:id/followups', getFollowUpsForLead);
router.post('/:id/followups', (req, res, next) => {
    req.body.leadId = req.params.id;
    next();
}, followUpValidator, validate, createFollowUp);

module.exports = router;