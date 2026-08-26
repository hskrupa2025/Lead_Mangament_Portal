const express = require('express');
const router = express.Router();

const { login, getMe, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { loginValidator } = require('../validators/authValidator');
const { validate } = require('../middleware/validationMiddleware');

router.post('/login', loginValidator, validate, login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

module.exports = router;