const express = require('express');
const {
	submitAssessment,
	getAssessmentRecommendations,
} = require('../controllers/assessmentController');
const { authenticateToken, requireUserScope } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', authenticateToken, requireUserScope('body'), submitAssessment);
router.get('/recommendations/:userId', authenticateToken, requireUserScope('params'), getAssessmentRecommendations);

module.exports = router;
