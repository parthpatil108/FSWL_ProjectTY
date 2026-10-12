const mongoose = require('mongoose');

const FocusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionType: {
      type: String,
      enum: ['pomodoro', 'short_break', 'long_break', 'stopwatch', 'countdown'],
      default: 'pomodoro',
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    associatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    associatedHabit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
    },
    category: {
      type: String,
      default: 'Deep Work',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    productivityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FocusSession', FocusSessionSchema);
