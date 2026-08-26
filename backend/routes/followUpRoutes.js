const express = require('express');
const router = express.Router();
const {
    getFollowUpsForLead,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
} = require('../controllers/followUpController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { followUpValidator } = require('../validators/leadValidator');
const { validate } = require('../middleware/validationMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/lead/:id', getFollowUpsForLead);
router.post('/lead/:id', followUpValidator, validate, createFollowUp);
router.put('/:id', followUpValidator, validate, updateFollowUp);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteFollowUp);

module.exports = router;