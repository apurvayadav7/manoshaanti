const express = require('express');
const { handleEmotion } = require('../controllers/emotionController');

const router = express.Router();

router.post('/', handleEmotion);

module.exports = router;
