const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'custom' },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const dayTaskSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    tasks: [taskItemSchema],
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // Compound index defined at schema level
    },
    tasksData: [dayTaskSchema],
    workoutPlan: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1 }, { unique: true }); // Ensure one task doc per user
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);

