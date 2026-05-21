import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/menu" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password, isAdmin);
      navigate("/menu", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <h1>Join La Maison</h1>
      <p className="muted">One account for cart, checkout, and order history.</p>
      <form className="form-card" onSubmit={onSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>Full name</span>
          <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        
        <label className="checkbox-label" style={{ marginTop: '0.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          <span className="muted small">Register as Administrator (Control Center access)</span>
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "Creating account…" : "Register"}
        </button>
        <p className="form-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
