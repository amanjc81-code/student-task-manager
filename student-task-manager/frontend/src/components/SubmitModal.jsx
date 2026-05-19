import { useState } from 'react';

const SubmitModal = ({ open, onClose, onSubmit, task }) => {
  const [githubLink, setGithubLink] = useState('');
  const [deployedLink, setDeployedLink] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['zip', 'rar', '7z'].includes(ext)) {
        alert('Only .zip, .rar, .7z files allowed');
        e.target.value = '';
        return;
      }
      if (selected.size > 50 * 1024 * 1024) {
        alert('File too large (max 50MB)');
        e.target.value = '';
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubLink && !deployedLink && !file) {
      alert('Add at least a link or a file');
      return;
    }
    setUploading(true);
    try {
      await onSubmit(task._id, { githubLink, deployedLink, file });
      setGithubLink('');
      setDeployedLink('');
      setFile(null);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content submit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submit Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="submit-info">Submit your completed work for: <strong>{task?.title}</strong></p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>GitHub Repository Link</label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div className="form-group">
              <label>Deployed Project Link</label>
              <input
                type="url"
                value={deployedLink}
                onChange={(e) => setDeployedLink(e.target.value)}
                placeholder="https://your-project.vercel.app"
              />
            </div>
            <div className="form-group">
              <label>Upload ZIP / RAR / 7z (max 50MB)</label>
              <div className="file-input-wrapper">
                <input type="file" accept=".zip,.rar,.7z" onChange={handleFileChange} className="file-input" />
                {file && <span className="file-name">{file.name}</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-gold" disabled={uploading}>
                {uploading ? 'Submitting...' : 'Submit Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
