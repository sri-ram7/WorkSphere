import React, { useEffect, useState } from 'react';
import './css/expenses.css';
import { expensesAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Office', 'Other'];
const CATEGORY_COLORS = { Food:'#22c55e', Transport:'#3b82f6', Shopping:'#f59e0b', Health:'#ef4444', Entertainment:'#8b5cf6', Office:'#06b6d4', Other:'#6b7280' };

function Expenses() {
  const { theme } =useTheme();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [newExpense, setNewExpense] = useState({ name:'', category:'Food', amount:'', date:new Date().toISOString().split('T')[0], note:'' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualTotal, setActualTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [statsByCategory, setStatsByCategory] = useState({});
  const [highestExpense, setHighestExpense] = useState(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const [listRes, statsAllRes, statsMonthRes] = await Promise.all([
        expensesAPI.getAll({
          category: filterCategory,
          sortBy,
          order: sortBy === 'name' ? 'asc' : 'desc',
        }),
        expensesAPI.getStats(),
        expensesAPI.getStats({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
      ]);
      setExpenses(listRes.data.expenses || []);
      setActualTotal(listRes.data.totalAmount || 0);
      setMonthTotal(statsMonthRes.data.stats.total || 0);
      setHighestExpense(statsAllRes.data.stats.highest || null);

      const byCat = CATEGORIES.reduce((acc, cat) => {
        const found = statsAllRes.data.stats.byCategory.find(c => c._id === cat);
        acc[cat] = found ? { total: found.total, count: found.count } : { total: 0, count: 0 };
        return acc;
      }, {});
      setStatsByCategory(byCat);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [filterCategory, sortBy]);

  const handleInputChange = (e) => setNewExpense((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newExpense.name.trim() || !newExpense.amount) return;
    const payload = { 
      ...newExpense, 
      amount: Number(newExpense.amount),
      name: newExpense.name.trim(),
      note: newExpense.note ? newExpense.note.trim() : ''
    };
    try {
      if (editId) await expensesAPI.update(editId, payload);
      else await expensesAPI.create(payload);
      handleCloseModal();
      loadExpenses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setNewExpense({ name: expense.name, category: expense.category, amount: expense.amount, date: expense.date, note: expense.note || '' });
    setEditId(expense._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await expensesAPI.delete(id);
      loadExpenses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setNewExpense({ name:'', category:'Food', amount:'', date:new Date().toISOString().split('T')[0], note:'' });
  };

  const maxCategoryTotal = Math.max(...Object.values(statsByCategory).map((v) => v.total), 1);

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <h1>Expenses</h1>
        <button className="add-expense-btn" onClick={() => setShowModal(true)}>
          + Add Expense
        </button>
      </div>

      {}
      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value">₹{actualTotal.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">This Month</span>
          <span className="stat-value">₹{monthTotal.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
      </div>

      {}
      <div className="charts-section">
        {}
        <div className="chart-container bar-chart">
          <h3>Spending by Category</h3>
          <div className="category-bars">
            {CATEGORIES.map(cat => {
              const data = statsByCategory?.[cat] || { total: 0, count: 0 };
              const pct = maxCategoryTotal > 0 ? (data.total / maxCategoryTotal) * 100 : 0;
              return (
                <div key={cat} className="category-row">
                  <div className="category-row-label">
                    <span
                      className="category-dot"
                      style={{ background: CATEGORY_COLORS[cat] }}
                    ></span>
                    <span>{cat}</span>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_COLORS[cat]
                      }}
                    ></div>
                  </div>
                  <span className="category-amount">₹{data.total.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="chart-container pie-chart">
          <h3>Overall Distribution</h3>
          <div className="pie-container">
            <div className="pie-wrapper">
              <svg viewBox="0 0 100 100" className="pie-svg">
                {(() => {
                  const totalStats = Math.max(1, actualTotal);
                  let offset = 0;
                  const r = 40;
                  const circ = 2 * Math.PI * r;
                  return CATEGORIES.map(cat => {
                    const val = statsByCategory?.[cat]?.total || 0;
                    const pct = val / totalStats;
                    const dash = pct * circ;
                    const el = (
                      <circle
                        key={cat}
                        cx="50" cy="50" r={r}
                        fill="none"
                        stroke={CATEGORY_COLORS[cat]}
                        strokeWidth="20"
                        strokeDasharray={`${dash} ${circ}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'all 0.5s ease' }}
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
                {actualTotal === 0 && (
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="20" />
                )}
                <text x="50" y="46" textAnchor="middle" className="pie-text-top">Total</text>
                <text x="50" y="58" textAnchor="middle" className="pie-text-bottom">
                  ₹{(actualTotal / 1000).toFixed(1)}k
                </text>
              </svg>
            </div>
            <div className="pie-legend">
              {CATEGORIES.filter(cat => (statsByCategory?.[cat]?.total || 0) > 0).map(cat => (
                <div key={cat} className="legend-item">
                  <span className="legend-color" style={{ background: CATEGORY_COLORS[cat] }}></span>
                  <span>{cat} ({statsByCategory?.[cat]?.count || 0})</span>
                </div>
              ))}
            </div>
          </div>

          {highestExpense && (
            <div className="highest-expense">
              <h4>Highest Expense</h4>
              <div className="highest-item">
                <span
                  className="highest-dot"
                  style={{ background: CATEGORY_COLORS[highestExpense.category] }}
                ></span>
                <div className="highest-info">
                  <span className="highest-name">{highestExpense.name}</span>
                  <span className="highest-cat">{highestExpense.category}</span>
                </div>
                <span className="highest-amt">₹{Number(highestExpense.amount).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="filter-bar">
        <div className="filter-tabs">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              className={`filter-tab ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
              style={filterCategory === cat && cat !== 'All'
                ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] }
                : {}}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {}
      <div className="expenses-list">
        {loading ? (
          <div className="empty-state"><span>Loading...</span></div>
        ) : error ? (
          <div className="empty-state"><span>{error}</span></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <span>No expenses found</span>
          </div>
        ) : (
          expenses.map((expense, i) => (
            <div
              key={expense._id}
              className="expense-item autoshow"
              style={{ '--item-index': i }}
            >
              <div
                className="expense-category-bar"
                style={{ background: CATEGORY_COLORS[expense.category] }}
              ></div>
              <div className="expense-info">
                <div className="expense-main">
                  <span className="expense-name">{expense.name}</span>
                  <span
                    className="expense-badge"
                    style={{ color: CATEGORY_COLORS[expense.category], borderColor: CATEGORY_COLORS[expense.category] + '44' }}
                  >
                    {expense.category}
                  </span>
                </div>
                {expense.note && <span className="expense-note">{expense.note}</span>}
                <span className="expense-date">{new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="expense-right">
                <span className="expense-amount">₹{expense.amount.toLocaleString()}</span>
                <div className="expense-actions">
                  <button className="action-btn edit-btn" onClick={() => handleEdit(expense)}>✎</button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(expense._id)}>✕</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="expName">Expense Name *</label>
                <input
                  type="text"
                  id="expName"
                  name="name"
                  value={newExpense.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Grocery Store"
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expAmount">Amount (₹) *</label>
                  <input
                    type="number"
                    id="expAmount"
                    name="amount"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expDate">Date</label>
                  <input
                    type="date"
                    id="expDate"
                    name="date"
                    value={newExpense.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="expCategory">Category</label>
                <select
                  id="expCategory"
                  name="category"
                  value={newExpense.category}
                  onChange={handleInputChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="expNote">Note (optional)</label>
                <input
                  type="text"
                  id="expNote"
                  name="note"
                  value={newExpense.note}
                  onChange={handleInputChange}
                  placeholder="Add a note..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {editId ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;

