const TaskCard = ({ task, onStatusChange, onDelete, onEdit, onSubmitTask, onApprove, onReject, dark, compact, isAdmin }) => {
  const statusColors = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    submitted: '#8b5cf6',
    completed: '#10b981',
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`task-card ${dark ? 'dark' : ''} ${compact ? 'compact' : ''}`}>
      <div className="task-card-header">
        <div className="task-title-row">
          <h3>{task.title}</h3>
          <span className="task-badge" style={{ backgroundColor: statusColors[task.status] }}>
            {task.status}
          </span>
        </div>
        {!compact && <div className="task-menu-btn">•••</div>}
      </div>
      {!compact && (
        <p className="task-description">{task.description}</p>
      )}
      <div className="task-meta">
        <span className="meta-due">📅 {formatDate(task.dueDate)}</span>
        {task.assignedTo?.name && (
          <span className="meta-assignee">👤 {task.assignedTo.name}</span>
        )}
        {task.createdBy?.name && (
          <span className="meta-creator">✏️ {task.createdBy.name}</span>
        )}
      </div>

      {(task.status === 'submitted' || task.status === 'completed') && (task.githubLink || task.deployedLink || task.submissionFile) && (
        <div className="submission-links">
          {task.githubLink && (
            <a href={task.githubLink} target="_blank" rel="noopener noreferrer" className="sub-link">🔗 GitHub</a>
          )}
          {task.deployedLink && (
            <a href={task.deployedLink} target="_blank" rel="noopener noreferrer" className="sub-link">🌐 Live Demo</a>
          )}
          {task.submissionFile && (
            <a href={`http://localhost:5000${task.submissionFile}`} target="_blank" rel="noopener noreferrer" className="sub-link">📦 Download ZIP</a>
          )}
          {task.submittedAt && (
            <span className="sub-date">Submitted: {formatDate(task.submittedAt)}</span>
          )}
        </div>
      )}

      {!compact && (
        <div className="task-progress-row">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: task.status === 'completed' ? '100%' : task.status === 'submitted' ? '80%' : task.status === 'in-progress' ? '60%' : '35%',
                backgroundColor: task.status === 'submitted' ? '#8b5cf6' : '#d4a853',
              }}
            />
          </div>
          <span className="progress-pct">
            {task.status === 'completed' ? '100%' : task.status === 'submitted' ? '80%' : task.status === 'in-progress' ? '60%' : '35%'}
          </span>
        </div>
      )}

      <div className="task-actions">
        {!isAdmin && onStatusChange && task.status !== 'completed' && task.status !== 'submitted' && (
          <div className="student-actions">
            <select
              value={task.status}
              onChange={(e) => {
                if (e.target.value === 'completed') {
                  onSubmitTask?.(task);
                } else {
                  onStatusChange(task._id, e.target.value);
                }
              }}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">✓ Submit</option>
            </select>
          </div>
        )}

        {!isAdmin && task.status === 'submitted' && (
          <span className="pending-review">⏳ Pending review</span>
        )}

        {isAdmin && (
          <div className="admin-actions">
            {task.status === 'submitted' && (
              <>
                {onApprove && <button onClick={() => onApprove(task._id)} className="btn-approve" title="Approve">✓ Approve</button>}
                {onReject && <button onClick={() => onReject(task._id)} className="btn-reject" title="Reject">✕ Reject</button>}
              </>
            )}
            {onEdit && <button onClick={() => onEdit(task)} className="btn-icon-edit" title="Edit">✏️</button>}
            {onDelete && <button onClick={() => onDelete(task)} className="btn-icon-delete" title="Delete">🗑️</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
