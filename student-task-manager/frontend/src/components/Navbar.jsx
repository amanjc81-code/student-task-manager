import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Task Manager</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-user">
              {user.name} ({user.role})
            </span>
            {user.role === 'admin' && (
              <Link to="/admin/dashboard">Admin Dashboard</Link>
            )}
            {user.role === 'student' && (
              <Link to="/student/dashboard">Dashboard</Link>
            )}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
