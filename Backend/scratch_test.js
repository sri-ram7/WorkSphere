const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const Expense = require('./models/Expense');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const userId = new mongoose.Types.ObjectId('69be4e5fd7c13e0d5bc9ffb4');
    const filter = { user: userId };
    const monthNum = parseInt('4', 10);
    const yearNum  = parseInt('2026', 10);
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

    console.log('Success!');
  } catch (err) {
    console.error('ERROR TRACE:', err);
  }
  process.exit();
}).catch(console.error);
