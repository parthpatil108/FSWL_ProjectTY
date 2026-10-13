const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { awardXp } = require('../services/gamificationService');
const { handleControllerError } = require('../utils/handleControllerError');

// @route   GET /api/goals
// @desc    Get user goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   POST /api/goals
// @desc    Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { title, description, category, type, targetValue, currentValue, unit, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Goal title is required' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      description: description || '',
      category: category || 'Productivity',
      type: type || 'weekly',
      targetValue: targetValue || 100,
      currentValue: currentValue || 0,
      unit: unit || '%',
      deadline: deadline || null,
      completed: false,
    });

    await awardXp(req.user.id, 20);

    return res.status(201).json({ success: true, data: goal });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   PUT /api/goals/:id
// @desc    Update a goal
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const allowed = ['title', 'description', 'category', 'type', 'targetValue', 'currentValue', 'unit', 'deadline', 'completed'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) goal[f] = req.body[f];
    });

    if (goal.currentValue >= goal.targetValue && !goal.completed) {
      goal.completed = true;
      await awardXp(req.user.id, 50);
    }

    await goal.save();

    return res.json({ success: true, data: goal });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    return res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   GET /api/achievements
// @desc    Get all achievements (unlocked & locked catalog)
exports.getAchievements = async (req, res) => {
  try {
    const unlocked = await Achievement.find({ user: req.user.id }).sort({ unlockedAt: -1 }).lean();
    const unlockedCodes = new Set(unlocked.map((a) => a.code));

    const CATALOG = [
      {
        code: 'STREAK_3',
        title: 'Consistency Spark',
        description: 'Maintain an uninterrupted 3-day habit streak',
        badgeIcon: 'Flame',
        tier: 'bronze',
        category: 'streak',
      },
      {
        code: 'STREAK_7',
        title: 'One Week Warrior',
        description: 'Complete a 7-day continuous habit streak',
        badgeIcon: 'Zap',
        tier: 'silver',
        category: 'streak',
      },
      {
        code: 'STREAK_30',
        title: 'Habit Master',
        description: 'Reach an extraordinary 30-day streak',
        badgeIcon: 'Crown',
        tier: 'gold',
        category: 'streak',
      },
      {
        code: 'TASKS_10',
        title: 'Task Crusher',
        description: 'Successfully complete 10 tasks in Productivity OS',
        badgeIcon: 'CheckSquare',
        tier: 'silver',
        category: 'tasks',
      },
      {
        code: 'DEEP_FOCUS_120',
        title: 'Hyperfocused Mind',
        description: 'Log over 2 hours of focused Pomodoro work',
        badgeIcon: 'Brain',
        tier: 'silver',
        category: 'focus',
      },
      {
        code: 'HALF_CENTURY',
        title: 'Golden Discipline',
        description: 'Complete a single habit 50 times across history',
        badgeIcon: 'Award',
        tier: 'gold',
        category: 'consistency',
      },
    ];

    const allBadges = CATALOG.map((item) => {
      const isUnlocked = unlockedCodes.has(item.code);
      const unlockedItem = unlocked.find((u) => u.code === item.code);
      return {
        ...item,
        unlocked: isUnlocked,
        unlockedAt: unlockedItem ? unlockedItem.unlockedAt : null,
      };
    });

    const user = await User.findById(req.user.id).select('gamification');

    return res.json({
      success: true,
      gamification: user?.gamification || {},
      badges: allBadges,
      unlockedCount: unlocked.length,
      totalCount: CATALOG.length,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
