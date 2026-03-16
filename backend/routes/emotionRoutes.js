const express = require('express');
const { handleEmotion } = require('../controllers/emotionController');
const { optionalAuth, requireAuthWhenUserIdPresent } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuth, requireAuthWhenUserIdPresent('body'), handleEmotion);

module.exports = router;
