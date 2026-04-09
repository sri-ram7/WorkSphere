const Expense              = require('../models/Expense');
const { parsePage, buildMeta } = require('../utils/Paginate.js');
const mongoose = require('mongoose');

const getExpenses = async (req, res, next) => {
  try {
    const { category, sortBy = 'date', order = 'desc', month, year } = req.query;
    const { page, limit, skip } = parsePage(req.query);

    const userId = new mongoose.Types.ObjectId(req.user._id); // add this
    const filter = { user: userId };                           // change this

    if (category && category !== 'All') filter.category = category;
    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
      const endDate = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0));
      endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() - 1);
      filter.date = { $gte: startDate, $lte: endDate };
    }


    const sortOrder = order === 'asc' ? 1 : -1;
    const sortMap   = {
      date:   { date: sortOrder },
      amount: { amount: sortOrder },
      name:   { name: sortOrder },
    };
    const sort = sortMap[sortBy] || { date: -1 };

    const [total, expenses] = await Promise.all([
      Expense.countDocuments(filter),
      Expense.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    const totalAmountResult = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]);
    const totalAmount = totalAmountResult[0]?.sum || 0;

    res.status(200).json({
      success: true,
      pagination: buildMeta(total, page, limit),
      totalAmount,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { name, category, amount, date, note } = req.body;
    
    // Convert date string (YYYY-MM-DD) to Date object at midnight UTC
    let dateObj = date;
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(Date.UTC(year, month - 1, day));
    }
    
    const expense = await Expense.create({
      user: req.user._id,
      name,
      category,
      amount,
      date: dateObj,
      note,
    });
    res.status(201).json({ success: true, message: 'Expense added successfully', expense });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    // Convert date string (YYYY-MM-DD) to Date object at midnight UTC if provided
    const updateData = { ...req.body };
    if (updateData.date && typeof updateData.date === 'string') {
      const [year, month, day] = updateData.date.split('-').map(Number);
      updateData.date = new Date(Date.UTC(year, month - 1, day));
    }
    
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, message: 'Expense updated successfully', expense });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id:  req.params.id,
      user: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const filter = { user: userId };

    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum  = parseInt(year, 10);
      const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
      const endDate   = new Date(Date.UTC(yearNum, monthNum, 1));
      endDate.setUTCMilliseconds(-1);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const [byCategory, totalResult, highest] = await Promise.all([
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.findOne(filter).sort({ amount: -1 }).select('name category amount date'),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total:      totalResult[0]?.total || 0,
        count:      totalResult[0]?.count || 0,
        byCategory,
        highest,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getStats };

