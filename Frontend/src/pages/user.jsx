import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { tasksAPI } from "../services/api";
import { expensesAPI } from "../services/api";
import { attendanceAPI } from "../services/api";
import { eventsAPI } from "../services/api";
import './css/user.css';

function UserProfile() {
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const firstName  = user?.firstName || "";
  const lastName   = user?.lastName  || user?.email?.split("@")[0] || "User";
  const email      = user?.email  || "—";
  const role       = user?.role   || "Member";
  const avatarLetter = (firstName || lastName).charAt(0).toUpperCase();
  const fullName   = firstName ? `${firstName} ${lastName}` : lastName;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })
    : "—";

  const [tasksData,   setTasksData]   = useState([]);
  const [expenses,    setExpenses]    = useState([]);
  const [attendance,  setAttendance]  = useState({ pct: 0, attended: 0, total: 0, absent: 0, holidays: 0 });
  const [events,      setEvents]      = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [taskRes, expRes, attRes, evtRes] = await Promise.all([
          tasksAPI.getAll(),
          expensesAPI.getAll({ sortBy: "date", order: "desc" }),
          attendanceAPI.getAll(),
          eventsAPI.getAll(),
        ]);

        setTasksData(taskRes.data.tasksData || []);
        setWorkoutPlan(taskRes.data.workoutPlan || {});
        setExpenses((expRes.data.expenses || []).slice(0, 5));

        const db = attRes.data?.attendance || {};
        const attMap   = db.attendanceData || {};
        let holidays = db.holidays || [];

        // Convert holiday dates to ISO string format if they're Date objects
        holidays = holidays.map(h => ({
          ...h,
          date: typeof h.date === 'string' ? h.date : new Date(h.date).toISOString().split('T')[0]
        }));

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthDates = Array.from({ length: daysInMonth }, (_, index) => {
          const date = new Date(year, month, index + 1);
          return date.toISOString().split('T')[0];
        });

        const holidayDates = new Set(holidays.map(h => h.date));
        const presentDays = new Set(
          Object.entries(attMap)
            .filter(([date, status]) => status === 'present')
            .map(([date]) => date)
        );

        const total = monthDates.filter(date => !holidayDates.has(date)).length;
        const attended = monthDates.filter(date => presentDays.has(date)).length;
        const absent = Math.max(0, total - attended);
        const pct = total > 0 ? Math.round((attended / total) * 100) : 0;

        console.log('📊 Attendance month summary:', { year, month: month + 1, daysInMonth, total, attended, absent, pct });
        setAttendance({ pct, attended, total, absent, holidays: holidays.length });

        const todayStr = new Date().toISOString().split("T")[0];
        const upcoming = (evtRes.data.events || [])
          .filter(e => e.date >= todayStr)
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
          .slice(0, 5);
        setEvents(upcoming);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalTasks     = tasksData.reduce((s, d) => s + d.tasks.length, 0);
  const completedTasks = tasksData.reduce((s, d) => s + d.tasks.filter(t => t.completed).length, 0);
  const remainingTasks = totalTasks - completedTasks;
  const taskPct        = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const taskDash       = 201.1;
  const taskOffset     = taskDash - (taskDash * taskPct) / 100;

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const weeklyWorkout = DAYS_ORDER.map(day => {
    const items = (workoutPlan[day]?.sections || []).flatMap(s => s.exercises);
    const done  = items.filter(i => i.done).length;
    return { day: day.slice(0, 3), done, total: items.length };
  });
  const woDone  = weeklyWorkout.reduce((s, d) => s + d.done, 0);
  const woTotal = weeklyWorkout.reduce((s, d) => s + d.total, 0);
  const woPct   = woTotal ? Math.round((woDone / woTotal) * 100) : 0;
  const woDash  = 188.5;
  const woOffset = woDash - (woDash * woPct) / 100;

  const attDash   = 188.5;
  const attOffset = attDash - (attDash * attendance.pct) / 100;

  const recentTasks = tasksData
    .flatMap(d => d.tasks.map(t => ({ ...t, day: d.day })))
    .slice(0, 5);

  const CATEGORY_COLORS = {
    Work: "#ffffff", Personal: "#aaaaaa", Health: "#888888",
    Learning: "#cccccc", Social: "#666666", Other: "#555555"
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="profile-page">
      <div className="profile-blob blob-1" />
      <div className="profile-blob blob-2" />

      <div className="profile-wrapper">

        {/* ── Hero ── */}
        <div className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-avatar-ring">
              <div className="profile-avatar">{avatarLetter}</div>
            </div>
            <div className="profile-hero-info">
              <h1 className="profile-fullname">{fullName}</h1>
              <span className="profile-role-badge">{role}</span>
              <p className="profile-email">{email}</p>
              <div className="status-active">
                <span className="status-dot" />
                <span className="status-text">Active account</span>
              </div>
            </div>
          </div>
          <div className="profile-hero-right">
            <div className="hero-stat-row">
              <div className="hero-stat">
                <span className="hero-stat-val">{completedTasks}</span>
                <span className="hero-stat-lbl">Tasks Done</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-val">{remainingTasks}</span>
                <span className="hero-stat-lbl">Remaining</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-val">{attendance.pct}%</span>
                <span className="hero-stat-lbl">Attendance</span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="profile-btn outline" onClick={toggleTheme}>
                {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
              </button>
              <button className="profile-btn outline" onClick={() => navigate(-1)}>← Go Back</button>
              <button className="profile-btn danger" onClick={logoutContext}>Log out</button>
            </div>
          </div>
        </div>

        {/* ── Overview stats ── */}
        <div className="profile-divider">
          <div className="profile-divider-line" /><span className="profile-divider-label">Overview</span><div className="profile-divider-line" />
        </div>
        <div className="overview-stats">
          <div className="ostat-card">
            <span className="ostat-lbl">Total tasks</span>
            <span className="ostat-val">{totalTasks}</span>
            <span className="ostat-sub">across 7 days</span>
            <div className="ostat-bar"><div className="ostat-fill" style={{ width: "100%" }} /></div>
          </div>
          <div className="ostat-card">
            <span className="ostat-lbl">Completed</span>
            <span className="ostat-val">{completedTasks}</span>
            <span className="ostat-sub">{taskPct}% done</span>
            <div className="ostat-bar"><div className="ostat-fill green" style={{ width: `${taskPct}%` }} /></div>
          </div>
          <div className="ostat-card">
            <span className="ostat-lbl">Total spent</span>
            <span className="ostat-val">₹{(totalExpenses / 1000).toFixed(1)}k</span>
            <span className="ostat-sub">recent expenses</span>
            <div className="ostat-bar"><div className="ostat-fill" style={{ width: "55%" }} /></div>
          </div>
          <div className="ostat-card">
            <span className="ostat-lbl">Attendance</span>
            <span className="ostat-val">{attendance.pct}%</span>
            <span className="ostat-sub">{attendance.pct >= 75 ? "above 75% target" : "⚠ below 75%"}</span>
            <div className="ostat-bar">
              <div className="ostat-fill green" style={{ width: `${attendance.pct}%` }} />
            </div>
          </div>
        </div>

        {/* ── Tasks + Expenses ── */}
        <div className="profile-divider">
          <div className="profile-divider-line" /><span className="profile-divider-label">Tasks & Expenses</span><div className="profile-divider-line" />
        </div>
        <div className="two-col">

          {/* Tasks */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <span className="dash-panel-title">Task progress</span>
              <span className="dash-panel-meta">This week</span>
            </div>
            <div className="ring-row">
              <svg viewBox="0 0 80 80" className="ring-svg">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
                <circle cx="40" cy="40" r="32" fill="none" stroke="#ffffff" strokeWidth="10"
                  strokeDasharray={taskDash} strokeDashoffset={taskOffset}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
                <text x="40" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="Syne,sans-serif">{taskPct}%</text>
                <text x="40" y="48" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="DM Sans,sans-serif">complete</text>
              </svg>
              <div className="ring-info">
                <div className="ring-val">{completedTasks} / {totalTasks}</div>
                <div className="ring-lbl">tasks completed</div>
                <div className="ring-sub">{remainingTasks} remaining this week</div>
              </div>
            </div>
            <div className="task-list-mini">
              {loading
                ? <div className="dash-loading">Loading…</div>
                : recentTasks.map(task => (
                  <div className="task-item-mini" key={task._id}>
                    <div className={`t-check ${task.completed ? "done" : ""}`} />
                    <span className={`t-name ${task.completed ? "done" : ""}`}>{task.name}</span>
                    <span className="t-day">{task.day?.slice(0, 3)}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Expenses */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <span className="dash-panel-title">Recent expenses</span>
              <span className="dash-panel-meta">₹{totalExpenses.toLocaleString()} total</span>
            </div>
            <div className="mini-bars">
              {["Food","Transport","Shopping","Health","Other"].map(cat => {
                const catTotal = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
                const pct = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0;
                return (
                  <div className="mbar-wrap" key={cat}>
                    <div className="mbar-track">
                      <div className="mbar-fill" style={{ height: `${Math.max(pct, 4)}%` }} />
                    </div>
                    <span className="mbar-lbl">{cat.slice(0, 4)}</span>
                  </div>
                );
              })}
            </div>
            <div className="exp-list">
              {expenses.map(exp => (
                <div className="exp-row" key={exp._id}>
                  <span className="exp-dot" />
                  <div className="exp-body">
                    <span className="exp-name">{exp.name}</span>
                    <span className="exp-cat">{exp.category}</span>
                  </div>
                  <span className="exp-amt">₹{Number(exp.amount).toLocaleString()}</span>
                </div>
              ))}
              {!loading && expenses.length === 0 && <div className="dash-empty">No expenses yet.</div>}
            </div>
          </div>
        </div>

        {/* ── Attendance + Events + Workout ── */}
        <div className="profile-divider">
          <div className="profile-divider-line" /><span className="profile-divider-label">Attendance & Schedule</span><div className="profile-divider-line" />
        </div>
        <div className="three-col">

          {/* Attendance */}
          <div className="dash-panel">
            <span className="dash-panel-title">Attendance</span>
            <div className="att-ring-row">
              <svg viewBox="0 0 80 80" className="ring-svg">
                <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9"/>
                <circle cx="40" cy="40" r="30" fill="none" stroke="#fff" strokeWidth="9"
                  strokeDasharray={attDash} strokeDashoffset={attOffset}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
                <text x="40" y="37" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Syne,sans-serif">{attendance.pct}%</text>
                <text x="40" y="48" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.3)" fontFamily="DM Sans,sans-serif">{attendance.pct >= 75 ? "Safe ✓" : "⚠ Low"}</text>
              </svg>
              <div className="att-info">
                <div className="att-pct-big">{attendance.pct}%</div>
                <div className="att-sub">{attendance.attended} present / {attendance.total} total</div>
                <div className="att-bar-track">
                  <div className="att-bar-fill" style={{ width: `${attendance.pct}%` }} />
                </div>
              </div>
            </div>
            <div className="att-chips">
              <div className={`att-chip ${attendance.pct >= 75 ? "safe" : "warn"}`}>
                <span>{attendance.absent} absent days</span>
                <span>{attendance.pct >= 75 ? "On track" : "⚠ At risk"}</span>
              </div>
              <div className="att-chip neutral">
                <span>{attendance.holidays} holidays</span>
                <span>Excluded</span>
              </div>
            </div>
          </div>

          {/* Events */}
          <div className="dash-panel">
            <span className="dash-panel-title">Upcoming events</span>
            <div className="events-list">
              {loading
                ? <div className="dash-loading">Loading…</div>
                : events.length === 0
                  ? <div className="dash-empty">No upcoming events.</div>
                  : events.map(ev => (
                    <div className="ev-item" key={ev._id}>
                      <div className="ev-accent" />
                      <div className="ev-body">
                        <span className="ev-name">{ev.title}</span>
                        <span className="ev-meta">
                          {new Date(ev.date + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short" })} · {formatTime(ev.time)} · {ev.category}
                        </span>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Workout */}
          <div className="dash-panel">
            <span className="dash-panel-title">Workout this week</span>
            <div className="ring-row">
              <svg viewBox="0 0 80 80" className="ring-svg" style={{ width: 68, height: 68 }}>
                <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9"/>
                <circle cx="40" cy="40" r="30" fill="none" stroke="#fff" strokeWidth="9"
                  strokeDasharray={woDash} strokeDashoffset={woOffset}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
                <text x="40" y="37" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Syne,sans-serif">{woPct}%</text>
                <text x="40" y="48" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.3)" fontFamily="DM Sans,sans-serif">done</text>
              </svg>
              <div>
                <div className="ring-val" style={{ fontSize: 18 }}>{woDone} / {woTotal}</div>
                <div className="ring-lbl">exercises done</div>
              </div>
            </div>
            <div className="wo-day-bars">
              {weeklyWorkout.slice(0, 5).map(d => (
                <div className="wo-bar-row" key={d.day}>
                  <span className="wo-day-lbl">{d.day}</span>
                  <div className="wo-bar-track">
                    <div className="wo-bar-fill" style={{ width: d.total > 0 ? `${(d.done / d.total) * 100}%` : "0%" }} />
                  </div>
                  <span className="wo-count">{d.done}/{d.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Account Details ── */}
        <div className="profile-divider">
          <div className="profile-divider-line" /><span className="profile-divider-label">Account details</span><div className="profile-divider-line" />
        </div>
        <div className="dash-panel account-panel">
          <div className="profile-grid">
            <div className="profile-card">
              <span className="profile-card-label">First Name</span>
              <span className="profile-card-value">{firstName || "—"}</span>
            </div>
            <div className="profile-card">
              <span className="profile-card-label">Last Name</span>
              <span className="profile-card-value">{lastName}</span>
            </div>
            <div className="profile-card">
              <span className="profile-card-label">Email Address</span>
              <span className="profile-card-value">{email}</span>
            </div>
            <div className="profile-card">
              <span className="profile-card-label">Role</span>
              <span className="profile-card-value">{role}</span>
            </div>
            <div className="profile-card">
              <span className="profile-card-label">Member Since</span>
              <span className="profile-card-value">{joinedDate}</span>
            </div>
            <div className="profile-card">
              <span className="profile-card-label">Account Status</span>
              <div className="status-active">
                <span className="status-dot" />
                <span className="status-text">Active</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserProfile;
