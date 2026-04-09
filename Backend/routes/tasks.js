const express = require('express');
const router  = express.Router();

const {
  getTasks,
  saveTasks,
  toggleTask,
  addTask,
  deleteTask,
  resetAllTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const {
  validate,
  addTaskRules,
  toggleTaskRules,
  deleteTaskParamRules,
} = require('../middleware/validate');

router.use(protect);

router.get   ('/',                              getTasks);
router.put   ('/',                              saveTasks);
router.post  ('/add',    addTaskRules,    validate, addTask);
router.patch ('/toggle', toggleTaskRules, validate, toggleTask);
router.patch ('/reset',                         resetAllTasks);
router.delete('/:day/:taskId', deleteTaskParamRules, validate, deleteTask);

module.exports = router;

