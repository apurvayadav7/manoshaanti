// controllers/chatController.js
// This file handles the logic for the /api/chat Express endpoint.
// It receives the message from the frontend, attaches the stored emotion,
// then forwards both to the FastAPI service and sends the reply back.

const axios = require('axios');
const { getJournalContextForChat } = require('./journalController');
const { db } = require('../db/database');

// In-memory store for the last detected emotion.
// This is shared with emotionController.js (Phase 3).
// We use a simple module-level variable — good enough for a hackathon.
let currentEmotion = null;

// Phase 6: Crisis detection phrases.
// We check normalized user text for these high-risk statements.
const crisisPhrases = [
  "i want to kill myself",
  "i don't want to live",
  'i dont want to live',
  'i want to hurt myself',
  'i feel like ending my life'
];

function isCrisisMessage(message) {
  const normalized = message.toLowerCase().replace(/\s+/g, ' ').trim();
  return crisisPhrases.some((phrase) => normalized.includes(phrase));
}

/**
 * Called by emotionRoutes to update the stored emotion.
 * This lets chatController read the latest emotion without a database.
 */
function setEmotion(emotion) {
  currentEmotion = emotion;
}

function parseUserId(userId) {
  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return null;
  }
  return numericUserId;
}

function userExists(userId) {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  return Boolean(user);
}

function getRecentChatContext(userId, days = 5, blocks = 67) {
  const rows = db
    .prepare(
      `
        SELECT
          user_message AS userMessage,
          assistant_reply AS assistantReply,
          created_at AS createdAt
        FROM chat_history
        WHERE user_id = ?
          AND DATETIME(created_at) >= DATETIME('now', ?)
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `
    )
    .all(userId, `-${days} days`, blocks);

  return rows
    .reverse()
    .map((row) => `User: ${row.userMessage}\nAssistant: ${row.assistantReply}`);
}

function saveChatBlock(userId, userMessage, assistantReply) {
  db.prepare(
    `
      INSERT INTO chat_history (user_id, user_message, assistant_reply)
      VALUES (?, ?, ?)
    `
  ).run(userId, userMessage, assistantReply);
}

/**
 * POST /api/chat
 * Body: { "message": "I feel anxious today" }
 * Response: { "reply": "...", "emotion": "sad" }
 */
async function handleChat(req, res) {
  const { message, userId } = req.body;
  const cleanedMessage = message ? message.trim() : '';
  const numericUserId = parseUserId(userId);
  const hasValidUser = numericUserId !== null && userExists(numericUserId);

  // Basic validation
  if (!message || cleanedMessage === '') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Phase 6: If a crisis phrase is detected, do not call the AI service.
  if (isCrisisMessage(cleanedMessage)) {
    return res.status(200).json({
      crisis: true,
      supportiveMessage:
        'I am really glad you reached out. You matter, and support is available right now. Please contact KIRAN mental health helpline immediately.',
      helpline: {
        name: 'KIRAN Mental Health Helpline',
        number: '1800-599-0019'
      }
    });
  }

  try {
    // Forward the message + current emotion to the FastAPI AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const journalContext = hasValidUser ? getJournalContextForChat(numericUserId) : [];
    const chatHistoryContext = hasValidUser ? getRecentChatContext(numericUserId, 5, 67) : [];

    const response = await axios.post(`${aiServiceUrl}/chat/`, {
      message: cleanedMessage,
      emotion: currentEmotion,   // Will be null if no emotion detected yet
      journal_context: journalContext,
      chat_history_context: chatHistoryContext,
    });

    if (hasValidUser && response.data?.reply) {
      saveChatBlock(numericUserId, cleanedMessage, response.data.reply);
    }

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
