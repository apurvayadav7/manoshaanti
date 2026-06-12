const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const chatRoutes = require('./routes/chatRoutes');
const emotionRoutes = require('./routes/emotionRoutes');
const aslRoutes = require('./routes/aslRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const journalRoutes = require('./routes/journalRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const breathingRoutes = require('./routes/breathingRoutes');
const moodRoutes = require('./routes/moodRoutes');
const gameRoutes = require('./routes/gameRoutes');
const activityRoutes = require('./routes/activityRoutes');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/chat', chatRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/asl', aslRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/breathing', breathingRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend', port: PORT });
});

app.get('/emotion-test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'emotion-test.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`ManoShaanti backend running on http://localhost:${PORT}`);
});
