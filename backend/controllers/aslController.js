const axios = require('axios');

async function proxyToAslService(req, res, endpoint) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}${endpoint}`, req.body || {});
    return res.json(response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'AI service is not running. Start FastAPI on port 8000.',
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'ASL proxy request failed.',
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: 'ASL proxy request failed.',
      details: error.message,
    });
  }
}

async function getAslTemplates(req, res) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.get(`${aiServiceUrl}/asl/templates`);
    return res.json(response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'AI service is not running. Start FastAPI on port 8000.',
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'Failed to fetch ASL templates.',
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch ASL templates.',
      details: error.message,
    });
  }
}

async function recognizeAsl(req, res) {
  const { frameBase64 } = req.body;

  if (!frameBase64 || typeof frameBase64 !== 'string') {
    return res.status(400).json({
      error: 'frameBase64 is required and must be a string.',
    });
  }

  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/asl/predict`, {
      frameBase64,
    });

    return res.json(response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'AI service is not running. Start FastAPI on port 8000.',
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'Failed to process ASL recognition.',
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: 'Failed to process ASL recognition.',
      details: error.message,
    });
  }
}

async function calibrateAsl(req, res) {
  const { frameBase64, sign } = req.body;

  if (!frameBase64 || typeof frameBase64 !== 'string') {
    return res.status(400).json({
      error: 'frameBase64 is required and must be a string.',
    });
  }

  if (!sign || typeof sign !== 'string') {
    return res.status(400).json({
      error: 'sign is required and must be a string.',
    });
  }

  return proxyToAslService(req, res, '/asl/calibrate');
}

async function resetAsl(req, res) {
  return proxyToAslService(req, res, '/asl/reset');
}

module.exports = {
  recognizeAsl,
  calibrateAsl,
  getAslTemplates,
  resetAsl,
};
