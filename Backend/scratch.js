const mongoose = require('mongoose');
require('dotenv').config();
const Expense = require('./models/Expense');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/worksphere').then(async () => {
  try {
    const userId = new mongoose.Types.ObjectId('69be4e5fd7c13e0d5bc9ffb4'); // taken from error log
    const filter = { user: userId };
    const monthNum = 4;
    const yearNum  = 2026;
    const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const endDate   = new Date(Date.UTC(yearNum, monthNum, 1));
    endDate.setUTCMilliseconds(-1);
    filter.date = { $gte: startDate, $lte: endDate };

    console.log('Filter:', filter);
    
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

    console.log({ byCategory, totalResult, highest });
  } catch (err) {
    console.error('ERROR TRACE:', err);
  }
  process.exit();
}).catch(console.error);
