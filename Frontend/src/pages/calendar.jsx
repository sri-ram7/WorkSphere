import React, { useEffect, useState } from 'react';
import './css/calendar.css';
import { eventsAPI } from '../services/api';

const EVENT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other'];
const CATEGORY_COLORS = { Work:'#3b82f6', Personal:'#22c55e', Health:'#ef4444', Learning:'#8b5cf6', Social:'#f59e0b', Other:'#6b7280' };
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newEvent, setNewEvent] = useState({ title:'', category:'Work', date:today.toISOString().split('T')[0], time:'09:00', note:'' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await eventsAPI.getAll();
      setEvents(data.events || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const getEventsForDate = (dateStr) =>
    events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));

  const getEventsForMonth = () =>
    events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

  const handleDayClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleAddEventClick = (dateStr = null) => {
    setNewEvent({
      title: '',
      category: 'Work',
      date: dateStr || selectedDate,
      time: '09:00',
      note: ''
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setNewEvent({ title: event.title, category: event.category, date: event.date, time: event.time, note: event.note });
    setEditId(event._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await eventsAPI.delete(id);
      loadEvents();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) { alert('Please enter an event title'); return; }
    try {
      if (editId) await eventsAPI.update(editId, newEvent);
      else await eventsAPI.create(newEvent);
      handleCloseModal();
      loadEvents();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save event');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setNewEvent({ title: '', category: 'Work', date: selectedDate, time: '09:00', note: '' });
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const selectedDateEvents = getEventsForDate(selectedDate);
  const monthEvents = getEventsForMonth();

  const totalThisMonth = monthEvents.length;
  const categoryCount = {};
  EVENT_CATEGORIES.forEach(cat => {
    categoryCount[cat] = monthEvents.filter(e => e.category === cat).length;
  });
  const upcomingEvents = [...events]
    .filter(e => e.date >= today.toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatTime = (t) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Calendar</h1>
        <button className="add-event-btn" onClick={() => handleAddEventClick()}>
          + Add Event
        </button>
      </div>

      {}
      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-label">This Month</span>
          <span className="stat-value">{totalThisMonth}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Upcoming</span>
          <span className="stat-value">{upcomingEvents.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today's Events</span>
          <span className="stat-value">{getEventsForDate(today.toISOString().split('T')[0]).length}</span>
        </div>
      </div>

      <div className="calendar-main">
        {}
        <div className="calendar-grid-section">
          {}
          <div className="month-nav">
            <div className="month-nav-left">
              <button className="nav-btn" onClick={prevMonth}>‹</button>
              <h2 className="month-title">{MONTHS[currentMonth]} {currentYear}</h2>
              <button className="nav-btn" onClick={nextMonth}>›</button>
            </div>
            <div className="nav-right">
              <button className="today-btn" onClick={goToToday}>Today</button>
              {error && <span>{error}</span>}
            </div>
          </div>

          {}
          <div className="day-labels">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="day-label">{d}</div>
            ))}
          </div>

          {}
          <div className="calendar-grid">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="calendar-cell empty"></div>;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === today.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={day}
                  className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="cell-day">{day}</span>
                  <div className="cell-events">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev._id}
                        className="cell-event-dot"
                        style={{ background: CATEGORY_COLORS[ev.category] }}
                        title={ev.title}
                      ></div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="cell-more">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="calendar-side">
          {}
          <div className="side-panel">
            <div className="side-panel-header">
              <div>
                <h3 className="side-date">{formatDate(selectedDate)}</h3>
                <span className="side-count">
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className="add-day-btn"
                onClick={() => handleAddEventClick(selectedDate)}
              >+</button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="no-events">
                <span>No events scheduled</span>
                <button className="add-here-btn" onClick={() => handleAddEventClick(selectedDate)}>
                  + Add event
                </button>
              </div>
            ) : (
              <div className="day-events-list">
                {selectedDateEvents.map((ev, i) => (
                  <div key={ev._id} className="day-event-item autoshow" style={{ '--item-index': i }}>
                    <div
                      className="event-time-bar"
                      style={{ background: CATEGORY_COLORS[ev.category] }}
                    ></div>
                    <div className="event-content">
                      <div className="event-top">
                        <span className="event-title">{ev.title}</span>
                        <div className="event-actions">
                          <button className="action-btn edit-btn" onClick={() => handleEdit(ev)}>✎</button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(ev._id)}>✕</button>
                        </div>
                      </div>
                      <div className="event-meta">
                        <span className="event-time">{formatTime(ev.time)}</span>
                        <span
                          className="event-badge"
                          style={{ color: CATEGORY_COLORS[ev.category], borderColor: CATEGORY_COLORS[ev.category] + '44' }}
                        >{ev.category}</span>
                      </div>
                      {ev.note && <span className="event-note">{ev.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="side-panel upcoming-panel">
            <h3 className="upcoming-title">Upcoming</h3>
            {upcomingEvents.length === 0 ? (
              <div className="no-events"><span>No upcoming events</span></div>
            ) : (
              <div className="upcoming-list">
                {upcomingEvents.map(ev => (
                  <div key={ev._id} className="upcoming-item">
                    <div
                      className="upcoming-accent"
                      style={{ background: CATEGORY_COLORS[ev.category] }}
                    ></div>
                    <div className="upcoming-info">
                      <span className="upcoming-name">{ev.title}</span>
                      <span className="upcoming-date">
                        {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {formatTime(ev.time)}
                      </span>
                    </div>
                    <span
                      className="upcoming-badge"
                      style={{ color: CATEGORY_COLORS[ev.category] }}
                    >{ev.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="side-panel category-panel">
            <h3 className="upcoming-title">This Month</h3>
            <div className="category-breakdown">
              {EVENT_CATEGORIES.filter(cat => categoryCount[cat] > 0).map(cat => (
                <div key={cat} className="cat-row">
                  <span className="cat-dot" style={{ background: CATEGORY_COLORS[cat] }}></span>
                  <span className="cat-name">{cat}</span>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{
                        width: `${totalThisMonth > 0 ? (categoryCount[cat] / totalThisMonth) * 100 : 0}%`,
                        background: CATEGORY_COLORS[cat]
                      }}
                    ></div>
                  </div>
                  <span className="cat-count">{categoryCount[cat]}</span>
                </div>
              ))}
              {totalThisMonth === 0 && (
                <span className="no-events-text">No events this month</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? 'Edit Event' : 'Add New Event'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Team Meeting"
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={newEvent.category} onChange={handleInputChange}>
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <input
                  type="text"
                  name="note"
                  value={newEvent.note}
                  onChange={handleInputChange}
                  placeholder="Add a note..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {editId ? 'Save Changes' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;

