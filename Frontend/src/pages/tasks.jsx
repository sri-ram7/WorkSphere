import React, { useEffect, useMemo, useState } from 'react';
import './css/tasks.css';
import { tasksAPI } from '../services/api';
import DEFAULT_WORKOUT_PLAN from '../data/defaultWorkoutPlan';
import { useTheme } from '../context/ThemeContext';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const normalizeWorkoutPlan = (incoming) => {
  const safe = incoming && typeof incoming === 'object' ? incoming : {};
  const normalized = {};

  DAYS_ORDER.forEach((day) => {
    const fallback = DEFAULT_WORKOUT_PLAN[day];
    const candidate = safe[day];

    if (!candidate || typeof candidate !== 'object') {
      normalized[day] = fallback;
      return;
    }

    if (Array.isArray(candidate.items) && !Array.isArray(candidate.sections)) {
      normalized[day] = {
        theme: candidate.theme || fallback.theme,
        sections: [
          {
            id: `legacy_${day}`,
            title: 'Workout',
            exercises: candidate.items.map((it, idx) => ({
              id: it.id || `legacy_ex_${day}_${idx}`,
              name: it.name || 'Exercise',
              detail: it.detail || '',
              done: Boolean(it.done),
            })),
          },
        ],
      };
      return;
    }

    const sections = Array.isArray(candidate.sections) ? candidate.sections : fallback.sections;
    normalized[day] = {
      theme: candidate.theme || fallback.theme,
      sections,
    };
  });

  return normalized;
};

function Tasks() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasksData, setTasksData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ day: 'Monday', name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [workoutPlan, setWorkoutPlan] = useState(DEFAULT_WORKOUT_PLAN);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [workoutReady, setWorkoutReady] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await tasksAPI.getAll();
      setTasksData(data.tasksData || []);
      setWorkoutPlan(normalizeWorkoutPlan(data.workoutPlan || DEFAULT_WORKOUT_PLAN));
      setWorkoutReady(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const saveQueue = React.useRef(Promise.resolve());

  useEffect(() => {
    if (!workoutReady) return;
    const t = setTimeout(() => {
      console.log('💾 Auto-saving workout plan...');
      saveQueue.current = saveQueue.current.then(() =>
        tasksAPI.saveAll({ workoutPlan })
          .then(() => console.log('✅ Workout plan saved'))
          .catch((err) => console.error('❌ Failed to save workout:', err))
      );
    }, 500);
    return () => clearTimeout(t);
  }, [workoutPlan, workoutReady]);

  const toggleTask = async (day, taskId) => {
    try {
      console.log('🔄 Toggling task:', { day, taskId });
      const { data } = await tasksAPI.toggle(day, taskId);
      console.log('✅ Toggle response:', data);
      setTasksData(data.tasksData || []);
    } catch (err) {
      console.error('❌ Failed to toggle task:', err);
      setError(err?.response?.data?.message || 'Failed to toggle task');
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.name.trim()) return;
    try {
      const { data } = await tasksAPI.addTask(newTask.day, newTask.name, 'custom');
      setTasksData(data.tasksData || []);
      setShowModal(false);
      setNewTask({ day: 'Monday', name: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add task');
    }
  };

  const deleteTask = async (day, taskId) => {
    try {
      const { data } = await tasksAPI.delete(day, taskId);
      setTasksData(data.tasksData || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete task');
    }
  };

  const totalTasks = tasksData.reduce((sum, d) => sum + d.tasks.length, 0);
  const completedTasks = tasksData.reduce((sum, d) => sum + d.tasks.filter((t) => t.completed).length, 0);
  const completionRate = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0.0';

  const dailyCompletion = useMemo(
    () =>
      tasksData.map((d) => ({
        day: d.day,
        completed: d.tasks.filter((t) => t.completed).length,
        total: d.tasks.length,
      })),
    [tasksData]
  );

  const pieData = useMemo(() => {
    const taskTypes = {};
    tasksData.forEach((day) => {
      day.tasks.forEach((task) => {
        const type = task.type || 'other';
        if (!taskTypes[type]) taskTypes[type] = { total: 0, completed: 0 };
        taskTypes[type].total += 1;
        if (task.completed) taskTypes[type].completed += 1;
      });
    });
    return {
      completed: completedTasks,
      remaining: Math.max(0, totalTasks - completedTasks),
      taskTypes,
    };
  }, [tasksData, totalTasks, completedTasks]);

  const toggleWorkout = (sectionId, exerciseId) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        sections: prev[selectedDay].sections.map((sec) =>
          sec.id !== sectionId
            ? sec
            : {
                ...sec,
                exercises: sec.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, done: !ex.done } : ex)),
              }
        ),
      },
    }));
  };

  const resetWorkoutDay = () => {
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        sections: prev[selectedDay].sections.map((sec) => ({
          ...sec,
          exercises: sec.exercises.map((ex) => ({ ...ex, done: false })),
        })),
      },
    }));
  };

  const dayWorkout = workoutPlan[selectedDay] || DEFAULT_WORKOUT_PLAN[selectedDay];
  const flatDayExercises = (dayWorkout?.sections || []).flatMap((s) => s.exercises);
  const dayDone = flatDayExercises.filter((i) => i.done).length;
  const dayTotal = flatDayExercises.length;
  const dayPct = dayTotal ? Math.round((dayDone / dayTotal) * 100) : 0;
  const weeklyWorkout = DAYS_ORDER.map((day) => {
    const items = (workoutPlan[day]?.sections || []).flatMap((s) => s.exercises);
    const done = items.filter((i) => i.done).length;
    const total = items.length;
    return { day, done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  });
  const workoutTotal = weeklyWorkout.reduce((s, d) => s + d.total, 0);
  const workoutDone = weeklyWorkout.reduce((s, d) => s + d.done, 0);
  const workoutRate = workoutTotal ? ((workoutDone / workoutTotal) * 100).toFixed(1) : '0.0';

  const editTheme = () => {
    const next = window.prompt('Edit theme', dayWorkout?.theme || '');
    if (!next) return;
    setWorkoutPlan((prev) => ({ ...prev, [selectedDay]: { ...prev[selectedDay], theme: next.trim() } }));
  };

  const addSection = () => {
    const title = window.prompt('Section title');
    if (!title) return;
    const section = { id: `s_${Date.now()}`, title: title.trim(), exercises: [] };
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        sections: [...(prev[selectedDay].sections || []), section],
      },
    }));
  };

  const addExercise = (sectionId) => {
    const name = window.prompt('Exercise name');
    if (!name) return;
    const detail = window.prompt('Exercise detail (optional)') || '';
    const exercise = { id: `e_${Date.now()}`, name: name.trim(), detail: detail.trim(), done: false };
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        sections: prev[selectedDay].sections.map((sec) =>
          sec.id === sectionId ? { ...sec, exercises: [...sec.exercises, exercise] } : sec
        ),
      },
    }));
  };

  const editExercise = (sectionId, exerciseId) => {
    const sec = dayWorkout.sections.find((s) => s.id === sectionId);
    const ex = sec?.exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const name = window.prompt('Edit exercise name', ex.name);
    if (!name) return;
    const detail = window.prompt('Edit detail', ex.detail || '') || '';
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        sections: prev[selectedDay].sections.map((section) =>
          section.id !== sectionId
            ? section
            : {
                ...section,
                exercises: section.exercises.map((item) =>
                  item.id === exerciseId ? { ...item, name: name.trim(), detail: detail.trim() } : item
                ),
              }
        ),
      },
    }));
  };

  const deleteExercise = (sectionId, exerciseId) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        sections: prev[selectedDay].sections.map((section) =>
          section.id !== sectionId
            ? section
            : { ...section, exercises: section.exercises.filter((item) => item.id !== exerciseId) }
        ),
      },
    }));
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>{activeTab === 'tasks' ? 'Tasks' : 'Workout Plan'}</h1>
        <div className="page-tabs">
          <button className={`page-tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>✓ Tasks</button>
          <button className={`page-tab ${activeTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveTab('workout')}>🏋 Workout</button>
          {activeTab === 'tasks' && <button className="add-task-btn" onClick={() => setShowModal(true)}>+ Add Task</button>}
        </div>
      </div>

      {activeTab === 'tasks' && (
        <>
          <div className="stats-cards">
            <div className="stat-card"><span className="stat-label">Total Tasks</span><span className="stat-value">{totalTasks}</span></div>
            <div className="stat-card"><span className="stat-label">Completed</span><span className="stat-value">{completedTasks}</span></div>
            <div className="stat-card"><span className="stat-label">Completion Rate</span><span className="stat-value">{completionRate}%</span></div>
          </div>

          {error && <p>{error}</p>}
          {loading ? <p>Loading...</p> : (
            <div className="tasks-grid">
              {tasksData.map((dayData) => (
                <div key={dayData.day} className="task-card">
                  <div className="card-header">
                    <h2>{dayData.day}</h2>
                    <span className="day-progress">
                      {dayData.tasks.filter((t) => t.completed).length}/{dayData.tasks.length}
                    </span>
                  </div>
                  <div className="task-list">
                    {dayData.tasks.map((task) => (
                      <div key={task._id} className="task-item">
                        <input
                          type="checkbox"
                          className="task-checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(dayData.day, task._id)}
                        />
                        <span className={`task-name ${task.completed ? 'completed' : ''}`}>{task.name}</span>
                        <button className="action-btn delete-btn" onClick={() => deleteTask(dayData.day, task._id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="charts-section">
            <div className="chart-container bar-chart">
              <h3>Daily Task Completion</h3>
              <div className="bar-graph">
                {dailyCompletion.map((day) => {
                  const pct = day.total ? Math.round((day.completed / day.total) * 100) : 0;
                  return (
                    <div key={day.day} className="bar-wrapper">
                      <div className="bar-label">{day.day.slice(0, 3)}</div>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ height: `${pct}%` }}>
                          <span className="bar-percentage">{pct}%</span>
                        </div>
                      </div>
                      <div className="bar-stats"><span>{day.completed}/{day.total}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-container pie-chart">
              <h3>Overall Task Completion</h3>
              <div className="pie-container">
                <div className="pie-wrapper">
                  <svg viewBox="0 0 100 100" className="pie-svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e5e5" strokeWidth="20" />
                    {Number(completionRate) > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="20"
                        strokeDasharray={`${2 * Math.PI * 40 * Number(completionRate) / 100} ${2 * Math.PI * 40}`}
                        strokeDashoffset={2 * Math.PI * 40 * 0.25}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                      />
                    )}
                    <text x="50" y="55" textAnchor="middle" className="pie-text">
                      {Number(completionRate).toFixed(0)}%
                    </text>
                  </svg>
                </div>
                <div className="pie-legend">
                  <div className="legend-item"><span className="legend-color completed"></span><span>Completed ({pieData.completed})</span></div>
                  <div className="legend-item"><span className="legend-color remaining"></span><span>Remaining ({pieData.remaining})</span></div>
                </div>
              </div>
              <div className="task-breakdown">
                <h4>Task Type Breakdown</h4>
                <div className="breakdown-grid">
                  {Object.entries(pieData.taskTypes).map(([type, data]) => (
                    <div key={type} className="breakdown-item">
                      <span className="breakdown-label">{type}:</span>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill"
                          style={{ width: `${data.total ? (data.completed / data.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="breakdown-stats">{data.completed}/{data.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'workout' && (
        <div className="workout-section">
          <div className="stats-cards">
            <div className="stat-card"><span className="stat-label">Weekly Exercises</span><span className="stat-value">{workoutTotal}</span></div>
            <div className="stat-card"><span className="stat-label">Completed</span><span className="stat-value">{workoutDone}</span></div>
            <div className="stat-card"><span className="stat-label">Completion Rate</span><span className="stat-value">{workoutRate}%</span></div>
          </div>

          <div className="workout-day-bar">
            {DAYS_ORDER.map((day) => (
              <button key={day} className={`wday-btn ${selectedDay === day ? 'active' : ''}`} onClick={() => setSelectedDay(day)}>
                <span className="wday-name">{day.slice(0, 3)}</span>
              </button>
            ))}
          </div>

          <div className="workout-day-header">
            <div className="wdh-left">
              <div className="wdh-title-wrap">
                <h2 className="wdh-day">{selectedDay}</h2>
                <span className="wdh-theme">{dayWorkout.theme}</span>
              </div>
              <div className="wdh-meta">
                <span>{dayDone}/{dayTotal} exercises done</span>
                <span className="wdh-dot">·</span>
                <span>{dayPct}% complete</span>
              </div>
            </div>
            <div className="wdh-actions">
              <button className="wo-reset-btn" onClick={editTheme}>✎ Theme</button>
              <button className="wo-reset-btn" onClick={addSection}>+ Section</button>
              <button className="wo-reset-btn" onClick={resetWorkoutDay}>↺ Reset</button>
            </div>
          </div>

          <div className="workout-sections">
            {(dayWorkout?.sections || []).map((section) => (
              <div className="workout-card" key={section.id}>
                <div className="wc-header">
                  <div className="wc-title-row">
                    <span className="wc-icon">🏋</span>
                    <span className="wc-title">{section.title}</span>
                    <span className="wc-count">{section.exercises.filter((e) => e.done).length}/{section.exercises.length}</span>
                    <button className="action-btn edit-btn" onClick={() => addExercise(section.id)}>Ex</button>
                  </div>
                </div>
                <div className="wc-exercises">
                  {section.exercises.map((item) => (
                    <div key={item.id} className={`wo-exercise ${item.done ? 'done' : ''}`}>
                      <input type="checkbox" className="wo-checkbox" checked={item.done} onChange={() => toggleWorkout(section.id, item.id)} />
                      <div className="ex-info">
                        <span className={`ex-name ${item.done ? 'ex-done' : ''}`}>{item.name}</span>
                        {item.detail && <span className="ex-detail">{item.detail}</span>}
                      </div>
                      <button className="action-btn edit-btn" onClick={() => editExercise(section.id, item.id)}>✎</button>
                      <button className="action-btn delete-btn" onClick={() => deleteExercise(section.id, item.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="charts-section">
            <div className="chart-container bar-chart">
              <h3>Weekly Workout Progress</h3>
              <div className="bar-graph">
                {weeklyWorkout.map((d) => (
                  <div key={d.day} className="bar-wrapper">
                    <div className="bar-label">{d.day.slice(0, 3)}</div>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ height: `${d.pct}%` }}>
                        <span className="bar-percentage">{d.pct}%</span>
                      </div>
                    </div>
                    <div className="bar-stats"><span>{d.done}/{d.total}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container pie-chart">
              <h3>Overall Workout Completion</h3>
              <div className="pie-container">
                <div className="pie-wrapper">
                  <svg viewBox="0 0 100 100" className="pie-svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e5e5" strokeWidth="20" />
                    {Number(workoutRate) > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray={`${2 * Math.PI * 40 * Number(workoutRate) / 100} ${2 * Math.PI * 40}`}
                        strokeDashoffset={2 * Math.PI * 40 * 0.25}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    )}
                    <text x="50" y="55" textAnchor="middle" className="pie-text">
                      {Number(workoutRate).toFixed(0)}%
                    </text>
                  </svg>
                </div>
                <div className="pie-legend">
                  <div className="legend-item"><span className="legend-color completed"></span><span>Done ({workoutDone})</span></div>
                  <div className="legend-item"><span className="legend-color remaining"></span><span>Remaining ({Math.max(0, workoutTotal - workoutDone)})</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Task</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={addTask}>
              <div className="form-group">
                <label>Task Name</label>
                <input value={newTask.name} onChange={(e) => setNewTask((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Day</label>
                <select value={newTask.day} onChange={(e) => setNewTask((p) => ({ ...p, day: e.target.value }))}>
                  {DAYS_ORDER.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;

