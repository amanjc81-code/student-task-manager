import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand__mark">LM</span>
          <span className="brand__text">
            La Maison
            <small>Contemporary dining</small>
          </span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}>
            Menu
          </NavLink>
          {user && (
            <>
              <NavLink to="/cart" className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}>
                Cart
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
              >
                My orders
              </NavLink>
            </>
          )}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <span className="user-pill">{user.name}</span>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn--primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>La Maison · Reservations welcome · Open Tue–Sun</p>
      </footer>
    </div>
  );
}
