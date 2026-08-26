const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { createUserValidator, updateUserValidator } = require('../validators/userValidator');
const { validate } = require('../middleware/validationMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/', getUsers);
router.get('/:id', requireRole(ROLES.ADMIN), getUserById);
router.post('/', requireRole(ROLES.ADMIN), createUserValidator, validate, createUser);
router.put('/:id', requireRole(ROLES.ADMIN), updateUserValidator, validate, updateUser);
router.patch('/:id/status', requireRole(ROLES.ADMIN), toggleUserStatus);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteUser);

module.exports = router;