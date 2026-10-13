const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const { recalculateHabitStreak, recalculateUserStreak, getLocalDateString } = require('../services/gamificationService');

let server;
let baseUrl;
let authToken;
let testUserId;

before(async () => {
  // Wait for mongoose connection if needed
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 100));
  }

  // Start HTTP server on random port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api`;
});

after(async () => {
  // Clean up test data
  if (testUserId) {
    await Promise.all([
      User.deleteOne({ _id: testUserId }),
      Habit.deleteMany({ user: testUserId }),
      HabitLog.deleteMany({ user: testUserId }),
      Task.deleteMany({ user: testUserId }),
      FocusSession.deleteMany({ user: testUserId }),
    ]);
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

describe('Daymark Backend API & Quality Suite', () => {
  test('Health check endpoint responds with healthy status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
  });

  test('User Registration, Validation & JWT token generation', async () => {
    const uniqueEmail = `test_${Date.now()}@auraos.test`;
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Engineer',
        email: uniqueEmail,
        password: 'securepassword123',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Should return a JWT token');
    assert.ok(data.user.id, 'Should return created user');

    authToken = data.token;
    testUserId = data.user.id;

    // Verify duplicate registration rejection
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Engineer',
        email: uniqueEmail,
        password: 'securepassword123',
      }),
    });
    assert.strictEqual(dupRes.status, 400);
  });

  test('User Login with correct credentials returns valid JWT', async () => {
    const user = await User.findById(testUserId);
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: 'securepassword123',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
  });

  test('Protected endpoint rejects unauthorized request without token', async () => {
    const res = await fetch(`${baseUrl}/habits`);
    assert.strictEqual(res.status, 401);
  });

  test('Habit CRUD and Toggle Completion updates history accurately', async () => {
    // Create Habit
    const createRes = await fetch(`${baseUrl}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Morning Deep Stretch',
        category: 'Health & Fitness',
        frequency: 'daily',
        targetCount: 1,
        targetUnit: 'times',
      }),
    });

    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    assert.strictEqual(createData.success, true);
    const habitId = createData.data._id;

    // Toggle Habit complete for today
    const todayStr = getLocalDateString(new Date());
    const toggleRes = await fetch(`${baseUrl}/habits/${habitId}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ date: todayStr }),
    });

    assert.strictEqual(toggleRes.status, 200);
    const toggleData = await toggleRes.json();
    assert.strictEqual(toggleData.success, true);
    assert.strictEqual(toggleData.completed, true);

    // Verify HabitLog in MongoDB
    const log = await HabitLog.findOne({ user: testUserId, habit: habitId, date: todayStr });
    assert.ok(log, 'HabitLog record must exist in database');
    assert.strictEqual(log.completed, true);

    // Verify Habit streak updated
    const habitInDb = await Habit.findById(habitId);
    assert.strictEqual(habitInDb.currentStreak, 1);
    assert.strictEqual(habitInDb.totalCompletions, 1);

    // Verify getHabits returns recentCompletedDates
    const listRes = await fetch(`${baseUrl}/habits`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    assert.strictEqual(listData.success, true);
    const foundHabit = listData.data.find((h) => h._id === habitId);
    assert.ok(foundHabit);
    assert.strictEqual(foundHabit.isCompletedToday, true);
    assert.ok(foundHabit.recentCompletedDates.includes(todayStr));
  });

  test('Habit Streak calculation computes consecutive days accurately', async () => {
    // Create a 2nd habit and insert historical logs for 3 consecutive days
    const habit = await Habit.create({
      user: testUserId,
      name: 'Read 20 Pages',
      category: 'Learning',
      frequency: 'daily',
    });

    const d1 = new Date();
    const d2 = new Date(); d2.setDate(d2.getDate() - 1);
    const d3 = new Date(); d3.setDate(d3.getDate() - 2);

    const s1 = getLocalDateString(d1);
    const s2 = getLocalDateString(d2);
    const s3 = getLocalDateString(d3);

    await HabitLog.create([
      { user: testUserId, habit: habit._id, date: s3, completed: true },
      { user: testUserId, habit: habit._id, date: s2, completed: true },
      { user: testUserId, habit: habit._id, date: s1, completed: true },
    ]);

    const updated = await recalculateHabitStreak(testUserId, habit._id);
    assert.strictEqual(updated.currentStreak, 3);
    assert.strictEqual(updated.longestStreak, 3);
    assert.strictEqual(updated.totalCompletions, 3);

    // Also verify user overall streak was updated
    const user = await User.findById(testUserId);
    assert.strictEqual(user.gamification.currentStreak, 3);
  });

  test('Task creation, subtask completion, and toggle completion', async () => {
    const taskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Complete System Architecture Review',
        priority: 'high',
        category: 'Work',
        estimatedMinutes: 45,
        subtasks: [
          { title: 'Check schemas', completed: false },
          { title: 'Verify routes', completed: false },
        ],
      }),
    });

    assert.strictEqual(taskRes.status, 201);
    const taskData = await taskRes.json();
    const taskId = taskData.data._id;
    assert.strictEqual(taskData.data.subtasks.length, 2);

    // Toggle first subtask
    const subtaskId = taskData.data.subtasks[0]._id;
    const subRes = await fetch(`${baseUrl}/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(subRes.status, 200);
    const subData = await subRes.json();
    const updatedSub = subData.data.subtasks.find((s) => s._id.toString() === subtaskId);
    assert.strictEqual(updatedSub.completed, true);

    // Toggle parent task complete
    const toggleTaskRes = await fetch(`${baseUrl}/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(toggleTaskRes.status, 200);
    const toggleTaskData = await toggleTaskRes.json();
    assert.strictEqual(toggleTaskData.data.completed, true);
  });

  test('Focus session logging and duration persistence', async () => {
    const sessionRes = await fetch(`${baseUrl}/focus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        sessionType: 'pomodoro',
        durationMinutes: 25,
        category: 'Deep Work',
        notes: 'Refactoring state management',
        productivityRating: 5,
      }),
    });

    assert.strictEqual(sessionRes.status, 201);
    const sessionData = await sessionRes.json();
    assert.strictEqual(sessionData.success, true);
    assert.strictEqual(sessionData.data.durationMinutes, 25);

    // Check stats aggregation
    const statsRes = await fetch(`${baseUrl}/focus/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(statsRes.status, 200);
    const statsData = await statsRes.json();
    assert.strictEqual(statsData.success, true);
    assert.ok(statsData.data.todayMinutes >= 25);
  });

  test('Dashboard Summary aggregation computes accurate counts', async () => {
    const dashRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(dashRes.status, 200);
    const dashData = await dashRes.json();
    assert.strictEqual(dashData.success, true);
    assert.ok(dashData.data.habits.total >= 1);
    assert.ok(dashData.data.focus.todayMinutes >= 25);
  });

  test('Registration validation: rejects short password and malformed email', async () => {
    // Short password
    const shortPassRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass User',
        email: `valid_${Date.now()}@test.com`,
        password: '123',
      }),
    });
    assert.strictEqual(shortPassRes.status, 400);

    // Malformed email
    const badEmailRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Email User',
        email: 'not-an-email',
        password: 'validpassword123',
      }),
    });
    assert.strictEqual(badEmailRes.status, 400);
  });

  test('Invalid resource ID format returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/tasks/invalid-object-id-123`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title: 'Invalid ID Test' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  test('Multi-tenant data isolation: User 2 cannot access or modify User 1 tasks or habits', async () => {
    // 1. Create a task for User 1
    const tRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'User 1 Private Task',
        priority: 'high',
      }),
    });
    const tData = await tRes.json();
    const user1TaskId = tData.data._id;

    // 2. Register User 2
    const u2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User Two',
        email: `user2_${Date.now()}@test.com`,
        password: 'password123',
      }),
    });
    const u2Data = await u2Res.json();
    const user2Token = u2Data.token;
    const user2Id = u2Data.user.id;

    // 3. User 2 tries to update User 1 task -> must return 404
    const updateAttempt = await fetch(`${baseUrl}/tasks/${user1TaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user2Token}`,
      },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });
    assert.strictEqual(updateAttempt.status, 404);

    // 4. User 2 tries to delete User 1 task -> must return 404
    const deleteAttempt = await fetch(`${baseUrl}/tasks/${user1TaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    assert.strictEqual(deleteAttempt.status, 404);

    // Clean up user 2
    await User.deleteOne({ _id: user2Id });
  });
});
