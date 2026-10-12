const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  toggleSubtask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.route('/:id/toggle').post(toggleTaskCompletion);
router.route('/:id/subtasks/:subtaskId/toggle').post(toggleSubtask);

module.exports = router;
