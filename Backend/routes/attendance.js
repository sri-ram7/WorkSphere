const express = require('express');
const router  = express.Router();

const {
  getAttendance,
  markAttendance,
  addHoliday,
  removeHoliday,
  updateTimetable,
  saveAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const {
  validate,
  markAttendanceRules,
  addHolidayRules,
  holidayDateParamRules,
} = require('../middleware/validate');

router.use(protect);

router.get   ('/',                                        getAttendance);
router.put   ('/',                                        saveAttendance);
router.patch ('/mark',        markAttendanceRules, validate, markAttendance);
router.post  ('/holidays',    addHolidayRules,     validate, addHoliday);
router.delete('/holidays/:date', holidayDateParamRules, validate, removeHoliday);
router.put   ('/timetable',                               updateTimetable);

module.exports = router;

