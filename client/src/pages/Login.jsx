import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login(email, password);
      navigate("/menu", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <h1>Welcome back</h1>
      <p className="muted">Sign in to continue your order.</p>
      <form className="form-card" onSubmit={onSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </button>
        <p className="form-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
