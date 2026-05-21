import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

function lineTotal(item) {
  const p = item.product;
  if (!p) return 0;
  return p.price * item.quantity;
}

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setError("");
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load cart.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(productId, quantity) {
    setBusyId(productId);
    try {
      const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
      setCart(data);
    } catch (e) {
      setError(e.response?.data?.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(productId) {
    setBusyId(productId);
    try {
      const { data } = await api.delete(`/cart/items/${productId}`);
      setCart(data);
    } catch (e) {
      setError(e.response?.data?.message || "Remove failed.");
    } finally {
      setBusyId(null);
    }
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, row) => sum + lineTotal(row), 0);

  return (
    <div className="page cart-page">
      <h1>Your cart</h1>
      {error && <p className="banner banner--error">{error}</p>}
      {!cart && <p className="muted">Loading cart…</p>}
      {cart && items.length === 0 && (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/menu" className="btn btn--primary">
            Browse the menu
          </Link>
        </div>
      )}
      {items.length > 0 && (
        <>
          <ul className="cart-list">
            {items.map((row) => {
              const p = row.product;
              if (!p) return null;
              const id = p._id;
              return (
                <li key={id} className="cart-row">
                  <div>
                    <strong>{p.name}</strong>
                    <p className="muted small">₹{p.price.toFixed(2)} each</p>
                  </div>
                  <div className="cart-row__qty">
                    <button
                      type="button"
                      className="qty-btn"
                      disabled={busyId === id || row.quantity <= 1}
                      onClick={() => updateQty(id, row.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{row.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      disabled={busyId === id}
                      onClick={() => updateQty(id, row.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-row__total">₹{lineTotal(row).toFixed(2)}</div>
                  <button type="button" className="btn btn--ghost btn--sm" disabled={busyId === id} onClick={() => remove(id)}>
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="cart-summary">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="btn btn--primary btn--lg btn--block">
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
