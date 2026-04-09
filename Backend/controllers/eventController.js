const Event                    = require('../models/Event');
const { parsePage, buildMeta } = require('../utils/Paginate.js');

const getEvents = async (req, res, next) => {
  try {
    const { month, year, category } = req.query;
    const { page, limit, skip }     = parsePage(req.query);

    const filter = { user: req.user._id };
    if (category && category !== 'All') filter.category = category;
    if (month && year) {
      const m = String(month).padStart(2, '0');
      filter.date = { $regex: `^${year}-${m}` };
    }

    const [total, events] = await Promise.all([
      Event.countDocuments(filter),
      Event.find(filter).sort({ date: 1, time: 1 }).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      success: true,
      pagination: buildMeta(total, page, limit),
      events,
    });
  } catch (error) {
    next(error);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { title, category, date, time, note } = req.body;
    const event = await Event.create({
      user: req.user._id,
      title, category, date, time, note,
    });
    res.status(201).json({ success: true, message: 'Event created', event });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, message: 'Event updated', event });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

const getUpcoming = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit, 10) || 5));

    const events = await Event.find({
      user: req.user._id,
      date: { $gte: today },
    })
      .sort({ date: 1, time: 1 })
      .limit(limit);

    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getUpcoming };

