const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getAchievements,
} = require('../controllers/goalAchievementController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/goals').get(getGoals).post(createGoal);
router.route('/goals/:id').put(updateGoal).delete(deleteGoal);
router.route('/achievements').get(getAchievements);

module.exports = router;
