const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { 
  authLimiter, 
  forgotPasswordLimiter 
} = require('../middleware/Ratelimiter.js');

const { protect } = require('../middleware/auth');

const {
  validate,
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../middleware/validate');

const handlers = { register, login, getMe, updateMe, changePassword, logout, forgotPassword, resetPassword };
Object.entries(handlers).forEach(([name, fn]) => {
  if (typeof fn !== 'function') {
    throw new Error(
      `[routes/auth.js] "${name}" is not a function. ` +
      `Check that authController.js exports it correctly.`
    );
  }
});

const rules = { registerRules, loginRules, updateProfileRules, changePasswordRules, forgotPasswordRules, resetPasswordRules };
Object.entries(rules).forEach(([name, arr]) => {
  if (!Array.isArray(arr)) {
    throw new Error(
      `[routes/auth.js] "${name}" is not an array. ` +
      `Check that validate.js exports it correctly.`
    );
  }
});

router.post('/register', registerRules,     validate, register);
router.post('/login',    loginRules,        validate, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordRules, validate, forgotPassword);
router.put('/reset-password/:resetToken', resetPasswordRules, validate, resetPassword);

router.post('/refresh',  refreshToken);

router.post('/logout',   logout);

router.get('/me',              protect,                                getMe);
router.put('/me',              protect, updateProfileRules, validate,  updateMe);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

module.exports = router;

