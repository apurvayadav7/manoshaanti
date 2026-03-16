const express = require('express');
const { signup, login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/register', signup);
router.post('/login', login);
router.get('/me', authenticateToken, me);

module.exports = router;
