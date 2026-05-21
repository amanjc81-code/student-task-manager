import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";

export default function OrderSummary() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (!cancelled) setOrder(data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Order not found.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="page">
        <p className="banner banner--error">{error}</p>
        <Link to="/orders">Back to orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page page--centered">
        <p className="muted">Loading order…</p>
      </div>
    );
  }

  const date = new Date(order.createdAt).toLocaleString();

  return (
    <div className="page order-summary">
      <p className="eyebrow">Order confirmed</p>
      <h1>Thank you, {order.customerName}</h1>
      <p className="muted">Placed on {date}</p>
      <div className="summary-card">
        <h2>Items</h2>
        <ul className="summary-lines">
          {order.items.map((line, i) => (
            <li key={i}>
              <span>
                {line.quantity}× {line.name}
              </span>
              <span>₹{(line.price * line.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="summary-total">
          <span>Total</span>
          <strong>₹{order.subtotal.toFixed(2)}</strong>
        </div>
      </div>
      <div className="summary-card">
        <h2>Pickup details</h2>
        <p>
          <strong>Phone</strong> {order.phone}
        </p>
        <p>
          <strong>Address / notes</strong> {order.address}
        </p>
        {order.notes && (
          <p>
            <strong>Requests</strong> {order.notes}
          </p>
        )}
        <p className="muted small">Status: {order.status}</p>
      </div>
      <div className="summary-actions">
        <Link to="/menu" className="btn btn--outline">
          Order again
        </Link>
        <Link to="/orders" className="btn btn--primary">
          All orders
        </Link>
      </div>
    </div>
  );
}
