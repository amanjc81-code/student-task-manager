import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
        <h2 className="auth-title">403 — Access Denied</h2>
        <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
          You don't have permission to view this page.
        </p>
        {user ? (
          <Link
            to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
            className="auth-submit"
            style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center', width: 'auto', padding: '0.75rem 2rem' }}
          >
            Back to Dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            className="auth-submit"
            style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center', width: 'auto', padding: '0.75rem 2rem' }}
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Unauthorized;
