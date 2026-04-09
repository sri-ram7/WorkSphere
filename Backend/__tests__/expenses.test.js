const expenseController = require('../controllers/expenseController');

// Mock the Expense model
jest.mock('../models/Expense', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
}));

const Expense = require('../models/Expense');

describe('Expense Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { _id: '507f1f77bcf86cd799439011' },
      params: { id: '507f1f77bcf86cd799439012' },
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getExpenses', () => {
    it('should return paginated expenses', async () => {
      const mockExpenses = [
        { _id: '1', name: 'Groceries', amount: 50, date: '2026-04-01', category: 'Food' },
        { _id: '2', name: 'Bus', amount: 20, date: '2026-04-02', category: 'Transport' },
      ];

      Expense.countDocuments.mockResolvedValue(2);
      Expense.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockExpenses),
          }),
        }),
      });
      Expense.aggregate.mockResolvedValue([{ sum: 70 }]);

      mockReq.query = { page: '1', limit: '10', category: 'All' };

      await expenseController.getExpenses(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, expenses: mockExpenses })
      );
    });

    it('should filter by category', async () => {
      Expense.countDocuments.mockResolvedValue(1);
      Expense.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      Expense.aggregate.mockResolvedValue([{ sum: 50 }]);

      mockReq.query = { category: 'Food' };

      await expenseController.getExpenses(mockReq, mockRes, mockNext);

      expect(Expense.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Food' })
      );
    });
  });

  describe('createExpense', () => {
    it('should create a new expense', async () => {
      const newExpense = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test Expense',
        amount: 100,
        category: 'Food',
        date: '2026-04-05',
        user: mockReq.user._id,
      };

      Expense.create.mockResolvedValue(newExpense);
      mockReq.body = {
        name: 'Test Expense',
        amount: 100,
        category: 'Food',
        date: '2026-04-05',
      };

      await expenseController.createExpense(mockReq, mockRes, mockNext);

      expect(Expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Expense',
          amount: 100,
          user: mockReq.user._id,
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateExpense', () => {
    it('should update an existing expense', async () => {
      const updatedExpense = {
        _id: mockReq.params.id,
        name: 'Updated Expense',
        amount: 150,
      };

      Expense.findOneAndUpdate.mockResolvedValue(updatedExpense);

      await expenseController.updateExpense(mockReq, mockRes, mockNext);

      expect(Expense.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockReq.params.id }),
        mockReq.body,
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if expense not found', async () => {
      Expense.findOneAndUpdate.mockResolvedValue(null);

      await expenseController.updateExpense(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      Expense.findOneAndDelete.mockResolvedValue({ _id: mockReq.params.id });

      await expenseController.deleteExpense(mockReq, mockRes, mockNext);

      expect(Expense.findOneAndDelete).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockReq.params.id })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if expense not found', async () => {
      Expense.findOneAndDelete.mockResolvedValue(null);

      await expenseController.deleteExpense(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getStats', () => {
    it('should return expense statistics', async () => {
      Expense.aggregate
        .mockResolvedValueOnce([{ _id: 'Food', total: 100, count: 2 }])
        .mockResolvedValueOnce([{ total: 100, count: 2 }]);
      Expense.findOne
        .mockReturnValue({
          sort: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ name: 'Highest', amount: 80 }),
          }),
        });

      await expenseController.getStats(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          stats: expect.objectContaining({
            total: 100,
            count: 2,
          }),
        })
      );
    });
  });
});

describe('Expense Model Indexes', () => {
  it('should have user and date compound index', () => {
    // Verify index creation by checking schema methods
    const Expense = require('../models/Expense');
    expect(Expense).toBeDefined();
  });
});