const express = require('express');
const {
  createJournalEntry,
  getJournalEntries,
  saveJournalSettings,
} = require('../controllers/journalController');
const { authenticateToken, requireUserScope } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/entry', authenticateToken, requireUserScope('body'), createJournalEntry);
router.get('/entries/:userId', authenticateToken, requireUserScope('params'), getJournalEntries);
router.post('/settings', authenticateToken, requireUserScope('body'), saveJournalSettings);

module.exports = router;
