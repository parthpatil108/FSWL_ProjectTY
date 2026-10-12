const mongoose = require('mongoose');
const FocusSession = require('../models/FocusSession');
const Task = require('../models/Task');
const { awardXp } = require('../services/gamificationService');

// @route   POST /api/focus
// @desc    Log a completed focus session
exports.logFocusSession = async (req, res) => {
  try {
    const {
      sessionType,
      durationMinutes,
      startTime,
      endTime,
      associatedTask,
      associatedHabit,
      category,
      notes,
      productivityRating,
    } = req.body;

    if (!durationMinutes || durationMinutes <= 0) {
      return res.status(400).json({ success: false, message: 'Valid duration is required' });
    }

    const session = await FocusSession.create({
      user: req.user.id,
      sessionType: sessionType || 'pomodoro',
      durationMinutes: Math.round(durationMinutes),
      startTime: startTime || new Date(Date.now() - durationMinutes * 60000),
      endTime: endTime || new Date(),
      completed: true,
      associatedTask: associatedTask || null,
      associatedHabit: associatedHabit || null,
      category: category || 'Deep Work',
      notes: notes || '',
      productivityRating: productivityRating || 4,
    });

    // If associated with a task, increment actualMinutes spent
    if (associatedTask) {
      await Task.findOneAndUpdate(
        { _id: associatedTask, user: req.user.id },
        { $inc: { actualMinutes: Math.round(durationMinutes) } }
      );
    }

    // Award XP based on duration (1 XP per min)
    const earnedXp = Math.max(5, Math.round(durationMinutes));
    await awardXp(req.user.id, earnedXp, { focusMinutes: Math.round(durationMinutes) });

    return res.status(201).json({ success: true, data: session, earnedXp });
  } catch (error) {
    console.error('[Log Focus Session Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/focus
// @desc    Get focus session history
exports.getFocusSessions = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const sessions = await FocusSession.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('associatedTask', 'title priority category')
      .populate('associatedHabit', 'name color icon')
      .lean();

    return res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/focus/stats
// @desc    Get aggregate focus statistics
exports.getFocusStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const userObjectId = new mongoose.Types.ObjectId(req.user.id || req.user._id);

    const [todaySessions, weekSessions, categoryAggregation] = await Promise.all([
      FocusSession.find({ user: userObjectId, createdAt: { $gte: startOfToday } }),
      FocusSession.find({ user: userObjectId, createdAt: { $gte: startOfWeek } }),
      FocusSession.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: '$category', totalMinutes: { $sum: '$durationMinutes' }, count: { $sum: 1 } } },
        { $sort: { totalMinutes: -1 } },
      ]),
    ]);

    const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const weekMinutes = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return res.json({
      success: true,
      data: {
        todayMinutes,
        todayHours: (todayMinutes / 60).toFixed(1),
        weekMinutes,
        weekHours: (weekMinutes / 60).toFixed(1),
        totalSessionsCount: weekSessions.length,
        categoryBreakdown: categoryAggregation,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
