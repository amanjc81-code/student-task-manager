import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const categoryOrder = [
  "Beverages",
  "Starters",
  "Main Course",
  "Roties & Extras",
  "Desserts"
];

export default function Menu() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(null);
  const [toast, setToast] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/products");
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load menu.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = products.reduce((acc, p) => {
    const c = p.category || "Other";
    if (!acc[c]) acc[c] = [];
    acc[c].push(p);
    return acc;
  }, {});

  const orderedCategories = Object.keys(grouped).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  async function addToCart(productId) {
    if (!user) {
      setToast("Please log in to add items to your cart.");
      return;
    }
    setAdding(productId);
    setToast("");
    try {
      await api.post("/cart/items", { productId, quantity: 1 });
      setToast("Added to cart.");
    } catch (e) {
      setToast(e.response?.data?.message || "Could not add to cart.");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="page menu-page">
      <header className="page-header">
        <h1>The menu</h1>
        <p className="muted">Ingredients change with the season; the standard never does.</p>
        {!user && (
          <p className="hint">
            <Link to="/login">Log in</Link> or <Link to="/register">register</Link> to build a cart and checkout.
          </p>
        )}
      </header>
      {error && <p className="banner banner--error">{error}</p>}
      {toast && <p className="banner banner--ok">{toast}</p>}

      {/* Floating Veg / Non-Veg Filter Toggle */}
      <div className="menu-filter-container">
        <div className="menu-filter-floating">
          <button
            type="button"
            className={`filter-btn ${filterType === "all" ? "filter-btn--active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-btn filter-btn--veg ${filterType === "veg" ? "filter-btn--active" : ""}`}
            onClick={() => setFilterType("veg")}
          >
            🟢 Veg
          </button>
          <button
            type="button"
            className={`filter-btn filter-btn--nonveg ${filterType === "non-veg" ? "filter-btn--active" : ""}`}
            onClick={() => setFilterType("non-veg")}
          >
            🔴 Non-Veg
          </button>
        </div>
      </div>

      {orderedCategories.map((category) => {
        const items = grouped[category] || [];

        // Filter individual items inside this category
        const filteredItems = items.filter((item) => {
          if (item.category === "Beverages" || item.category === "Roties & Extras") return true; // Keep beverages, rotis, rice, and papad always accessible
          if (filterType === "veg") return item.isVeg === true;
          if (filterType === "non-veg") return item.isVeg === false;
          return true;
        });

        // Hide category section entirely if it contains zero matching items
        if (filteredItems.length === 0) return null;

        return (
          <section key={category} className="menu-section">
            <h2 className="menu-section__title">{category}</h2>
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <article key={item._id} className="menu-card">
                  <div
                    className="menu-card__image"
                    style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }}
                  />
                  <div className="menu-card__body">
                    <h3>
                      <span className={`diet-badge ${item.isVeg ? "diet-badge--veg" : "diet-badge--nonveg"}`} style={{ marginRight: "0.5rem", fontSize: "0.9rem", verticalAlign: "middle" }}>
                        {item.isVeg ? "🟢" : "🔴"}
                      </span>
                      {item.name}
                    </h3>
                    <p className="menu-card__desc">{item.description}</p>
                    <div className="menu-card__footer">
                      <span className="price">₹{item.price.toFixed(2)}</span>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={adding === item._id}
                        onClick={() => addToCart(item._id)}
                      >
                        {adding === item._id ? "Adding…" : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
