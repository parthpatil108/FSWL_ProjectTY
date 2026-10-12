const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { recalculateHabitStreak, recalculateUserStreak, awardXp, getLocalDateString } = require('../services/gamificationService');

const getTodayString = () => getLocalDateString(new Date());

// @route   GET /api/habits
// @desc    Get all habits for current user with today's status & recent history
exports.getHabits = async (req, res) => {
  try {
    const { archived, date } = req.query;
    const targetDate = date || getTodayString();

    const query = { user: req.user.id };
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }

    const habits = await Habit.find(query).sort({ createdAt: -1 }).lean();

    // Fetch completion logs for targetDate and past 14 days
    const past14Days = new Date();
    past14Days.setDate(past14Days.getDate() - 14);
    const startDate = getLocalDateString(past14Days);

    const logs = await HabitLog.find({
      user: req.user.id,
      date: { $gte: startDate },
      completed: true,
    }).lean();

    // Map logs by habit ID
    const logsByHabit = {};
    logs.forEach((log) => {
      const hId = log.habit.toString();
      if (!logsByHabit[hId]) logsByHabit[hId] = new Set();
      logsByHabit[hId].add(log.date);
    });

    const result = habits.map((habit) => {
      const habitId = habit._id.toString();
      const habitCompletedDates = logsByHabit[habitId] || new Set();
      return {
        ...habit,
        isCompletedToday: habitCompletedDates.has(targetDate),
        recentCompletedDates: Array.from(habitCompletedDates),
        targetDate,
      };
    });

    return res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error('[Get Habits Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/habits
// @desc    Create a new habit
exports.createHabit = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      color,
      icon,
      frequency,
      targetDays,
      targetCount,
      targetUnit,
      preferredTime,
      startDate,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Habit name is required' });
    }

    const habit = await Habit.create({
      user: req.user.id,
      name,
      description,
      category: category || 'Productivity',
      color: color || '#6366f1',
      icon: icon || 'CheckCircle',
      frequency: frequency || 'daily',
      targetDays: targetDays || [0, 1, 2, 3, 4, 5, 6],
      targetCount: targetCount || 1,
      targetUnit: targetUnit || 'times',
      preferredTime: preferredTime || 'anytime',
      startDate: startDate || new Date(),
    });

    // Award initial XP for creating a habit
    await awardXp(req.user.id, 25);

    return res.status(201).json({ success: true, data: habit });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/habits/:id
// @desc    Update an existing habit
exports.updateHabit = async (req, res) => {
  try {
    let habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const allowedFields = [
      'name',
      'description',
      'category',
      'color',
      'icon',
      'frequency',
      'targetDays',
      'targetCount',
      'targetUnit',
      'preferredTime',
      'isArchived',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        habit[field] = req.body[field];
      }
    });

    await habit.save();

    return res.json({ success: true, data: habit });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/habits/:id
// @desc    Delete a habit & its logs
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    await HabitLog.deleteMany({ habit: req.params.id, user: req.user.id });

    return res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/habits/:id/toggle
// @desc    Toggle habit completion for a specific date (YYYY-MM-DD)
exports.toggleHabitCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, notes } = req.body;
    const targetDate = date || getTodayString();

    const habit = await Habit.findOne({ _id: id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // Check if log already exists
    const existingLog = await HabitLog.findOne({
      user: req.user.id,
      habit: id,
      date: targetDate,
    });

    let completedState = false;

    if (existingLog && existingLog.completed) {
      // Uncheck habit
      await HabitLog.deleteOne({ _id: existingLog._id });
      completedState = false;
    } else {
      // Mark habit as completed
      if (existingLog) {
        existingLog.completed = true;
        existingLog.notes = notes || existingLog.notes;
        await existingLog.save();
      } else {
        await HabitLog.create({
          user: req.user.id,
          habit: id,
          date: targetDate,
          completed: true,
          notes: notes || '',
        });
      }
      completedState = true;
      // Award XP for completion
      await awardXp(req.user.id, 20, { habitsCompleted: 1 });
    }

    // Recalculate streak
    const updatedHabit = await recalculateHabitStreak(req.user.id, id);

    return res.json({
      success: true,
      completed: completedState,
      date: targetDate,
      habit: updatedHabit,
    });
  } catch (error) {
    console.error('[Toggle Habit Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/habits/history
// @desc    Get completion logs for a date range (for heatmap/calendar)
exports.getHabitHistory = async (req, res) => {
  try {
    const { startDate, endDate, habitId } = req.query;
    const query = { user: req.user.id, completed: true };

    if (habitId) {
      query.habit = habitId;
    }
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await HabitLog.find(query).sort({ date: 1 }).populate('habit', 'name category color icon').lean();

    return res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
