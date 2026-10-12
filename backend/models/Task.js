const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    scheduledDate: {
      type: String, // 'YYYY-MM-DD'
      index: true,
    },
    estimatedMinutes: {
      type: Number,
      default: 30,
    },
    actualMinutes: {
      type: Number,
      default: 0,
    },
    subtasks: [SubtaskSchema],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly'],
        default: 'none',
      },
      interval: {
        type: Number,
        default: 1,
      },
    },
    associatedHabit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
