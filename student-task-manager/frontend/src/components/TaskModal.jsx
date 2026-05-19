import { useState, useEffect } from 'react';

const TaskModal = ({ open, onClose, onSave, students, initialData }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    status: 'pending',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        dueDate: initialData.dueDate ? initialData.dueDate.slice(0, 10) : '',
        status: initialData.status || 'pending',
      });
    } else {
      setForm({ title: '', description: '', assignedTo: '', dueDate: '', status: 'pending' });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const isEditing = !!initialData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Task' : 'Create Task'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text" value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter task title" required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter task description" required
              />
            </div>
            {students && students.length > 0 ? (
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Assign To</label>
                <div className="no-students-msg">
                  No students registered yet. Ask students to{' '}
                  <a href="/register" target="_blank" rel="noopener noreferrer">register</a>
                  {' '}first.
                </div>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date" value={form.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  required
                />
              </div>
              {isEditing && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-gold">{isEditing ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
