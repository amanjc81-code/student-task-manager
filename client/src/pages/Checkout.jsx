import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

export default function Checkout() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/orders/checkout", {
        customerName,
        phone,
        address,
        notes,
      });
      navigate(`/orders/${data._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow checkout-page">
      <h1>Checkout</h1>
      <p className="muted">Pickup details—we will confirm timing by phone.</p>
      <form className="form-card" onSubmit={onSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>Name for the order</span>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label className="field">
          <span>Pickup address / notes</span>
          <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required />
        </label>
        <label className="field">
          <span>Special requests (optional)</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
