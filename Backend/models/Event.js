const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other'],
      default: 'Other',
    },
    date: {
      type: Date, 
      required: [true, 'Date is required'],
    },
    time: {
      type: String, 
      required: [true, 'Time is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

eventSchema.index({ user: 1, date: 1 });
eventSchema.index({ user: 1, date: -1 }); // For upcoming events (sorted desc)
eventSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Event', eventSchema);

