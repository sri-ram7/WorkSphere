const Attendance = require('../models/Attendance');

const DEFAULT_PERIODS = [
  { id: 'p1',  type: 'period', label: 'Period 1',    startTime: '09:00', endTime: '10:00' },
  { id: 'p2',  type: 'period', label: 'Period 2',    startTime: '10:00', endTime: '11:00' },
  { id: 'p3',  type: 'period', label: 'Period 3',    startTime: '11:00', endTime: '12:00' },
  { id: 'lb1', type: 'lunch',  label: 'Lunch Break', startTime: '12:00', endTime: '13:00' },
  { id: 'p4',  type: 'period', label: 'Period 4',    startTime: '13:00', endTime: '14:00' },
  { id: 'p5',  type: 'period', label: 'Period 5',    startTime: '14:00', endTime: '15:00' },
  { id: 'p6',  type: 'period', label: 'Period 6',    startTime: '15:00', endTime: '16:00' },
];

const DEFAULT_HOLIDAYS = [
  { date: '2026-03-14', name: 'Holi' },
  { date: '2026-03-25', name: 'Ugadi' },
  { date: '2026-04-10', name: 'Good Friday' },
  { date: '2026-04-14', name: 'Ambedkar Jayanti' },
];

const DEFAULT_TIMETABLE = {
  p1:  { Mon:'Data Structures', Tue:'Operating Systems', Wed:'DBMS',              Thu:'Machine Learning',  Fri:'Software Engineering', Sat:'Computer Networks'    },
  p2:  { Mon:'Operating Systems',Tue:'Data Structures',  Wed:'Computer Networks', Thu:'Data Structures',   Fri:'Machine Learning',     Sat:'Software Engineering' },
  p3:  { Mon:'DBMS',            Tue:'',                  Wed:'Data Structures',   Thu:'Computer Networks', Fri:'Operating Systems',    Sat:'Machine Learning'     },
  lb1: { Mon:'',Tue:'',Wed:'',Thu:'',Fri:'',Sat:'' },
  p4:  { Mon:'',                Tue:'Machine Learning',  Wed:'Operating Systems', Thu:'DBMS',              Fri:'Data Structures',      Sat:''                     },
  p5:  { Mon:'Computer Networks',Tue:'Software Engineering',Wed:'',              Thu:'Operating Systems', Fri:'DBMS',                 Sat:'Data Structures'      },
  p6:  { Mon:'Machine Learning', Tue:'DBMS',             Wed:'Software Engineering',Thu:'',               Fri:'Computer Networks',    Sat:'Operating Systems'    },
};

const DEFAULT_SUBJECT_COLORS = {
  'Data Structures':      '#3b82f6',
  'Operating Systems':    '#22c55e',
  'DBMS':                 '#f59e0b',
  'Computer Networks':    '#8b5cf6',
  'Machine Learning':     '#ef4444',
  'Software Engineering': '#06b6d4',
};

const getOrCreate = async (userId) => {
  let doc = await Attendance.findOne({ user: userId });
  if (!doc) {
    doc = await Attendance.create({
      user: userId,
      attendanceData: new Map(),
      notes: new Map(),
      holidays: DEFAULT_HOLIDAYS,
      periods: DEFAULT_PERIODS,
      timetableData: DEFAULT_TIMETABLE,
      subjectColors: new Map(Object.entries(DEFAULT_SUBJECT_COLORS)),
    });
  }
  if (!doc.attendanceData) doc.attendanceData = new Map();
  if (!doc.notes) doc.notes = new Map();
  if (!doc.subjectColors) doc.subjectColors = new Map();
  return doc;
};

const getAttendance = async (req, res, next) => {
  try {
    const doc = await getOrCreate(req.user._id);
    
    console.log('📊 Raw attendanceData type:', doc.attendanceData?.constructor?.name);
    console.log('📊 Raw attendanceData entries:', doc.attendanceData ? Array.from(doc.attendanceData.entries()) : []);
    
    const attendanceObj = Object.fromEntries(doc.attendanceData || new Map());
    const notesObj = Object.fromEntries(doc.notes || new Map());
    const subjectColorsObj = Object.fromEntries(doc.subjectColors || new Map());
    
    console.log('📊 Converted attendanceData:', attendanceObj);

    res.status(200).json({
      success: true,
      attendance: {
        attendanceData: attendanceObj,
        notes: notesObj,
        holidays: doc.holidays,
        periods: doc.periods,
        timetableData: doc.timetableData,
        subjectColors: subjectColorsObj,
      },
    });
  } catch (error) {
    console.error('❌ getAttendance error:', error.message);
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const { date, status, note } = req.body;
    console.log('📋 markAttendance request:', { date, status, note, userId: req.user._id });

    if (!date || !status) {
      return res.status(400).json({ success: false, message: 'date and status are required' });
    }

    const validStatuses = ['present', 'absent', 'holiday'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const doc = await getOrCreate(req.user._id);
    if (!doc.attendanceData || !(doc.attendanceData instanceof Map)) doc.attendanceData = new Map();
    if (!doc.notes || !(doc.notes instanceof Map)) doc.notes = new Map();

    doc.attendanceData.set(date, status);
    if (note !== undefined) {
      if (note) doc.notes.set(date, note);
      else doc.notes.delete(date);
    }

    console.log('💾 Before save - attendanceData type:', doc.attendanceData.constructor.name);
    doc.markModified('attendanceData');
    doc.markModified('notes');
    const savedDoc = await doc.save();
    console.log('✅ Attendance saved successfully');

    res.status(200).json({
      success: true,
      message: 'Attendance marked',
      date,
      status,
      note: savedDoc.notes.get(date) || '',
    });
  } catch (error) {
    console.error('❌ markAttendance error:', error.message);
    next(error);
  }
};

const addHoliday = async (req, res, next) => {
  try {
    const { date, name } = req.body;

    if (!date || !name) {
      return res.status(400).json({ success: false, message: 'date and name are required' });
    }

    const doc = await getOrCreate(req.user._id);

    const exists = doc.holidays.some((h) => h.date === date);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Holiday already exists for this date' });
    }

    doc.holidays.push({ date, name });
    await doc.save();

    res.status(201).json({ success: true, message: 'Holiday added', holidays: doc.holidays });
  } catch (error) {
    next(error);
  }
};

const removeHoliday = async (req, res, next) => {
  try {
    const { date } = req.params;

    const doc = await getOrCreate(req.user._id);

    doc.holidays = doc.holidays.filter((h) => h.date !== date);
    await doc.save();

    res.status(200).json({ success: true, message: 'Holiday removed', holidays: doc.holidays });
  } catch (error) {
    next(error);
  }
};

const updateTimetable = async (req, res, next) => {
  try {
    const { periods, timetableData, subjectColors } = req.body;

    const doc = await getOrCreate(req.user._id);

    if (periods)       doc.periods       = periods;
    if (timetableData) doc.timetableData = timetableData;
    if (subjectColors) {
      Object.entries(subjectColors).forEach(([k, v]) => doc.subjectColors.set(k, v));
    }

    doc.markModified('timetableData');
    doc.markModified('subjectColors');
    await doc.save();

    res.status(200).json({
      success: true,
      message: 'Timetable updated',
      periods: doc.periods,
      timetableData: doc.timetableData,
      subjectColors: Object.fromEntries(doc.subjectColors),
    });
  } catch (error) {
    next(error);
  }
};

const saveAttendance = async (req, res, next) => {
  try {
    const { attendanceData, notes, holidays, periods, timetableData, subjectColors } = req.body;

    const doc = await getOrCreate(req.user._id);

    if (attendanceData) doc.attendanceData = new Map(Object.entries(attendanceData));
    if (notes)          doc.notes          = new Map(Object.entries(notes));
    if (holidays)       doc.holidays       = holidays;
    if (periods)        doc.periods        = periods;
    if (timetableData)  doc.timetableData  = timetableData;
    if (subjectColors)  doc.subjectColors  = new Map(Object.entries(subjectColors));

    await doc.save();

    res.status(200).json({ success: true, message: 'Attendance data saved' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  addHoliday,
  removeHoliday,
  updateTimetable,
  saveAttendance,
};

