const express = require('express');
const router  = express.Router();

const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getStats,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const {
  validate,
  expenseBodyRules,
  expenseUpdateRules,
  expenseQueryRules,
  expenseStatsQueryRules,
  mongoIdParamRules,
} = require('../middleware/validate');

router.use(protect);

router.get ('/stats', expenseStatsQueryRules, validate,      getStats);
router.get ('/',        expenseQueryRules, validate,          getExpenses);
router.post('/',        expenseBodyRules,  validate,          createExpense);
router.get ('/:id',     mongoIdParamRules, validate,          getExpense);
router.put ('/:id',     mongoIdParamRules, expenseUpdateRules, validate, updateExpense);
router.delete('/:id',  mongoIdParamRules, validate,           deleteExpense);

module.exports = router;

