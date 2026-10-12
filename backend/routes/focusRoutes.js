const express = require('express');
const router = express.Router();
const {
  logFocusSession,
  getFocusSessions,
  getFocusStats,
} = require('../controllers/focusController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').post(logFocusSession).get(getFocusSessions);
router.route('/stats').get(getFocusStats);

module.exports = router;
