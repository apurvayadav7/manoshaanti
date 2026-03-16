const express = require('express');
const {
  calibrateAsl,
  getAslTemplates,
  recognizeAsl,
  resetAsl,
} = require('../controllers/aslController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', feature: 'asl-proxy' });
});

router.get('/templates', getAslTemplates);
router.post('/recognize', recognizeAsl);
router.post('/calibrate', calibrateAsl);
router.post('/reset', resetAsl);

module.exports = router;
