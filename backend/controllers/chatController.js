// controllers/chatController.js
// This file handles the logic for the /api/chat Express endpoint.
// It receives the message from the frontend, attaches the stored emotion,
// then forwards both to the FastAPI service and sends the reply back.

const axios = require('axios');

// In-memory store for the last detected emotion.
// This is shared with emotionController.js (Phase 3).
// We use a simple module-level variable — good enough for a hackathon.
let currentEmotion = null;

/**
 * Called by emotionRoutes to update the stored emotion.
 * This lets chatController read the latest emotion without a database.
 */
function setEmotion(emotion) {
  currentEmotion = emotion;
}

/**
 * POST /api/chat
 * Body: { "message": "I feel anxious today" }
 * Response: { "reply": "...", "emotion": "sad" }
 */
async function handleChat(req, res) {
  const { message } = req.body;

  // Basic validation
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Forward the message + current emotion to the FastAPI AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    const response = await axios.post(`${aiServiceUrl}/chat/`, {
      message: message.trim(),
      emotion: currentEmotion   // Will be null if no emotion detected yet
    });

    // Send the reply back to the frontend
    return res.json({
      reply: response.data.reply,
      emotion: currentEmotion   // Echo it back so frontend knows what was used
    });

  } catch (error) {
    if (error.response) {
      console.error('FastAPI error response:', error.response.data);
    } else {
      console.error('Chat error:', error.message);
    }

    // Distinguish between "AI service is down" vs other errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service is not running. Start FastAPI on port 8000.' });
    }
    return res.status(500).json({ 
      error: 'Something went wrong. Please try again.',
      details: error.response ? error.response.data : error.message
    });
  }
}

module.exports = { handleChat, setEmotion };
