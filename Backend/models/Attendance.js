const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    type:      { type: String, enum: ['period', 'lunch', 'break'], default: 'period' },
    label:     { type: String, required: true },
    startTime: { type: String, required: true }, 
    endTime:   { type: String, required: true },
  },
  { _id: false }
);

const holidaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, 
    name: { type: String, required: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // Unique index defined at schema level
    },

    attendanceData: {
      type: Map,
      of: { type: String, enum: ['present', 'absent', 'holiday'] },
      default: () => new Map(),
    },

    notes: {
      type: Map,
      of: String,
      default: () => new Map(),
    },

    holidays: {
      type: [holidaySchema],
      default: [],
    },

    periods: {
      type: [periodSchema],
      default: [],
    },

    timetableData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    subjectColors: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1 }, { unique: true }); // Ensure one attendance doc per user
attendanceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

