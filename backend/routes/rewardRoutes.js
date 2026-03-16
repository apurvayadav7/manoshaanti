const express = require('express');
const {
  createUser,
  awardPoints,
  awardAction,
  awardActivityCompletion,
  getUserRewards,
  getLeaderboard,
} = require('../controllers/rewardController');
const { authenticateToken, requireUserScope } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', feature: 'rewards' });
});

router.post('/users', authenticateToken, createUser);
router.post('/award', authenticateToken, requireUserScope('body'), awardPoints);
router.post('/action', authenticateToken, requireUserScope('body'), awardAction);
router.post('/activity-complete', authenticateToken, requireUserScope('body'), awardActivityCompletion);
router.get('/users/:userId', authenticateToken, requireUserScope('params'), getUserRewards);
router.get('/leaderboard', authenticateToken, getLeaderboard);

module.exports = router;
