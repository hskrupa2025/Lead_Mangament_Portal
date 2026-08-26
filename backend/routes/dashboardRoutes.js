const express = require('express');
const router = express.Router();
const { getAdminDashboard, getUserDashboard } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/admin', requireRole(ROLES.ADMIN), getAdminDashboard);
router.get('/user', getUserDashboard);

module.exports = router;