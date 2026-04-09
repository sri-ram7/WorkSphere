const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
    .toInt(),
];

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name contains invalid characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name contains invalid characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('firstName').optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name contains invalid characters'),
  body('lastName').optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name contains invalid characters'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 128 }).withMessage('New password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('New password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
];

const forgotPasswordRules = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

const resetPasswordRules = [
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
];

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Office', 'Other'];

const expenseBodyRules = [
  body('name').trim().notEmpty().withMessage('Expense name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters').escape(),
  body('category').notEmpty().withMessage('Category is required')
    .isIn(EXPENSE_CATEGORIES).withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
  body('amount').notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0, max: 10_000_000 }).withMessage('Amount must be a positive number').toFloat(),
  body('date').notEmpty().withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD format'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters').escape(),
];

const expenseUpdateRules = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters').escape(),
  body('category').optional().isIn(EXPENSE_CATEGORIES).withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
  body('amount').optional().isFloat({ min: 0, max: 10_000_000 }).withMessage('Amount must be a positive number').toFloat(),
  body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD format'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters').escape(),
];

const expenseQueryRules = [
  ...paginationRules,
  query('category').optional().isIn(['All', ...EXPENSE_CATEGORIES]).withMessage('Invalid category'),
  query('sortBy').optional().isIn(['date', 'amount', 'name']).withMessage('sortBy must be date, amount, or name'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('month must be 1-12').toInt(),
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('year must be 2000-2100').toInt(),
];

const expenseStatsQueryRules = [
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('month must be 1-12').toInt(),
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('year must be 2000-2100').toInt(),
];

const EVENT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other'];

const eventBodyRules = [
  body('title').trim().notEmpty().withMessage('Event title is required')
    .isLength({ min: 1, max: 150 }).withMessage('Title must be 1-150 characters').escape(),
  body('category').notEmpty().withMessage('Category is required')
    .isIn(EVENT_CATEGORIES).withMessage(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`),
  body('date').notEmpty().withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD format'),
  body('time').notEmpty().withMessage('Time is required')
    .matches(/^\d{2}:\d{2}$/).withMessage('Time must be HH:MM format'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters').escape(),
];

const eventUpdateRules = [
  body('title').optional().trim().isLength({ min: 1, max: 150 }).withMessage('Title must be 1-150 characters').escape(),
  body('category').optional().isIn(EVENT_CATEGORIES).withMessage(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`),
  body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD format'),
  body('time').optional().matches(/^\d{2}:\d{2}$/).withMessage('Time must be HH:MM format'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters').escape(),
];

const eventQueryRules = [
  ...paginationRules,
  query('category').optional().isIn(['All', ...EVENT_CATEGORIES]).withMessage('Invalid category'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('month must be 1-12').toInt(),
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('year must be 2000-2100').toInt(),
];

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const addTaskRules = [
  body('day').notEmpty().withMessage('day is required')
    .isIn(VALID_DAYS).withMessage(`day must be one of: ${VALID_DAYS.join(', ')}`),
  body('name').trim().notEmpty().withMessage('Task name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Task name must be 1-100 characters').escape(),
  body('type').optional().trim().isLength({ max: 50 }).withMessage('type cannot exceed 50 characters').escape(),
];

const toggleTaskRules = [
  body('day').notEmpty().withMessage('day is required')
    .isIn(VALID_DAYS).withMessage(`day must be one of: ${VALID_DAYS.join(', ')}`),
  body('taskId').notEmpty().withMessage('taskId is required')
    .isMongoId().withMessage('taskId must be a valid ID'),
];

const deleteTaskParamRules = [
  param('day').isIn(VALID_DAYS).withMessage(`day must be one of: ${VALID_DAYS.join(', ')}`),
  param('taskId').isMongoId().withMessage('taskId must be a valid ID'),
];

const markAttendanceRules = [
  body('date').notEmpty().withMessage('date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD format'),
  body('status').notEmpty().withMessage('status is required')
    .isIn(['present', 'absent', 'holiday']).withMessage('status must be present, absent, or holiday'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('note cannot exceed 300 characters').escape(),
];

const addHolidayRules = [
  body('date').notEmpty().withMessage('date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD format'),
  body('name').trim().notEmpty().withMessage('Holiday name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Holiday name must be 1-100 characters').escape(),
];

const holidayDateParamRules = [
  param('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date param must be YYYY-MM-DD format'),
];

const mongoIdParamRules = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

module.exports = {
  validate,

  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,

  expenseBodyRules,
  expenseUpdateRules,
  expenseQueryRules,
  expenseStatsQueryRules,

  eventBodyRules,
  eventUpdateRules,
  eventQueryRules,

  addTaskRules,
  toggleTaskRules,
  deleteTaskParamRules,

  markAttendanceRules,
  addHolidayRules,
  holidayDateParamRules,
  mongoIdParamRules,
};

