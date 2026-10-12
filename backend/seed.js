require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Habit = require('./models/Habit');
const HabitLog = require('./models/HabitLog');
const Task = require('./models/Task');
const FocusSession = require('./models/FocusSession');
const Note = require('./models/Note');
const Goal = require('./models/Goal');
const Achievement = require('./models/Achievement');
const { recalculateHabitStreak } = require('./services/gamificationService');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_os');
    console.log('[Seed] Connected to MongoDB');

    // Clean existing demo user data
    const existingDemo = await User.findOne({ email: 'demo@productivityos.com' });
    if (existingDemo) {
      console.log('[Seed] Clearing previous demo user data...');
      await Promise.all([
        Habit.deleteMany({ user: existingDemo._id }),
        HabitLog.deleteMany({ user: existingDemo._id }),
        Task.deleteMany({ user: existingDemo._id }),
        FocusSession.deleteMany({ user: existingDemo._id }),
        Note.deleteMany({ user: existingDemo._id }),
        Goal.deleteMany({ user: existingDemo._id }),
        Achievement.deleteMany({ user: existingDemo._id }),
        User.deleteOne({ _id: existingDemo._id }),
      ]);
    }

    // Create Demo User
    console.log('[Seed] Creating demo user...');
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'demo@productivityos.com',
      password: 'password123',
      themePreference: 'dark',
      pomodoroSettings: {
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
      },
      gamification: {
        points: 780,
        xp: 780,
        level: 4,
        currentStreak: 12,
        longestStreak: 16,
        totalFocusMinutes: 385,
        completedHabitsCount: 42,
        completedTasksCount: 18,
      },
    });

    const userId = demoUser._id;

    // Helper for dates YYYY-MM-DD
    const formatDate = (offsetDays) => {
      const d = new Date();
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    // 1. Create Core Habits
    console.log('[Seed] Creating habits...');
    const habitsData = [
      {
        user: userId,
        name: 'Morning Meditation & Breathwork',
        description: '15 minutes of mindfulness to center focus before starting work',
        category: 'Mindfulness',
        color: '#8b5cf6',
        icon: 'Sun',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetCount: 15,
        targetUnit: 'mins',
        preferredTime: 'morning',
      },
      {
        user: userId,
        name: 'Deep Work Block (No Social Media)',
        description: 'At least 90 minutes of uninterrupted focused engineering or writing',
        category: 'Productivity',
        color: '#6366f1',
        icon: 'Brain',
        frequency: 'daily',
        targetDays: [1, 2, 3, 4, 5],
        targetCount: 90,
        targetUnit: 'mins',
        preferredTime: 'morning',
      },
      {
        user: userId,
        name: 'Strength Training or Cardio',
        description: 'Hit the gym or 5km outdoor run to maintain peak energy',
        category: 'Health & Fitness',
        color: '#10b981',
        icon: 'Dumbbell',
        frequency: 'specific_days',
        targetDays: [1, 2, 4, 5, 6],
        targetCount: 45,
        targetUnit: 'mins',
        preferredTime: 'evening',
      },
      {
        user: userId,
        name: 'Read Non-Fiction Books',
        description: 'Read minimum 20 pages from current book on architecture or psychology',
        category: 'Learning',
        color: '#f59e0b',
        icon: 'BookOpen',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetCount: 20,
        targetUnit: 'pages',
        preferredTime: 'evening',
      },
      {
        user: userId,
        name: 'Hydration Goal (3L Water)',
        description: 'Drink 3 liters of fresh water evenly throughout the day',
        category: 'Health & Fitness',
        color: '#06b6d4',
        icon: 'Droplets',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetCount: 3,
        targetUnit: 'liters',
        preferredTime: 'anytime',
      },
    ];

    const habits = await Habit.insertMany(habitsData);

    // 2. Generate Historical Habit Logs for past 14 days
    console.log('[Seed] Generating historical habit completion logs...');
    const habitLogs = [];

    // Habit 0: 12-day streak (days 0 through 11 completed)
    for (let day = 0; day <= 11; day++) {
      habitLogs.push({
        user: userId,
        habit: habits[0]._id,
        date: formatDate(day),
        completed: true,
        count: 15,
        notes: day === 0 ? 'Felt very calm and centered today' : '',
      });
    }

    // Habit 1: Deep Work (completed most weekdays in last 14 days)
    for (let day = 0; day <= 13; day++) {
      const d = new Date();
      d.setDate(d.getDate() - day);
      const dayOfWeek = d.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && day !== 4) {
        habitLogs.push({
          user: userId,
          habit: habits[1]._id,
          date: formatDate(day),
          completed: true,
          count: 90,
          notes: 'Completed full 90-min deep focus sprint',
        });
      }
    }

    // Habit 2: Fitness (days 0, 2, 3, 5, 7, 9, 10)
    [0, 2, 3, 5, 7, 9, 10].forEach((day) => {
      habitLogs.push({
        user: userId,
        habit: habits[2]._id,
        date: formatDate(day),
        completed: true,
        count: 45,
      });
    });

    // Habit 3: Reading (days 0, 1, 2, 3, 4, 6, 8, 9, 11, 12)
    [0, 1, 2, 3, 4, 6, 8, 9, 11, 12].forEach((day) => {
      habitLogs.push({
        user: userId,
        habit: habits[3]._id,
        date: formatDate(day),
        completed: true,
        count: 20,
      });
    });

    // Habit 4: Hydration (completed today + past 6 days)
    for (let day = 0; day <= 6; day++) {
      habitLogs.push({
        user: userId,
        habit: habits[4]._id,
        date: formatDate(day),
        completed: true,
        count: 3,
      });
    }

    await HabitLog.insertMany(habitLogs);

    // Recalculate streaks for all habits
    for (const h of habits) {
      await recalculateHabitStreak(userId, h._id);
    }

    // 3. Create Tasks
    console.log('[Seed] Creating tasks...');
    const now = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const tasksData = [
      {
        user: userId,
        title: 'Complete Distributed Systems Mini-Project Report',
        description: 'Draft the architecture diagrams, benchmark analysis, and conclusion sections',
        priority: 'high',
        category: 'Academics',
        dueDate: now,
        scheduledDate: formatDate(0),
        estimatedMinutes: 60,
        actualMinutes: 45,
        subtasks: [
          { title: 'Draw MongoDB replica set & API flow chart', completed: true },
          { title: 'Write empirical test results and latency graphs', completed: true },
          { title: 'Proofread executive summary', completed: false },
        ],
        completed: false,
      },
      {
        user: userId,
        title: 'Review System Design Microservices Patterns',
        description: 'Study event sourcing, CQRS, and message queues in distributed architecture',
        priority: 'urgent',
        category: 'Learning',
        dueDate: now,
        scheduledDate: formatDate(0),
        estimatedMinutes: 45,
        actualMinutes: 0,
        subtasks: [
          { title: 'Read Kafka partitioning vs RabbitMQ exchanges', completed: false },
          { title: 'Implement idempotency key middleware in Express', completed: false },
        ],
        completed: false,
      },
      {
        user: userId,
        title: 'Refactor Auth Middleware with Refresh Tokens',
        description: 'Enhance JWT verification and error messages for client-side expiration handling',
        priority: 'medium',
        category: 'Engineering',
        dueDate: tomorrow,
        scheduledDate: formatDate(-1),
        estimatedMinutes: 30,
        completed: false,
      },
      {
        user: userId,
        title: 'Submit College Lab Record Assignment 4',
        description: 'Print out code listings and attach test outputs',
        priority: 'high',
        category: 'Academics',
        dueDate: yesterday, // Overdue example
        scheduledDate: formatDate(1),
        estimatedMinutes: 20,
        completed: false,
      },
      {
        user: userId,
        title: 'Set up Vite + React Production Build Pipeline',
        description: 'Ensure clean bundle chunks and zero lint errors',
        priority: 'medium',
        category: 'Engineering',
        dueDate: yesterday,
        scheduledDate: formatDate(1),
        estimatedMinutes: 40,
        actualMinutes: 40,
        completed: true,
        completedAt: yesterday,
      },
      {
        user: userId,
        title: 'Prepare Slide Deck for Project Presentation',
        description: 'Create 10 clean slides showing demo walkthrough and metrics',
        priority: 'low',
        category: 'Academics',
        dueDate: inThreeDays,
        scheduledDate: formatDate(-3),
        estimatedMinutes: 50,
        completed: false,
      },
    ];

    await Task.insertMany(tasksData);

    // 4. Create Focus Sessions
    console.log('[Seed] Creating focus sessions...');
    const focusData = [
      {
        user: userId,
        sessionType: 'pomodoro',
        durationMinutes: 25,
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        completed: true,
        category: 'Deep Work',
        notes: 'Designed MongoDB schema indexes and compound unique keys',
        productivityRating: 5,
      },
      {
        user: userId,
        sessionType: 'pomodoro',
        durationMinutes: 25,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        completed: true,
        category: 'Deep Work',
        notes: 'Wrote Express controllers and route tests',
        productivityRating: 5,
      },
      {
        user: userId,
        sessionType: 'stopwatch',
        durationMinutes: 40,
        startTime: new Date(Date.now() - 26 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 25 * 60 * 60 * 1000),
        completed: true,
        category: 'Reading',
        notes: 'Deep reading on high concurrency web architectures',
        productivityRating: 4,
      },
      {
        user: userId,
        sessionType: 'pomodoro',
        durationMinutes: 50,
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 47 * 60 * 60 * 1000),
        completed: true,
        category: 'Coding',
        notes: 'UI components library styling and glassmorphism themes',
        productivityRating: 5,
      },
    ];

    await FocusSession.insertMany(focusData);

    // 5. Create Notes / Brain Dump
    console.log('[Seed] Creating notes...');
    const notesData = [
      {
        user: userId,
        title: 'Project Architecture & Design Decisions',
        content: `Personal Productivity OS is structured as a full MERN application:
- MongoDB handles relational isolation with compound indexes on (user, habit, date).
- Express provides RESTful endpoints with JWT middleware.
- React provides dynamic interactive modules: Dashboard, Habits, Tasks, Focus Timer, Notes, Calendar, and Analytics.
- Dark mode theme utilizes deep slate gradients with luminous cyan/indigo accents.`,
        category: 'Engineering',
        tags: ['architecture', 'mern', 'design'],
        color: '#6366f1',
        isPinned: true,
      },
      {
        user: userId,
        title: 'Atomic Habits Key Takeaways',
        content: `1. Make it obvious: habit stacking (e.g., after morning coffee, sit for 15m meditation).
2. Make it attractive: bundle need-to-do with want-to-do.
3. Make it easy: reduce friction down to 2-minute rule.
4. Make it satisfying: immediate visual feedback via streaks and progress bars!`,
        category: 'Book Notes',
        tags: ['habits', 'psychology', 'growth'],
        color: '#10b981',
        isPinned: true,
      },
      {
        user: userId,
        title: 'Sprint Backlog & Brain Dump',
        content: `Ideas to explore:
- Add sound effects / ambient focus sounds (rain, white noise, coffee shop)
- Add export to JSON/CSV for data sovereignty
- Weekly retrospective journal prompt`,
        category: 'Quick Thoughts',
        tags: ['ideas', 'roadmap'],
        color: '#f59e0b',
        isPinned: false,
      },
    ];

    await Note.insertMany(notesData);

    // 6. Create Goals
    console.log('[Seed] Creating goals...');
    const goalsData = [
      {
        user: userId,
        title: 'Complete 25 Pomodoro Focus Sessions this Week',
        description: 'Maintain uninterrupted flow state during peak morning hours',
        category: 'Productivity',
        type: 'weekly',
        targetValue: 25,
        currentValue: 18,
        unit: 'sessions',
        deadline: inThreeDays,
        completed: false,
      },
      {
        user: userId,
        title: 'Read 200 Pages in Current Book',
        description: 'Read every night before bed without digital distractions',
        category: 'Learning',
        type: 'weekly',
        targetValue: 200,
        currentValue: 140,
        unit: 'pages',
        deadline: tomorrow,
        completed: false,
      },
    ];

    await Goal.insertMany(goalsData);

    // 7. Create Achievements
    console.log('[Seed] Unlocking initial achievements...');
    const achievementsData = [
      {
        user: userId,
        code: 'STREAK_3',
        title: 'Consistency Spark',
        description: 'Maintained an uninterrupted 3-day habit streak!',
        badgeIcon: 'Flame',
        tier: 'bronze',
        category: 'streak',
      },
      {
        user: userId,
        code: 'STREAK_7',
        title: 'One Week Warrior',
        description: 'Completed a 7-day uninterrupted habit streak!',
        badgeIcon: 'Zap',
        tier: 'silver',
        category: 'streak',
      },
      {
        user: userId,
        code: 'TASKS_10',
        title: 'Task Crusher',
        description: 'Successfully completed 10 tasks in Productivity OS!',
        badgeIcon: 'CheckSquare',
        tier: 'silver',
        category: 'tasks',
      },
      {
        user: userId,
        code: 'DEEP_FOCUS_120',
        title: 'Hyperfocused Mind',
        description: 'Logged over 2 hours of focused Pomodoro work!',
        badgeIcon: 'Brain',
        tier: 'silver',
        category: 'focus',
      },
    ];

    for (const ach of achievementsData) {
      await Achievement.findOneAndUpdate(
        { user: userId, code: ach.code },
        { ...ach, user: userId },
        { upsert: true, new: true }
      );
    }

    console.log('✅ [Seed Completed Successfully!]');
    console.log('----------------------------------------------------');
    console.log('Demo Account Credentials:');
    console.log('Email:    demo@productivityos.com');
    console.log('Password: password123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
