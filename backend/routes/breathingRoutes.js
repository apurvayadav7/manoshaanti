const express = require('express');

const router = express.Router();

// Phase 10 breathing pattern data for frontend animation.
router.get('/pattern', (req, res) => {
  return res.json({
    pattern: {
      inhaleSeconds: 4,
      holdSeconds: 4,
      exhaleSeconds: 4,
    },
    cycleLabel: '4-4-4',
  });
});

module.exports = router;
