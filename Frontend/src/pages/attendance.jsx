import React, { useState, useRef, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import './css/attendance.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const STATUS = {
  present: { label: 'Present', color: '#22c55e', short: 'P' },
  absent:  { label: 'Absent',  color: '#ef4444', short: 'A' },
  holiday: { label: 'Holiday', color: '#f59e0b', short: 'Ho' },
};

const DEFAULT_SUBJECT_COLORS = {
  'Data Structures':      '#3b82f6',
  'Operating Systems':    '#22c55e',
  'DBMS':                 '#f59e0b',
  'Computer Networks':    '#8b5cf6',
  'Machine Learning':     '#ef4444',
  'Software Engineering': '#06b6d4',
  'Free':                 '#6b7280',
  'Lunch Break':          '#f97316',
};

const PALETTE = [
  '#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ef4444','#06b6d4',
  '#ec4899','#14b8a6','#f97316','#84cc16','#a78bfa','#fb923c',
];

const DEFAULT_PERIODS = [
  { id: 'p1',  type: 'period', label: 'Period 1', startTime: '09:00', endTime: '10:00' },
  { id: 'p2',  type: 'period', label: 'Period 2', startTime: '10:00', endTime: '11:00' },
  { id: 'p3',  type: 'period', label: 'Period 3', startTime: '11:00', endTime: '12:00' },
  { id: 'lb1', type: 'lunch',  label: 'Lunch Break', startTime: '12:00', endTime: '13:00' },
  { id: 'p4',  type: 'period', label: 'Period 4', startTime: '13:00', endTime: '14:00' },
  { id: 'p5',  type: 'period', label: 'Period 5', startTime: '14:00', endTime: '15:00' },
  { id: 'p6',  type: 'period', label: 'Period 6', startTime: '15:00', endTime: '16:00' },
];

const WORK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];

const DEFAULT_TIMETABLE_DATA = {
  p1:  { Mon:'Data Structures',   Tue:'Operating Systems', Wed:'DBMS',              Thu:'Machine Learning',  Fri:'Software Engineering', Sat:'Computer Networks'   },
  p2:  { Mon:'Operating Systems', Tue:'Data Structures',   Wed:'Computer Networks', Thu:'Data Structures',   Fri:'Machine Learning',     Sat:'Software Engineering' },
  p3:  { Mon:'DBMS',              Tue:'',                  Wed:'Data Structures',   Thu:'Computer Networks', Fri:'Operating Systems',    Sat:'Machine Learning'    },
  lb1: { Mon:'',Tue:'',Wed:'',Thu:'',Fri:'',Sat:'' },
  p4:  { Mon:'',                  Tue:'Machine Learning',  Wed:'Operating Systems', Thu:'DBMS',              Fri:'Data Structures',      Sat:''                    },
  p5:  { Mon:'Computer Networks', Tue:'Software Engineering',Wed:'',               Thu:'Operating Systems', Fri:'DBMS',                 Sat:'Data Structures'     },
  p6:  { Mon:'Machine Learning',  Tue:'DBMS',              Wed:'Software Engineering',Thu:'',               Fri:'Computer Networks',    Sat:'Operating Systems'   },
};

const DEFAULT_HOLIDAYS = [
  { date: '2026-03-14', name: 'Holi' },
  { date: '2026-03-25', name: 'Ugadi' },
  { date: '2026-04-10', name: 'Good Friday' },
  { date: '2026-04-14', name: 'Ambedkar Jayanti' },
];

const generateSampleData = () => {
  const data = {};
  const seq = ['present','present','present','absent','present','present','present','absent','present','present'];
  for (let d = 1; d <= 20; d++) {
    const ds = `2026-03-${String(d).padStart(2,'0')}`;
    const dow = new Date(ds + 'T00:00:00').getDay();
    if (dow === 0) continue;
    data[ds] = seq[d % seq.length];
  }
  return data;
};

function getDayAbbr(dateStr) {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(dateStr + 'T00:00:00').getDay()];
}

function fmt24to12(t) {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${suffix}`;
}

export default function Attendance() {
  const today    = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentMonth,   setCurrentMonth]   = useState(today.getMonth());
  const [currentYear,    setCurrentYear]    = useState(today.getFullYear());
  const [attendanceData, setAttendanceData] = useState(generateSampleData());
  const [notes,          setNotes]          = useState({});
  const [holidays,       setHolidays]       = useState(DEFAULT_HOLIDAYS);
  const [activeTab,      setActiveTab]      = useState('calendar');

  const [periods,        setPeriods]        = useState(DEFAULT_PERIODS);
  const [ttData,         setTtData]         = useState(DEFAULT_TIMETABLE_DATA);
  const [subjectColors,  setSubjectColors]  = useState(DEFAULT_SUBJECT_COLORS);
  const [editMode,       setEditMode]       = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const { data } = await attendanceAPI.getAll();
        if (data?.success && isMounted) {
          const db = data.attendance;
          setAttendanceData(db.attendanceData || {});
          setNotes(db.notes || {});
          setHolidays(db.holidays || []);
          setPeriods(db.periods || []);
          setTtData(db.timetableData || {});
          setSubjectColors(db.subjectColors || {});
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const [editingCell,    setEditingCell]    = useState(null); // { periodId, day }
  const [cellInputVal,   setCellInputVal]   = useState('');

  const [editingPeriod,  setEditingPeriod]  = useState(null); // period id
  const [periodDraft,    setPeriodDraft]    = useState({});

  const [colorPickerSubj, setColorPickerSubj] = useState(null);

  const [showModal,   setShowModal]   = useState(false);
  const [modalDate,   setModalDate]   = useState(null);
  const [modalStatus, setModalStatus] = useState('present');
  const [modalNote,   setModalNote]   = useState('');

  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  const [showAddRow,   setShowAddRow]   = useState(false);
  const [addRowDraft,  setAddRowDraft]  = useState({ type: 'period', label: '', startTime: '', endTime: '' });

  const isPublicHoliday = (ds) => holidays.some(h => h.date === ds);
  const effectiveStatus = (ds) => isPublicHoliday(ds) ? 'holiday' : (attendanceData[ds] || null);

  const getDateStr = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDay    = (m, y) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay    = getFirstDay(currentMonth, currentYear);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const workingDates = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ds  = getDateStr(d);
    const dow = new Date(ds + 'T00:00:00').getDay();
    if (dow !== 0 && !isPublicHoliday(ds) && effectiveStatus(ds) !== 'holiday') workingDates.push(ds);
  }
  const totalClasses = workingDates.length;
  const attended     = workingDates.filter(ds => attendanceData[ds] === 'present').length;
  const absentCount  = workingDates.filter(ds => attendanceData[ds] === 'absent').length;
  const pct          = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;
  const isLow        = pct < 75 && totalClasses > 0;

  const allSubjects = [...new Set(
    Object.values(ttData).flatMap(dayMap => Object.values(dayMap))
  )].filter(s => s && s !== '');

  const subjectStats = {};
  allSubjects.forEach(s => { subjectStats[s] = { attended: 0, total: 0 }; });
  const periodIds = periods.filter(p => p.type === 'period').map(p => p.id);
  Object.entries(attendanceData).forEach(([ds, status]) => {
    if (isPublicHoliday(ds) || status === 'holiday') return;
    const day = getDayAbbr(ds);
    if (!WORK_DAYS.includes(day)) return;
    periodIds.forEach(pid => {
      const subj = ttData[pid]?.[day];
      if (!subj || !subjectStats[subj]) return;
      subjectStats[subj].total++;
      if (status === 'present') subjectStats[subj].attended++;
    });
  });

  const insights = allSubjects.map(subj => {
    const { attended: a, total: t } = subjectStats[subj] || { attended: 0, total: 0 };
    if (t === 0) return null;
    const p = Math.round((a / t) * 100);
    if (p < 75) {
      const needed = Math.ceil((0.75 * t - a) / 0.25);
      return { type: 'warn', text: `Need ${needed} more class${needed !== 1 ? 'es' : ''} to reach 75% in ${subj} (currently ${p}%)` };
    }
    return { type: 'safe', text: `You are safe in ${subj} — ${p}% attendance` };
  }).filter(Boolean);

  const getSubjectsForDate = (ds) => {
    const day = getDayAbbr(ds);
    if (!WORK_DAYS.includes(day)) return [];
    return periodIds.map(pid => ttData[pid]?.[day]).filter(Boolean);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const openModal = (dateStr) => {
    // dateStr is already a formatted date string like "2026-03-26"
    if (dateStr > todayStr || isPublicHoliday(dateStr)) return;
    setModalDate(dateStr);
    setModalStatus(attendanceData[dateStr] || 'present');
    setModalNote(notes[dateStr] || '');
    setShowModal(true);
  };

  const saveModal = async () => {
    if (!modalDate) return;
    try {
      const cleanNote = modalNote ? modalNote.trim() : '';
      console.log('📤 Sending attendance mark:', { modalDate, modalStatus, cleanNote });
      const response = await attendanceAPI.mark(modalDate, modalStatus, cleanNote);
      console.log('✅ Attendance mark response:', response.data);
      setAttendanceData(prev => ({ ...prev, [modalDate]: modalStatus }));
      setNotes(prev => ({ ...prev, [modalDate]: cleanNote }));
      setShowModal(false);
    } catch (err) {
      console.error('❌ Failed to mark attendance:', err);
    }
  };

  const startCellEdit = (periodId, day) => {
    if (!editMode) return;
    const period = periods.find(p => p.id === periodId);
    if (period?.type !== 'period') return;
    setEditingCell({ periodId, day });
    setCellInputVal(ttData[periodId]?.[day] || '');
  };

  const commitCellEdit = () => {
    if (!editingCell) return;
    const { periodId, day } = editingCell;
    setTtData(prev => ({
      ...prev,
      [periodId]: { ...(prev[periodId] || {}), [day]: cellInputVal.trim() },
    }));

    const subj = cellInputVal.trim();
    if (subj && !subjectColors[subj]) {
      const usedColors = Object.values(subjectColors);
      const newColor = PALETTE.find(c => !usedColors.includes(c)) || PALETTE[0];
      setSubjectColors(prev => ({ ...prev, [subj]: newColor }));
    }
    setEditingCell(null);
    setCellInputVal('');
  };

  const startPeriodEdit = (period) => {
    setEditingPeriod(period.id);
    setPeriodDraft({ label: period.label, startTime: period.startTime, endTime: period.endTime, type: period.type });
  };

  const savePeriodEdit = () => {
    setPeriods(prev => prev.map(p =>
      p.id === editingPeriod ? { ...p, ...periodDraft } : p
    ));
    setEditingPeriod(null);
  };

  const addPeriodRow = () => {
    if (!addRowDraft.label || !addRowDraft.startTime || !addRowDraft.endTime) return;
    const newId = `row_${Date.now()}`;
    const newPeriod = { id: newId, ...addRowDraft };
    setPeriods(prev => [...prev, newPeriod]);

    if (addRowDraft.type === 'period') {
      setTtData(prev => ({ ...prev, [newId]: { Mon:'',Tue:'',Wed:'',Thu:'',Fri:'',Sat:'' } }));
    }
    setAddRowDraft({ type: 'period', label: '', startTime: '', endTime: '' });
    setShowAddRow(false);
  };

  const deleteRow = (id) => {
    setPeriods(prev => prev.filter(p => p.id !== id));
    setTtData(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const addHoliday = async () => {
    if (!newHolidayDate || !newHolidayName.trim()) return;
    try {
      const cleanName = newHolidayName.trim();
      const { data } = await attendanceAPI.addHoliday(newHolidayDate, cleanName);
      if (data?.success) {
        setHolidays(data.holidays);
        setNewHolidayDate(''); setNewHolidayName('');
      }
    } catch (err) {
      console.error('Failed to add holiday:', err);
    }
  };

  const deleteHoliday = async (date) => {
    try {
      const { data } = await attendanceAPI.removeHoliday(date);
      if (data?.success) {
        setHolidays(data.holidays);
      }
    } catch (err) {
      console.error('Failed to remove holiday:', err);
    }
  };

  const R = 50, circ = 2 * Math.PI * R;
  const dash = (circ * pct) / 100;

  const weeks = [];
  let wk = [];
  cells.forEach((day, idx) => {
    wk.push(day);
    if ((idx + 1) % 7 === 0) { weeks.push(wk); wk = []; }
  });
  if (wk.length) weeks.push(wk);

  const getSubjColor = (subj) => subjectColors[subj] || '#6b7280';

  return (
    <div className="attendance-container">

      {}
      <div className="attendance-header">
        <h1>Attendance</h1>
        <div className="att-tabs">
          {['calendar','timetable','subjects','holidays'].map(tab => (
            <button key={tab} className={`att-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="stats-cards">
        <div className={`stat-card ${isLow ? 'stat-warn' : 'stat-safe'}`}>
          <span className="stat-label">Attendance Rate</span>
          <span className="stat-value">{pct}%</span>
          {isLow && <span className="warn-badge">⚠ Below 75%</span>}
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Classes</span>
          <span className="stat-value">{totalClasses}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Attended</span>
          <span className="stat-value" style={{ color: '#22c55e' }}>{attended}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Absent</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>{absentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Holidays</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>{holidays.length}</span>
        </div>
      </div>

      {}
      {activeTab === 'calendar' && (
        <div className="attendance-main">
          <div className="cal-section">
            <div className="month-nav">
              <div className="month-nav-left">
                <button className="nav-btn" onClick={prevMonth}>‹</button>
                <h2 className="month-title">{MONTHS[currentMonth]} {currentYear}</h2>
                <button className="nav-btn" onClick={nextMonth}>›</button>
              </div>
              <button className="today-btn" onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}>Today</button>
            </div>

            <div className="day-labels">
              {DAYS_OF_WEEK.map(d => <div key={d} className="day-label">{d}</div>)}
            </div>

            <div className="attendance-grid">
              {cells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} className="att-cell empty" />;
                const ds         = getDateStr(day);
                const status     = effectiveStatus(ds);
                const isToday    = ds === todayStr;
                const isFuture   = ds > todayStr;
                const statusInfo = STATUS[status];
                const holName    = holidays.find(h => h.date === ds)?.name;
                const subjs      = getSubjectsForDate(ds);
                return (
                  <div
                    key={day}
                    className={`att-cell ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''} ${status || ''}`}
                    onClick={() => openModal(ds)}
                  >
                    <span className="att-day">{day}</span>
                    {status && (
                      <span className="att-badge" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>
                        {statusInfo.short}
                      </span>
                    )}
                    {notes[ds] && <span className="has-note">·</span>}
                    <div className="att-tooltip">
                      <div className="att-tooltip-day">{getDayAbbr(ds)}, {day} {MONTHS[currentMonth].slice(0, 3)}</div>
                      <div className="att-tooltip-status" style={{ color: statusInfo?.color || 'inherit' }}>
                        {holName ? `Holiday: ${holName}` : (statusInfo?.label || 'Not marked')}
                      </div>
                      {subjs.length > 0 && <div className="att-tooltip-subjs">{subjs.slice(0, 3).join(', ')}{subjs.length > 3 ? '…' : ''}</div>}
                      {notes[ds] && <div className="att-tooltip-note">"{notes[ds]}"</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="legend">
              {Object.entries(STATUS).map(([key, val]) => (
                <div key={key} className="legend-item">
                  <span className="legend-dot" style={{ background: val.color }} />
                  <span>{val.label}</span>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="attendance-side">
            <div className="side-panel rate-panel">
              <h3 className="panel-title">Monthly Overview</h3>
              <div className="radial-wrap">
                <svg viewBox="0 0 120 120" className="radial-svg">
                  <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
                  <circle cx="60" cy="60" r={R} fill="none" stroke={isLow ? '#ef4444' : '#22c55e'} strokeWidth="12"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                  <text x="60" y="53" textAnchor="middle" className="radial-pct">{pct}%</text>
                  <text x="60" y="68" textAnchor="middle" className="radial-sub">{isLow ? '⚠ Below 75%' : 'Safe ✓'}</text>
                </svg>
              </div>
              <div className="prog-bar-wrap">
                <div className="prog-bar-track">
                  <div className="prog-bar-fill" style={{ width: `${pct}%`, background: isLow ? '#ef4444' : '#22c55e' }} />
                  <div className="prog-bar-marker" />
                </div>
                <div className="prog-bar-labels">
                  <span>0%</span><span className="prog-bar-mid">75%</span><span>100%</span>
                </div>
              </div>
              <div className="overview-rows">
                {[{ label:'Present', count:attended, color:'#22c55e' },
                  { label:'Absent',  count:absentCount, color:'#ef4444' },
                  { label:'Holidays',count:holidays.length, color:'#f59e0b' }].map(row => (
                  <div key={row.label} className="ov-row">
                    <span className="ov-dot" style={{ background: row.color }} />
                    <span className="ov-label">{row.label}</span>
                    <div className="ov-bar-track">
                      <div className="ov-bar-fill" style={{ width: `${totalClasses > 0 ? (row.count / (totalClasses || 1)) * 100 : 0}%`, background: row.color }} />
                    </div>
                    <span className="ov-count">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="side-panel weekly-panel">
              <h3 className="panel-title">Weekly Breakdown</h3>
              <div className="weekly-list">
                {weeks.map((wk, wi) => {
                  const wkDays    = wk.filter(Boolean);
                  const wkWorking = wkDays.filter(d => new Date(getDateStr(d)+'T00:00:00').getDay() !== 0 && !isPublicHoliday(getDateStr(d)));
                  const wkPresent = wkWorking.filter(d => attendanceData[getDateStr(d)] === 'present').length;
                  const wkPct     = wkWorking.length > 0 ? Math.round((wkPresent / wkWorking.length) * 100) : null;
                  return (
                    <div key={wi} className="week-row">
                      <span className="week-label">{wkDays[0]}–{wkDays[wkDays.length - 1]}</span>
                      <div className="week-dots">
                        {wkDays.map(d => {
                          const ds = getDateStr(d);
                          const s  = effectiveStatus(ds);
                          return <span key={d} className="week-dot" style={{ background: s ? STATUS[s].color : 'rgba(255,255,255,0.1)' }} />;
                        })}
                      </div>
                      <span className="week-pct" style={{ color: wkPct === null ? 'rgba(255,255,255,0.3)' : wkPct >= 75 ? '#22c55e' : '#ef4444' }}>
                        {wkPct !== null ? `${wkPct}%` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="side-panel notes-panel">
              <h3 className="panel-title">Notes</h3>
              {Object.entries(notes).filter(([, n]) => n).length === 0
                ? <span className="no-notes">Click a date to add a note.</span>
                : (
                  <div className="notes-list">
                    {Object.entries(notes).filter(([, n]) => n).sort(([a],[b]) => b.localeCompare(a)).map(([d, n]) => (
                      <div key={d} className="note-item">
                        <div className="note-date-bar" style={{ background: STATUS[attendanceData[d]]?.color || '#6b7280' }} />
                        <div className="note-body">
                          <span className="note-date">{new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                          <span className="note-text">{n}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === 'timetable' && (
        <div className="cal-section">
          {}
          <div className="tt-header-row">
            <div>
              <h3 className="panel-title" style={{ margin: 0 }}>Weekly Timetable — B.Tech CSE Sem 5</h3>
              {editMode && <p className="tt-edit-hint">Click any period cell to change the subject. Click the pencil on a row to edit its name or time.</p>}
            </div>
            <div className="tt-header-actions">
              {editMode && (
                <button className="tt-add-row-btn" onClick={() => setShowAddRow(v => !v)}>
                  + Add Row
                </button>
              )}
              <button
                className={`tt-edit-toggle ${editMode ? 'active' : ''}`}
                onClick={() => {
                  if (editMode) {
                    attendanceAPI.updateTimetable({ periods, timetableData: ttData, subjectColors })
                      .catch(err => console.error('Failed to save timetable:', err));
                  }
                  setEditMode(v => !v);
                  setEditingCell(null);
                  setEditingPeriod(null);
                }}
              >
                {editMode ? '✓ Done Editing' : '✎ Edit Timetable'}
              </button>
            </div>
          </div>

          {}
          {showAddRow && (
            <div className="add-row-form">
              <select className="ar-select" value={addRowDraft.type} onChange={e => setAddRowDraft(d => ({ ...d, type: e.target.value }))}>
                <option value="period">Period</option>
                <option value="lunch">Lunch Break</option>
                <option value="break">Short Break</option>
              </select>
              <input className="ar-input" placeholder="Label (e.g. Period 7)" value={addRowDraft.label}
                onChange={e => setAddRowDraft(d => ({ ...d, label: e.target.value }))} />
              <input className="ar-input ar-time" type="time" value={addRowDraft.startTime}
                onChange={e => setAddRowDraft(d => ({ ...d, startTime: e.target.value }))} />
              <span className="ar-dash">→</span>
              <input className="ar-input ar-time" type="time" value={addRowDraft.endTime}
                onChange={e => setAddRowDraft(d => ({ ...d, endTime: e.target.value }))} />
              <button className="ar-confirm-btn" onClick={addPeriodRow}>Add</button>
              <button className="ar-cancel-btn" onClick={() => setShowAddRow(false)}>Cancel</button>
            </div>
          )}

          {}
          <div className="timetable-wrap">
            <table className="timetable-table">
              <thead>
                <tr>
                  {editMode && <th className="tt-th tt-act-col"></th>}
                  <th className="tt-th tt-period-col">Period</th>
                  <th className="tt-th tt-time-col">Time</th>
                  {WORK_DAYS.map(d => <th key={d} className="tt-th">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => {
                  const isLunch = period.type === 'lunch';
                  const isBreak = period.type === 'break';
                  const isSpecial = isLunch || isBreak;
                  const isEditingRow = editingPeriod === period.id;

                  return (
                    <tr key={period.id} className={`tt-row ${isLunch ? 'tt-row-lunch' : ''} ${isBreak ? 'tt-row-break' : ''}`}>
                      {}
                      {editMode && (
                        <td className="tt-act-cell">
                          <div className="tt-act-btns">
                            <button className="tt-icon-btn" title="Edit row" onClick={() => isEditingRow ? savePeriodEdit() : startPeriodEdit(period)}>
                              {isEditingRow ? '✓' : '✎'}
                            </button>
                            <button className="tt-icon-btn tt-del-btn" title="Delete row" onClick={() => deleteRow(period.id)}>✕</button>
                          </div>
                        </td>
                      )}

                      {}
                      <td className="tt-period-cell">
                        {isEditingRow ? (
                          <div className="tt-period-edit">
                            <select className="tt-row-type-sel" value={periodDraft.type} onChange={e => setPeriodDraft(d => ({ ...d, type: e.target.value }))}>
                              <option value="period">Period</option>
                              <option value="lunch">Lunch Break</option>
                              <option value="break">Short Break</option>
                            </select>
                            <input className="tt-period-input" value={periodDraft.label}
                              onChange={e => setPeriodDraft(d => ({ ...d, label: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && savePeriodEdit()} />
                          </div>
                        ) : (
                          <div className="tt-period-label">
                            {isLunch && <span className="tt-break-icon">🍱</span>}
                            {isBreak && <span className="tt-break-icon">☕</span>}
                            <span>{period.label}</span>
                          </div>
                        )}
                      </td>

                      {}
                      <td className="tt-time-cell">
                        {isEditingRow ? (
                          <div className="tt-time-edit">
                            <input className="tt-time-input" type="time" value={periodDraft.startTime}
                              onChange={e => setPeriodDraft(d => ({ ...d, startTime: e.target.value }))} />
                            <span className="ar-dash">→</span>
                            <input className="tt-time-input" type="time" value={periodDraft.endTime}
                              onChange={e => setPeriodDraft(d => ({ ...d, endTime: e.target.value }))} />
                          </div>
                        ) : (
                          <span className="tt-time-label">{fmt24to12(period.startTime)} – {fmt24to12(period.endTime)}</span>
                        )}
                      </td>

                      {}
                      {WORK_DAYS.map(day => {
                        if (isSpecial) {
                          return (
                            <td key={day} className="tt-cell tt-cell-special">
                              <span className="tt-special-label">{period.label}</span>
                            </td>
                          );
                        }

                        const isEditing = editingCell?.periodId === period.id && editingCell?.day === day;
                        const subj = ttData[period.id]?.[day] || '';
                        const color = getSubjColor(subj);

                        return (
                          <td key={day} className={`tt-cell ${editMode ? 'tt-cell-editable' : ''}`}
                            onClick={() => startCellEdit(period.id, day)}>
                            {isEditing ? (
                              <input
                                className="tt-cell-input"
                                value={cellInputVal}
                                autoFocus
                                onChange={e => setCellInputVal(e.target.value)}
                                onBlur={commitCellEdit}
                                onKeyDown={e => { if (e.key === 'Enter') commitCellEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                                onClick={e => e.stopPropagation()}
                              />
                            ) : subj ? (
                              <span className="tt-subj-chip"
                                style={{ background: color + '22', color, borderColor: color + '55' }}>
                                {subj}
                              </span>
                            ) : (
                              editMode
                                ? <span className="tt-empty-hint">+ add</span>
                                : <span className="tt-free">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {}
          <div className="tt-legend-section">
            <div className="tt-legend-title">Subjects</div>
            <div className="tt-legend">
              {allSubjects.map(s => (
                <div key={s} className="tt-legend-item" onClick={() => editMode && setColorPickerSubj(colorPickerSubj === s ? null : s)}
                  style={{ cursor: editMode ? 'pointer' : 'default' }}>
                  <span className="legend-dot" style={{ background: getSubjColor(s) }} />
                  <span>{s}</span>
                  {editMode && <span className="tt-edit-color-hint">🎨</span>}
                  {colorPickerSubj === s && (
                    <div className="color-picker-popover" onClick={e => e.stopPropagation()}>
                      <div className="cp-title">Pick color for {s}</div>
                      <div className="cp-swatches">
                        {PALETTE.map(c => (
                          <span key={c} className={`cp-swatch ${getSubjColor(s) === c ? 'cp-active' : ''}`}
                            style={{ background: c }}
                            onClick={() => { setSubjectColors(prev => ({ ...prev, [s]: c })); setColorPickerSubj(null); }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === 'subjects' && (
        <div className="attendance-main">
          <div className="cal-section">
            <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Subject-wise Attendance</h3>
            <table className="subj-table">
              <thead>
                <tr>
                  <th>Subject</th><th>Attended</th><th>Total</th><th>Percentage</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allSubjects.map(subj => {
                  const { attended: a, total: t } = subjectStats[subj] || { attended: 0, total: 0 };
                  const p    = t > 0 ? Math.round((a / t) * 100) : 0;
                  const safe = p >= 75;
                  return (
                    <tr key={subj}>
                      <td><span className="subj-dot" style={{ background: getSubjColor(subj) }} />{subj}</td>
                      <td>{a}</td>
                      <td>{t}</td>
                      <td>
                        <div className="subj-pct-wrap">
                          <div className="subj-pct-bar">
                            <div className="subj-pct-fill" style={{ width: `${p}%`, background: safe ? '#22c55e' : '#ef4444' }} />
                            <div className="subj-pct-marker" />
                          </div>
                          <span style={{ color: safe ? '#22c55e' : '#ef4444', minWidth: 36, textAlign: 'right', fontSize: '0.85rem', fontWeight: 500 }}>{p}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="subj-status-badge" style={{ background: safe ? '#22c55e22' : '#ef444422', color: safe ? '#22c55e' : '#ef4444', borderColor: safe ? '#22c55e44' : '#ef444444' }}>
                          {safe ? 'Safe' : '⚠ Low'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="attendance-side">
            <div className="side-panel">
              <h3 className="panel-title">Smart Insights</h3>
              <div className="insights-list">
                {insights.length === 0 && <span className="no-notes">Mark attendance to see insights.</span>}
                {insights.map((ins, i) => (
                  <div key={i} className={`insight-item ${ins.type}`}>
                    <span className="insight-icon">{ins.type === 'warn' ? '⚠' : '✓'}</span>
                    <span>{ins.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === 'holidays' && (
        <div className="attendance-main">
          <div className="cal-section">
            <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Holiday List</h3>
            {holidays.length === 0 && <span className="no-notes">No holidays added yet.</span>}
            <div className="holiday-list">
              {[...holidays].sort((a, b) => a.date.localeCompare(b.date)).map(h => (
                <div key={h.date} className="holiday-item">
                  <div className="holiday-left">
                    <span className="holiday-dot" />
                    <div>
                      <div className="holiday-name">{h.name}</div>
                      <div className="holiday-date">{new Date(h.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
                    </div>
                  </div>
                  <button className="holiday-remove-btn" onClick={() => deleteHoliday(h.date)}>✕</button>
                </div>
              ))}
            </div>
            <div className="add-holiday-form">
              <h4 className="panel-title" style={{ marginBottom: '0.75rem' }}>Add Custom Holiday</h4>
              <div className="add-holiday-row">
                <input type="date" className="holiday-input" value={newHolidayDate} onChange={e => setNewHolidayDate(e.target.value)} />
                <input type="text" className="holiday-input" placeholder="Holiday name" value={newHolidayName} onChange={e => setNewHolidayName(e.target.value)} />
                <button className="add-holiday-btn" onClick={addHoliday}>+ Add</button>
              </div>
            </div>
          </div>
          <div className="attendance-side">
            <div className="side-panel">
              <h3 className="panel-title">Summary</h3>
              <div className="overview-rows" style={{ marginTop: '0.5rem' }}>
                <div className="ov-row">
                  <span className="ov-dot" style={{ background: '#f59e0b' }} />
                  <span className="ov-label">Total</span>
                  <span className="ov-count">{holidays.length}</span>
                </div>
                <div className="ov-row">
                  <span className="ov-dot" style={{ background: '#22c55e' }} />
                  <span className="ov-label">This month</span>
                  <span className="ov-count">{holidays.filter(h => { const d = new Date(h.date+'T00:00:00'); return d.getMonth()===currentMonth && d.getFullYear()===currentYear; }).length}</span>
                </div>
              </div>
              <p style={{ fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',marginTop:'1rem',lineHeight:1.5 }}>
                Holidays are excluded from attendance percentage. They appear as gold indicators on the calendar.
              </p>
            </div>
          </div>
        </div>
      )}

      {}
      {showModal && modalDate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Mark Attendance</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-date-label">
              {new Date(modalDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </div>
            {getSubjectsForDate(modalDate).length > 0 && (
              <div className="modal-subjects">
                <span className="modal-subj-label">Today's subjects</span>
                <div className="modal-subj-chips">
                  {getSubjectsForDate(modalDate).map(s => (
                    <span key={s} className="modal-subj-chip"
                      style={{ background: getSubjColor(s)+'22', color: getSubjColor(s), borderColor: getSubjColor(s)+'55' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="status-grid">
              {Object.entries(STATUS).map(([key, val]) => (
                <button key={key}
                  className={`status-card ${modalStatus === key ? 'active' : ''}`}
                  style={modalStatus === key ? { borderColor: val.color, background: val.color+'18' } : {}}
                  onClick={() => setModalStatus(key)}>
                  <span className="sc-dot" style={{ background: val.color }} />
                  <span className="sc-label" style={modalStatus === key ? { color: val.color } : {}}>{val.label}</span>
                </button>
              ))}
            </div>
            {modalStatus === 'holiday' && (
              <div className="modal-holiday-note">
                Marking as Holiday will exclude this day from attendance calculation.
              </div>
            )}
            <div className="form-group">
              <label>Note (optional)</label>
              <input type="text" value={modalNote} onChange={e => setModalNote(e.target.value)} placeholder="Add a note for this day..." />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={saveModal}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

