import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import DashboardLayout from '../components/DashboardLayout';
import SubmitModal from '../components/SubmitModal';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

const TABS = ['Recently', 'Today', 'Upcoming', 'Later'];

const getTabFilter = (tab) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  switch (tab) {
    case 'Today':
      return (t) => {
        const d = new Date(t.dueDate);
        return d >= today && d < new Date(today.getTime() + 86400000);
      };
    case 'Upcoming':
      return (t) => {
        const d = new Date(t.dueDate);
        return d >= new Date(today.getTime() + 86400000) && d <= weekEnd;
      };
    case 'Later':
      return (t) => {
        const d = new Date(t.dueDate);
        return d > weekEnd;
      };
    default:
      return () => true;
  }
};

const StudentDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Recently');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingTask, setSubmittingTask] = useState(null);
  const { addToast } = useToast();
  const socketRef = useSocket();

  const [timeRunning, setTimeRunning] = useState(false);
  const [elapsed, setElapsed] = useState(() => {
    const saved = localStorage.getItem('tracker_elapsed');
    return saved ? parseInt(saved, 10) : 0;
  });

  const fetchTasks = async () => {
    try {
      setError('');
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onTaskCreated = (task) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
      addToast(`New task assigned: ${task.title}`, 'info');
    };

    const onTaskUpdated = (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    };

    const onTaskDeleted = ({ _id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== _id));
    };

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:deleted', onTaskDeleted);

    return () => {
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
    };
  }, [socketRef]);

  useEffect(() => {
    localStorage.setItem('tracker_elapsed', elapsed.toString());
  }, [elapsed]);

  useEffect(() => {
    let interval;
    if (timeRunning) {
      interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timeRunning]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const updated = await api.put(`/tasks/${taskId}/status`, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated.data : t)));
      addToast('Task status updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmitTask = async (taskId, { githubLink, deployedLink, file }) => {
    try {
      const formData = new FormData();
      if (githubLink) formData.append('githubLink', githubLink);
      if (deployedLink) formData.append('deployedLink', deployedLink);
      if (file) formData.append('submissionFile', file);

      const { data } = await api.put(`/tasks/${taskId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
      setSubmittingTask(null);
      addToast('Task submitted! Waiting for admin review.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Submission failed', 'error');
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => t.status !== 'completed');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignedTo?.name?.toLowerCase().includes(q)
      );
    }

    if (activeTab !== 'Recently') {
      result = result.filter(getTabFilter(activeTab));
    }

    return result;
  }, [tasks, activeTab, searchQuery]);

  const completedTasks = useMemo(() => {
    let result = tasks.filter((t) => t.status === 'completed');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, searchQuery]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 3 + i);
    return d;
  });

  const todayTasks = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d >= today && d < new Date(today.getTime() + 86400000) && t.status !== 'completed';
  });

  const timelineTasks = todayTasks.slice(0, 3);

  if (loading) {
    return (
      <DashboardLayout onSearchChange={setSearchQuery} searchValue={searchQuery}>
        <div className="loading">Loading</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onSearchChange={setSearchQuery} searchValue={searchQuery}>
      <div className="dashboard-columns">
        <div className="col-main">
          <div className="tasks-section">
            <div className="tasks-header">
              <h2>My tasks {searchQuery && `— searching "${searchQuery}"`}</h2>
            </div>

            <div className="tabs-bar">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="task-cards">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  {searchQuery ? 'No tasks match your search.' : 'No pending tasks. Great job! 🎉'}
                </div>
              ) : (
                filteredTasks.map((task, i) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onSubmitTask={(task) => setSubmittingTask(task)}
                    dark={i % 2 === 1}
                  />
                ))
              )}

              {completedTasks.length > 0 && (
                <details className="completed-section">
                  <summary className="completed-summary">
                    Completed ({completedTasks.length})
                  </summary>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {completedTasks.map((task) => (
                      <TaskCard key={task._id} task={task} compact />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>

        <div className="col-right">
          <div className="time-tracker-card">
            <div className="tracker-circle">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#d4a853" strokeWidth="6"
                  strokeDasharray={`${(elapsed % 3600) / 36} 264`}
                  strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="42" textAnchor="middle" fontSize="11" fill="#1f2937" fontWeight="700">
                  {formatTime(elapsed)}
                </text>
                <text x="50" y="58" textAnchor="middle" fontSize="8" fill="#9ca3af">
                  {timeRunning ? 'tracking...' : 'tracked'}
                </text>
              </svg>
            </div>
            <div className="tracker-actions">
              <button className={`tracker-btn ${timeRunning ? 'running' : ''}`} onClick={() => { setTimeRunning(!timeRunning); if (!timeRunning) addToast('Timer started', 'info'); }}>
                {timeRunning ? '⏸' : '▶'}
              </button>
              <button className="tracker-btn" onClick={() => { setElapsed(0); setTimeRunning(false); addToast('Timer reset', 'info'); }} title="Reset">⟳</button>
              <button className="tracker-btn" onClick={() => { const n = prompt('Note for this time:'); if (n) { const logs = JSON.parse(localStorage.getItem('time_logs') || '[]'); logs.push({ time: elapsed, note: n, date: new Date().toISOString() }); localStorage.setItem('time_logs', JSON.stringify(logs)); addToast('Time noted', 'success'); } }} title="Note Time">📝</button>
            </div>
          </div>

          <div className="date-section">
            <h3 className="date-header">{dateStr}</h3>

          </div>

          <div className="mini-calendar">
            {dates.map((d, i) => {
              const hasTask = tasks.some((t) => {
                const td = new Date(t.dueDate);
                return td.getDate() === d.getDate() && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
              });
              return (
                <div key={i} className={`cal-day ${i === 3 ? 'active' : ''}`}>
                  <span className="cal-day-name">{weekDays[d.getDay()]}</span>
                  <span className="cal-day-num">{d.getDate()}</span>
                  {hasTask && <span className="cal-dot" />}
                </div>
              );
            })}
          </div>

          <div className="timeline-section">
            <h4 className="timeline-title">Today's Schedule</h4>
            <div className="timeline">
              {timelineTasks.length === 0 ? (
                <p className="timeline-empty">No tasks scheduled for today</p>
              ) : (
                timelineTasks.map((task, idx) => {
                  const timeLabels = ['10:30 AM', '2:00 PM', '4:30 PM'];
                  return (
                    <div key={task._id} className="timeline-item">
                      <div className={`timeline-dot ${idx === 0 ? 'yellow' : 'gray'}`} />
                      <div className={`timeline-content ${idx === 0 ? 'meeting-card' : ''}`}>
                        {idx === 0 ? (
                          <>
                            <div className="meeting-header">
                              <span className="meeting-time">{timeLabels[idx]}</span>
                              <span className="meeting-check">✓</span>
                            </div>
                            <h4>{task.title}</h4>
                            <p>{task.description.slice(0, 60)}...</p>
                            <div className="meeting-attendees">
                              <div className="attendee-avatar" style={{ backgroundColor: '#d4a853' }}>
                                {task.assignedTo?.name?.charAt(0) || 'U'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="timeline-time">{timeLabels[idx]}</span>
                            <div className="timeline-event">
                              <span className="event-label">{task.title}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="time-notes-card">
            <h4 className="timeline-title">Time Notes</h4>
            <div className="time-notes-list">
              {(() => {
                const notes = JSON.parse(localStorage.getItem('time_logs') || '[]');
                if (notes.length === 0) return <p className="timeline-empty">No time notes yet</p>;
                const fmt = (s) => { const h = String(Math.floor(s / 3600)).padStart(2,'0'); const m = String(Math.floor((s % 3600) / 60)).padStart(2,'0'); const sec = String(s % 60).padStart(2,'0'); return `${h}h ${m}m ${sec}s`; };
                return [...notes].reverse().slice(0, 10).map((n, i) => (
                  <div key={i} className="time-note-item">
                    <span className="time-note-time">{fmt(n.time)}</span>
                    <span className="time-note-text">{n.note}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      <SubmitModal
        open={!!submittingTask}
        onClose={() => setSubmittingTask(null)}
        onSubmit={handleSubmitTask}
        task={submittingTask}
      />
    </DashboardLayout>
  );
};

export default StudentDashboard;
