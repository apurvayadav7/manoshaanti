const express = require('express');

const router = express.Router();

// Phase 12: hardcoded calm/positive 5-letter word list (20 words)
const WORDLE_WORDS = [
  'smile',
  'peace',
  'focus',
  'brave',
  'calms',
  'shiny',
  'glory',
  'grace',
  'happy',
  'light',
  'trust',
  'bloom',
  'chill',
  'fresh',
  'great',
  'laugh',
  'noble',
  'relax',
  'sunny',
  'vital',
];

router.get('/wordle/word', (req, res) => {
  const randomIndex = Math.floor(Math.random() * WORDLE_WORDS.length);
  const word = WORDLE_WORDS[randomIndex];

  return res.json({
    word,
    length: 5,
    source: 'phase12-wordle-list',
  });
});

module.exports = router;
