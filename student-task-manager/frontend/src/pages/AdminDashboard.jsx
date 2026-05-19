import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import DashboardLayout from '../components/DashboardLayout';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const deletingRef = useRef(null);
  const { addToast } = useToast();
  const socketRef = useSocket();

  const [timeRunning, setTimeRunning] = useState(false);
  const [elapsed, setElapsed] = useState(() => {
    const saved = localStorage.getItem('admin_tracker_elapsed');
    return saved ? parseInt(saved, 10) : 0;
  });

  const fetchData = async () => {
    try {
      setError('');
      const [tasksRes, studentsRes] = await Promise.all([
        api.get('/admin/tasks'),
        api.get('/admin/students'),
      ]);
      setTasks(tasksRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      setError('Failed to load data');
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_tracker_elapsed', elapsed.toString());
  }, [elapsed]);

  useEffect(() => {
    let interval;
    if (timeRunning) {
      interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timeRunning]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onTaskCreated = (task) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
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
    socket.on('task:submitted', onTaskUpdated);

    return () => {
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('task:submitted', onTaskUpdated);
    };
  }, [socketRef]);

  const handleCreateTask = async (form) => {
    try {
      const { data } = await api.post('/admin/tasks', form);
      setTasks((prev) => [...prev, data]);
      setShowCreateModal(false);
      addToast('Task created successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (form) => {
    try {
      const { data } = await api.put(`/admin/tasks/${editingTask._id}`, form);
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? data : t)));
      setEditingTask(null);
      addToast('Task updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update task', 'error');
    }
  };

  const confirmDelete = async () => {
    const task = deletingRef.current;
    if (!task || !task._id) return;
    try {
      await api.delete(`/admin/tasks/${task._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      setDeletingTask(null);
      deletingRef.current = null;
      addToast('Task deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  const handleDeleteClick = (task) => {
    deletingRef.current = task;
    setDeletingTask(task);
  };

  const handleApprove = async (taskId) => {
    try {
      const { data } = await api.put(`/admin/tasks/${taskId}`, { status: 'completed' });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
      addToast('Task approved and completed', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (taskId) => {
    try {
      const { data } = await api.put(`/admin/tasks/${taskId}`, { status: 'pending' });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
      addToast('Task sent back for revision', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject', 'error');
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.assignedTo?.name?.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  if (loading) {
    return (
      <DashboardLayout onSearchChange={setSearchQuery} searchValue={searchQuery}>
        <div className="loading">Loading</div>
      </DashboardLayout>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const submittedCount = tasks.filter((t) => t.status === 'submitted').length;

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
    return d >= today && d < new Date(today.getTime() + 86400000);
  });

  return (
    <DashboardLayout onSearchChange={setSearchQuery} searchValue={searchQuery}>
      <div className="dashboard-columns">
        <div className="col-main">
          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Task Management {searchQuery && `— "${searchQuery}"`}</h2>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="admin-cards">
              <div className="admin-stat-card">
                <div className="admin-stat-value">{tasks.length}</div>
                <div className="admin-stat-label">Total</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-value">{pendingCount}</div>
                <div className="admin-stat-label">Pending</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-value">{inProgressCount}</div>
                <div className="admin-stat-label">In Progress</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-value">{submittedCount}</div>
                <div className="admin-stat-label">Submitted</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-value">{completedCount}</div>
                <div className="admin-stat-label">Completed</div>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-header">
                <h3>All Tasks ({filteredTasks.length})</h3>
                <button className="btn-gold" onClick={() => setShowCreateModal(true)}>+ New Task</button>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  {searchQuery ? 'No tasks match your search.' : 'No tasks yet. Create your first task!'}
                </div>
              ) : (
                <div className="task-cards">
                  {filteredTasks.map((task, i) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isAdmin
                      onEdit={() => setEditingTask(task)}
                      onDelete={() => handleDeleteClick(task)}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      dark={i % 2 === 1}
                    />
                  ))}
                </div>
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
                <text x="50" y="42" textAnchor="middle" fontSize="11" fill="#1f2937" fontWeight="700">{formatTime(elapsed)}</text>
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
            <button className="add-task-btn" onClick={() => setShowCreateModal(true)}>+ Add task</button>
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
              {todayTasks.length === 0 ? (
                <p className="timeline-empty">No tasks scheduled for today</p>
              ) : (
                todayTasks.slice(0, 3).map((task, idx) => {
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

      <TaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTask}
        students={students}
      />

      <TaskModal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleUpdateTask}
        students={students}
        initialData={editingTask}
      />

      <ConfirmModal
        open={!!deletingTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingTask(null)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
