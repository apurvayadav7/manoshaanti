const express = require('express');
const {
  createUser,
  awardPoints,
  getUserRewards,
  getLeaderboard,
} = require('../controllers/rewardController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', feature: 'rewards' });
});

router.post('/users', createUser);
router.post('/award', awardPoints);
router.get('/users/:userId', getUserRewards);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
