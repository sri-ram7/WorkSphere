const express = require('express');
const router  = express.Router();

const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcoming,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const {
  validate,
  eventBodyRules,
  eventUpdateRules,
  eventQueryRules,
  mongoIdParamRules,
} = require('../middleware/validate');

router.use(protect);

router.get ('/upcoming',                                       getUpcoming);
router.get ('/',         eventQueryRules,  validate,           getEvents);
router.post('/',         eventBodyRules,   validate,           createEvent);
router.get ('/:id',      mongoIdParamRules, validate,          getEvent);
router.put ('/:id',      mongoIdParamRules, eventUpdateRules, validate, updateEvent);
router.delete('/:id',   mongoIdParamRules, validate,          deleteEvent);

module.exports = router;

