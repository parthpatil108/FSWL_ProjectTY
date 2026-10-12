const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

/**
 * Calculates current streak and longest streak for a habit
 * given the user and habitId.
 */
function getLocalDateString(d = new Date()) {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates user's overall daily streak from actual habit logs
 */
async function recalculateUserStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  if (!user.gamification) {
    user.gamification = {
      points: 0,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalFocusMinutes: 0,
      completedHabitsCount: 0,
      completedTasksCount: 0,
    };
  }

  const logs = await HabitLog.find({ user: userId, completed: true }).select('date').lean();
  const dateSet = new Set(logs.map((l) => l.date));
  const dates = Array.from(dateSet).sort();

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let currentStreak = 0;
  if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
    let checkDate = dateSet.has(todayStr) ? new Date() : new Date(yesterday);
    while (true) {
      const dStr = getLocalDateString(checkDate);
      if (dateSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  if (dates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1] + 'T00:00:00');
      const curr = new Date(dates[i] + 'T00:00:00');
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }
  }

  user.gamification.currentStreak = currentStreak;
  user.gamification.longestStreak = Math.max(longestStreak, currentStreak, user.gamification.longestStreak || 0);
  await user.save();
  return user;
}

/**
 * Calculates current streak and longest streak for a habit
 * given the user and habitId, respecting scheduled target days.
 */
async function recalculateHabitStreak(userId, habitId) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) return null;

  // Find all completed logs for this habit sorted by date ascending
  const logs = await HabitLog.find({
    user: userId,
    habit: habitId,
    completed: true,
  }).sort({ date: 1 });

  if (logs.length === 0) {
    habit.currentStreak = 0;
    habit.totalCompletions = 0;
    await habit.save();
    await recalculateUserStreak(userId);
    return habit;
  }

  // Get list of unique dates
  const dates = Array.from(new Set(logs.map((l) => l.date))).sort();
  const dateSet = new Set(dates);

  const today = new Date();
  const todayStr = getLocalDateString(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // Target days of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const isTargetDay = (dateObj) => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'specific_days' && Array.isArray(habit.targetDays)) {
      return habit.targetDays.includes(dateObj.getDay());
    }
    return true;
  };

  // Calculate current streak:
  let currentStreak = 0;
  let checkDate = new Date(today);

  // If not completed today and today is a scheduled day, start checking from yesterday if yesterday was completed
  if (!dateSet.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count backwards, skipping non-target days if specific_days is set
  while (true) {
    const dStr = getLocalDateString(checkDate);
    if (dateSet.has(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (!isTargetDay(checkDate)) {
      // If today is not a target day for this habit, skip it without breaking streak
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak across history
  let longestStreak = 0;
  let tempStreak = 0;
  if (dates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1] + 'T00:00:00');
      const curr = new Date(dates[i] + 'T00:00:00');
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, habit.longestStreak || 0);

  habit.currentStreak = currentStreak;
  habit.longestStreak = longestStreak;
  habit.totalCompletions = logs.length;
  await habit.save();

  // Check achievements and recalculate overall user streak
  await checkHabitAchievements(userId, habit);
  await recalculateUserStreak(userId);

  return habit;
}

/**
 * Checks and awards achievements
 */
async function checkHabitAchievements(userId, habit) {
  const user = await User.findById(userId);
  if (!user) return;

  const achievementsToUnlock = [];

  if (habit.currentStreak >= 3) {
    achievementsToUnlock.push({
      code: 'STREAK_3',
      title: 'Consistency Spark',
      description: 'Maintained a 3-day habit streak!',
      badgeIcon: 'Flame',
      tier: 'bronze',
      category: 'streak',
    });
  }
  if (habit.currentStreak >= 7) {
    achievementsToUnlock.push({
      code: 'STREAK_7',
      title: 'One Week Warrior',
      description: 'Completed a 7-day uninterrupted habit streak!',
      badgeIcon: 'Zap',
      tier: 'silver',
      category: 'streak',
    });
  }
  if (habit.currentStreak >= 30 || habit.longestStreak >= 30) {
    achievementsToUnlock.push({
      code: 'STREAK_30',
      title: 'Habit Master',
      description: 'Reached a remarkable 30-day streak!',
      badgeIcon: 'Crown',
      tier: 'gold',
      category: 'streak',
    });
  }
  if (habit.totalCompletions >= 50) {
    achievementsToUnlock.push({
      code: 'HALF_CENTURY',
      title: 'Golden Discipline',
      description: 'Completed a single habit 50 times!',
      badgeIcon: 'Award',
      tier: 'gold',
      category: 'consistency',
    });
  }

  for (const ach of achievementsToUnlock) {
    const existing = await Achievement.findOne({ user: userId, code: ach.code });
    if (!existing) {
      await Achievement.create({
        user: userId,
        ...ach,
      });
      // Award bonus XP for unlock
      await awardXp(userId, 100);
    }
  }
}

/**
 * Awards XP, updates user levels and stats
 */
async function awardXp(userId, xpPoints, statUpdates = {}) {
  const user = await User.findById(userId);
  if (!user) return null;

  if (!user.gamification) {
    user.gamification = {
      points: 0,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalFocusMinutes: 0,
      completedHabitsCount: 0,
      completedTasksCount: 0,
    };
  }

  user.gamification.xp += xpPoints;
  user.gamification.points += xpPoints;

  // Level formula: level = Math.floor(xp / 250) + 1
  const newLevel = Math.floor(user.gamification.xp / 250) + 1;
  user.gamification.level = newLevel;

  // Apply stat counters
  if (statUpdates.habitsCompleted) {
    user.gamification.completedHabitsCount += statUpdates.habitsCompleted;
  }
  if (statUpdates.tasksCompleted) {
    user.gamification.completedTasksCount += statUpdates.tasksCompleted;
  }
  if (statUpdates.focusMinutes) {
    user.gamification.totalFocusMinutes += statUpdates.focusMinutes;
  }

  // Check generic milestones
  if (user.gamification.completedTasksCount >= 10) {
    const code = 'TASKS_10';
    const exists = await Achievement.findOne({ user: userId, code });
    if (!exists) {
      await Achievement.create({
        user: userId,
        code,
        title: 'Task Crusher',
        description: 'Completed 10 tasks in Productivity OS!',
        badgeIcon: 'CheckSquare',
        tier: 'silver',
        category: 'tasks',
      });
    }
  }

  if (user.gamification.totalFocusMinutes >= 120) {
    const code = 'DEEP_FOCUS_120';
    const exists = await Achievement.findOne({ user: userId, code });
    if (!exists) {
      await Achievement.create({
        user: userId,
        code,
        title: 'Hyperfocused Mind',
        description: 'Logged over 2 hours of focused Pomodoro work!',
        badgeIcon: 'Brain',
        tier: 'silver',
        category: 'focus',
      });
    }
  }

  await user.save();
  return user;
}

module.exports = {
  recalculateHabitStreak,
  recalculateUserStreak,
  checkHabitAchievements,
  awardXp,
  getLocalDateString,
};
