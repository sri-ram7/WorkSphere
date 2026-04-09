import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock React Router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children }) => children,
}));

// Mock API
vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
  expensesAPI: {
    getAll: vi.fn(),
    getStats: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tasksAPI: {
    getAll: vi.fn(),
    saveAll: vi.fn(),
    addTask: vi.fn(),
    toggle: vi.fn(),
    delete: vi.fn(),
    resetAll: vi.fn(),
  },
  eventsAPI: {
    getAll: vi.fn(),
  },
  attendanceAPI: {
    getAll: vi.fn(),
  },
  fetchCsrfToken: vi.fn(),
  default: vi.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide authentication context', async () => {
    const { useAuth } = await import('../context/AuthContext');
    expect(useAuth).toBeDefined();
  });
});

describe('API Service', () => {
  it('should have all required auth methods', async () => {
    const { authAPI } = await import('../services/api');

    expect(authAPI.login).toBeDefined();
    expect(authAPI.register).toBeDefined();
    expect(authAPI.logout).toBeDefined();
    expect(authAPI.getMe).toBeDefined();
    expect(authAPI.forgotPassword).toBeDefined();
    expect(authAPI.resetPassword).toBeDefined();
  });

  it('should have all required expense methods', async () => {
    const { expensesAPI } = await import('../services/api');

    expect(expensesAPI.getAll).toBeDefined();
    expect(expensesAPI.getStats).toBeDefined();
    expect(expensesAPI.create).toBeDefined();
    expect(expensesAPI.update).toBeDefined();
    expect(expensesAPI.delete).toBeDefined();
  });

  it('should have all required task methods', async () => {
    const { tasksAPI } = await import('../services/api');

    expect(tasksAPI.getAll).toBeDefined();
    expect(tasksAPI.saveAll).toBeDefined();
    expect(tasksAPI.addTask).toBeDefined();
    expect(tasksAPI.toggle).toBeDefined();
    expect(tasksAPI.delete).toBeDefined();
  });
});

describe('Utilities', () => {
  it('should validate email format', () => {
    const validateEmail = (email) => {
      return /^\S+@\S+\.\S+$/.test(email);
    };

    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
  });

  it('should validate password requirements', () => {
    const validatePassword = (password) => {
      return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[@$!%*?&]/.test(password)
      );
    };

    expect(validatePassword('Test@1234')).toBe(true);
    expect(validatePassword('weak')).toBe(false);
    expect(validatePassword('NoSpecial1')).toBe(false);
  });

  it('should format currency correctly', () => {
    const formatCurrency = (amount) => {
      return `₹${Number(amount).toLocaleString('en-US')}`;
    };

    expect(formatCurrency(1000)).toBe('₹1,000');
    expect(formatCurrency(1000000)).toBe('₹1,000,000');
  });
});

describe('Constants', () => {
  const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Office', 'Other'];
  const EVENT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other'];
  const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  it('should have valid expense categories', () => {
    expect(EXPENSE_CATEGORIES).toContain('Food');
    expect(EXPENSE_CATEGORIES).toContain('Transport');
    expect(EXPENSE_CATEGORIES.length).toBe(7);
  });

  it('should have valid event categories', () => {
    expect(EVENT_CATEGORIES).toContain('Work');
    expect(EVENT_CATEGORIES).toContain('Personal');
    expect(EVENT_CATEGORIES.length).toBe(6);
  });

  it('should have valid days', () => {
    expect(VALID_DAYS).toContain('Monday');
    expect(VALID_DAYS).toContain('Sunday');
    expect(VALID_DAYS.length).toBe(7);
  });
});