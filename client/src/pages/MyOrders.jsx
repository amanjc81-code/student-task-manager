import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/orders");
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load orders.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <h1>My orders</h1>
      {error && <p className="banner banner--error">{error}</p>}
      {orders.length === 0 && !error && <p className="muted">No orders yet.</p>}
      <ul className="orders-list">
        {orders.map((o) => (
          <li key={o._id} className="orders-row">
            <div>
              <strong>{new Date(o.createdAt).toLocaleDateString()}</strong>
              <p className="muted small">{o.items.length} items · {o.status}</p>
            </div>
            <div className="orders-row__total">₹{o.subtotal.toFixed(2)}</div>
            <Link to={`/orders/${o._id}`} className="btn btn--ghost btn--sm">
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
