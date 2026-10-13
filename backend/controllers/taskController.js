const Task = require('../models/Task');
const { awardXp, getLocalDateString } = require('../services/gamificationService');
const { handleControllerError } = require('../utils/handleControllerError');

const getTodayString = () => getLocalDateString(new Date());

// @route   GET /api/tasks
// @desc    Get tasks with filtering (views: today, upcoming, overdue, completed, all)
exports.getTasks = async (req, res) => {
  try {
    const { view, category, priority, search } = req.query;
    const todayStr = getTodayString();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const query = { user: req.user.id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (view === 'today') {
      query.$or = [
        { scheduledDate: todayStr },
        { dueDate: { $gte: startOfToday, $lte: endOfToday } },
      ];
    } else if (view === 'upcoming') {
      query.completed = false;
      query.$or = [
        { dueDate: { $gt: endOfToday } },
        { scheduledDate: { $gt: todayStr } },
      ];
    } else if (view === 'overdue') {
      query.completed = false;
      query.$or = [
        { dueDate: { $lt: startOfToday } },
        { scheduledDate: { $lt: todayStr } },
      ];
    } else if (view === 'completed') {
      query.completed = true;
    }

    const tasks = await Task.find(query)
      .sort({ completed: 1, priority: -1, dueDate: 1, createdAt: -1 })
      .populate('associatedHabit', 'name color icon')
      .lean();

    return res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error('[Get Tasks Error]:', error);
    return handleControllerError(res, error);
  }
};

// @route   POST /api/tasks
// @desc    Create a new task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      category,
      dueDate,
      scheduledDate,
      estimatedMinutes,
      subtasks,
      isRecurring,
      recurrence,
      associatedHabit,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description: description || '',
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || null,
      scheduledDate: scheduledDate || null,
      estimatedMinutes: estimatedMinutes || 30,
      subtasks: subtasks || [],
      isRecurring: !!isRecurring,
      recurrence: recurrence || { frequency: 'none', interval: 1 },
      associatedHabit: associatedHabit || null,
    });

    await awardXp(req.user.id, 10);

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update a task
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const allowedFields = [
      'title',
      'description',
      'priority',
      'category',
      'dueDate',
      'scheduledDate',
      'estimatedMinutes',
      'actualMinutes',
      'subtasks',
      'isRecurring',
      'recurrence',
      'associatedHabit',
      'order',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    return res.json({ success: true, data: task });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   POST /api/tasks/:id/toggle
// @desc    Toggle task completion status
exports.toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.completed = !task.completed;
    if (task.completed) {
      task.completedAt = new Date();
      // Mark all subtasks as completed if task completed
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((st) => (st.completed = true));
      }
      await awardXp(req.user.id, 15, { tasksCompleted: 1 });
    } else {
      task.completedAt = null;
    }

    await task.save();

    return res.json({ success: true, data: task });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   POST /api/tasks/:id/subtasks/:subtaskId/toggle
// @desc    Toggle specific subtask
exports.toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;

    // If all subtasks are completed, check if parent should be marked
    const allDone = task.subtasks.every((st) => st.completed);
    if (allDone && !task.completed) {
      task.completed = true;
      task.completedAt = new Date();
      await awardXp(req.user.id, 15, { tasksCompleted: 1 });
    }

    await task.save();

    return res.json({ success: true, data: task });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
