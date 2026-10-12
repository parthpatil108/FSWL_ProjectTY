const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');
const Goal = require('../models/Goal');
const { getLocalDateString } = require('../services/gamificationService');

const getTodayString = () => getLocalDateString(new Date());

// @route   GET /api/analytics/dashboard
// @desc    Get complete daily dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayString();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Run parallel queries for maximum performance
    const [
      user,
      habits,
      todayHabitLogs,
      todayTasks,
      pendingOverdueTasks,
      todayFocusSessions,
      goals,
    ] = await Promise.all([
      User.findById(userId).select('gamification themePreference pomodoroSettings'),
      Habit.find({ user: userId, isArchived: false }).lean(),
      HabitLog.find({ user: userId, date: todayStr, completed: true }).lean(),
      Task.find({
        user: userId,
        $or: [
          { scheduledDate: todayStr },
          { dueDate: { $gte: startOfToday, $lte: endOfToday } },
        ],
      }).lean(),
      Task.countDocuments({
        user: userId,
        completed: false,
        $or: [
          { dueDate: { $lt: startOfToday } },
          { scheduledDate: { $lt: todayStr } },
        ],
      }),
      FocusSession.find({
        user: userId,
        createdAt: { $gte: startOfToday },
      }).lean(),
      Goal.find({ user: userId, completed: false }).limit(4).lean(),
    ]);

    const completedHabitIds = new Set(todayHabitLogs.map((l) => l.habit.toString()));

    const habitsWithStatus = habits.map((h) => ({
      ...h,
      isCompletedToday: completedHabitIds.has(h._id.toString()),
    }));

    const totalHabitsToday = habits.length;
    const completedHabitsToday = todayHabitLogs.length;
    const habitCompletionRate =
      totalHabitsToday > 0 ? Math.round((completedHabitsToday / totalHabitsToday) * 100) : 0;

    const totalTasksToday = todayTasks.length;
    const completedTasksToday = todayTasks.filter((t) => t.completed).length;
    const taskCompletionRate =
      totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;

    const todayFocusMinutes = todayFocusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    const overallScore = Math.round(
      (habitCompletionRate * 0.5) + (taskCompletionRate * 0.3) + Math.min(20, (todayFocusMinutes / 60) * 20)
    );

    return res.json({
      success: true,
      data: {
        todayDate: todayStr,
        userGamification: user?.gamification || {},
        overallScore,
        habits: {
          total: totalHabitsToday,
          completed: completedHabitsToday,
          percentage: habitCompletionRate,
          list: habitsWithStatus,
        },
        tasks: {
          total: totalTasksToday,
          completed: completedTasksToday,
          pending: totalTasksToday - completedTasksToday,
          overdueCount: pendingOverdueTasks,
          percentage: taskCompletionRate,
          list: todayTasks,
        },
        focus: {
          todayMinutes: todayFocusMinutes,
          todayHours: (todayFocusMinutes / 60).toFixed(1),
          sessionCount: todayFocusSessions.length,
          sessions: todayFocusSessions,
        },
        goals,
      },
    });
  } catch (error) {
    console.error('[Dashboard Summary Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/analytics/insights
// @desc    Get detailed productivity analytics & historical trends
exports.getAnalyticsInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Past 14 days dates array
    const days = 14;
    const dateList = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(getLocalDateString(d));
    }

    const startDateStr = dateList[0];
    const endDateStr = dateList[dateList.length - 1];

    // Fetch historical data
    const [habits, habitLogs, completedTasks, focusSessions] = await Promise.all([
      Habit.find({ user: userId }),
      HabitLog.find({
        user: userId,
        date: { $gte: startDateStr, $lte: endDateStr },
        completed: true,
      }),
      Task.find({
        user: userId,
        completed: true,
        updatedAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      }),
      FocusSession.find({
        user: userId,
        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Map completions by date
    const dailyHabitCompletionsMap = {};
    habitLogs.forEach((l) => {
      dailyHabitCompletionsMap[l.date] = (dailyHabitCompletionsMap[l.date] || 0) + 1;
    });

    const dailyFocusMinutesMap = {};
    focusSessions.forEach((s) => {
      const dStr = s.createdAt.toISOString().split('T')[0];
      dailyFocusMinutesMap[dStr] = (dailyFocusMinutesMap[dStr] || 0) + s.durationMinutes;
    });

    const habitTrends = dateList.map((dStr) => {
      const dateObj = new Date(dStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: dStr,
        day: dayName,
        completedHabits: dailyHabitCompletionsMap[dStr] || 0,
        focusMinutes: dailyFocusMinutesMap[dStr] || 0,
        focusHours: Number(((dailyFocusMinutesMap[dStr] || 0) / 60).toFixed(1)),
      };
    });

    // Category distribution for habits
    const categoryStats = {};
    habits.forEach((h) => {
      categoryStats[h.category] = (categoryStats[h.category] || 0) + (h.totalCompletions || 0);
    });

    const categoryDistribution = Object.keys(categoryStats).map((cat) => ({
      category: cat,
      completions: categoryStats[cat],
    }));

    // Find most consistent & frequently missed habits
    let mostConsistentHabit = null;
    let habitNeedsAttention = null;

    if (habits.length > 0) {
      const sortedByStreak = [...habits].sort((a, b) => b.currentStreak - a.currentStreak);
      mostConsistentHabit = sortedByStreak[0];

      const sortedByLowest = [...habits].sort((a, b) => a.totalCompletions - b.totalCompletions);
      habitNeedsAttention = sortedByLowest[0];
    }

    // Calculate most productive day of week
    const dayOfWeekFocus = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    focusSessions.forEach((s) => {
      const day = s.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (dayOfWeekFocus[day] !== undefined) {
        dayOfWeekFocus[day] += s.durationMinutes;
      }
    });

    let bestDay = 'Mon';
    let maxFocus = 0;
    Object.entries(dayOfWeekFocus).forEach(([d, mins]) => {
      if (mins > maxFocus) {
        maxFocus = mins;
        bestDay = d;
      }
    });

    // Dynamic smart insights list
    const smartInsights = [];

    if (mostConsistentHabit && mostConsistentHabit.currentStreak > 0) {
      smartInsights.push({
        type: 'success',
        icon: 'Flame',
        title: 'Top Habit Streak',
        description: `"${mostConsistentHabit.name}" is your strongest anchor with a ${mostConsistentHabit.currentStreak}-day continuous streak!`,
      });
    }

    smartInsights.push({
      type: 'info',
      icon: 'Calendar',
      title: 'Peak Productivity Window',
      description: `${bestDay} is historically your highest-focus day, averaging peak deep work output.`,
    });

    const total14DayFocus = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    if (total14DayFocus > 0) {
      smartInsights.push({
        type: 'highlight',
        icon: 'Clock',
        title: 'Deep Work Accumulation',
        description: `You logged ${(total14DayFocus / 60).toFixed(1)} hours of focused time over the last 14 days.`,
      });
    }

    if (habitNeedsAttention && habits.length > 1) {
      smartInsights.push({
        type: 'tip',
        icon: 'Target',
        title: 'Opportunity for Growth',
        description: `Give a boost to "${habitNeedsAttention.name}". Try scheduling it earlier in the day!`,
      });
    }

    return res.json({
      success: true,
      data: {
        habitTrends,
        categoryDistribution,
        mostConsistentHabit: mostConsistentHabit
          ? { name: mostConsistentHabit.name, streak: mostConsistentHabit.currentStreak, total: mostConsistentHabit.totalCompletions }
          : null,
        totalHabitsCount: habits.length,
        totalTasksCompleted: completedTasks.length,
        totalFocusSessionsCount: focusSessions.length,
        totalFocusHours: (total14DayFocus / 60).toFixed(1),
        smartInsights,
      },
    });
  } catch (error) {
    console.error('[Analytics Insights Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
