// routes/chatRoutes.js
// Defines Express routes for the chatbot feature.
// All routes here are mounted at /api/chat in server.js.

const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');

// POST /api/chat
// Body: { "message": "I feel overwhelmed" }
// Returns: { "reply": "...", "emotion": "sad" }
router.post('/', handleChat);

module.exports = router;
