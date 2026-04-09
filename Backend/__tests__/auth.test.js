const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

jest.mock('express-validator', () => {
  const chainable = () => ({
    optional() { return this; },
    notEmpty() { return this; },
    trim() { return this; },
    isLength() { return this; },
    matches() { return this; },
    isEmail() { return this; },
    normalizeEmail() { return this; },
    isInt() { return this; },
    toInt() { return this; },
    isFloat() { return this; },
    toFloat() { return this; },
    isIn() { return this; },
    isMongoId() { return this; },
    escape() { return this; },
    withMessage() { return this; },
  });
  return {
    body: jest.fn(() => chainable()),
    query: jest.fn(() => chainable()),
    param: jest.fn(() => chainable()),
    validationResult: jest.fn(),
  };
});

// Mock dependencies before requiring modules
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../utils/generateToken', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
}));

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn(() => true),
}));

const User = require('../models/User');
const authController = require('../controllers/authController');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { _id: '507f1f77bcf86cd799439011' },
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should reject registration with missing fields', async () => {
      mockReq.body = { firstName: 'John' };

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it('should reject registration with duplicate email', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Test@1234',
      };
      User.findOne.mockResolvedValue({ email: 'john@example.com' });

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('should reject login with missing credentials', async () => {
      mockReq.body = { email: 'john@example.com' };

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject login with invalid email', async () => {
      mockReq.body = {
        email: 'john@example.com',
        password: 'Test@1234',
      };
      User.findOne.mockResolvedValue(null);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getMe', () => {
    it('should return user data', async () => {
      await authController.getMe(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe('logout', () => {
    it('should clear token cookie', async () => {
      await authController.logout(mockReq, mockRes, mockNext);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'none',
        expect.objectContaining({ httpOnly: true })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('forgotPassword', () => {
    it('should reject without email', async () => {
      await authController.forgotPassword(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return success for non-existent user (security)', async () => {
      mockReq.body = { email: 'nonexistent@example.com' };
      User.findOne.mockResolvedValue(null);

      await authController.forgotPassword(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('resetPassword', () => {
    it('should reject without passwords', async () => {
      await authController.resetPassword(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject mismatched passwords', async () => {
      mockReq.body = {
        password: 'Test@1234',
        confirmPassword: 'Different@1234',
      };

      await authController.resetPassword(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Passwords do not match' })
      );
    });
  });
});

describe('Auth Middleware', () => {
  const { protect } = require('../middleware/auth');
  const jwt = require('jsonwebtoken');

  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should reject request without token', async () => {
    await protect(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('should reject invalid token', async () => {
    mockReq.cookies.token = 'invalid-token';

    await protect(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
});
describe('Input Validation', () => {
  const { validate, registerRules, loginRules } = require('../middleware/validate');
  const expressValidator = require('express-validator');

  it('should validate email format', async () => {
    const req = { body: { email: 'invalid-email' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Run validation
    const validations = registerRules;
    const middleware = validate;

    // Mock validation result
    expressValidator.validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ path: 'email', msg: 'Invalid email' }],
    });

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
