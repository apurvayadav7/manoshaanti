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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/chat', chatRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/asl', aslRoutes);
app.use('/api/rewards', rewardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend', port: PORT });
});

app.get('/emotion-test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'emotion-test.html'));
});

app.listen(PORT, () => {
  console.log(`ManoShaanti backend running on http://localhost:${PORT}`);
});
