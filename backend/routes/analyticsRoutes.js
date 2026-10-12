const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAnalyticsInsights,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/insights', getAnalyticsInsights);

module.exports = router;
