const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      default: 'Productivity',
      trim: true,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: 'CheckCircle',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'specific_days', 'custom'],
      default: 'daily',
    },
    targetDays: {
      type: [Number], // 0 for Sunday, 1 for Monday, etc.
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    targetCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    targetUnit: {
      type: String,
      default: 'times',
      trim: true,
    },
    preferredTime: {
      type: String,
      enum: ['anytime', 'morning', 'afternoon', 'evening'],
      default: 'anytime',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', HabitSchema);
