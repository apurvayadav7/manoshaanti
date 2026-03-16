const express = require('express');
const { getWeeklyMood } = require('../controllers/moodController');
const { authenticateToken, requireUserScope } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/weekly/:userId', authenticateToken, requireUserScope('params'), getWeeklyMood);

module.exports = router;
