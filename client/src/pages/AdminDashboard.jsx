import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, refresh } = useAuth();
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Product form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding new product
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Beverages",
    isVeg: true,
    imageUrl: "",
  });

  // Fetch initial data
  useEffect(() => {
    if (!user || !user.isAdmin) return;
    loadProducts();
    loadOrders();
  }, [user]);

  async function handlePromote() {
    setError("");
    setSuccess("");
    setPromoting(true);
    try {
      await api.post("/auth/promote-me");
      await refresh();
      setSuccess("Account upgraded to Administrator successfully!");
    } catch (err) {
      setError("Failed to upgrade account. Please try again.");
    } finally {
      setPromoting(false);
    }
  }

  // Protect route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return (
      <div className="page page--centered admin-access-denied">
        <div className="access-card glassmorphism" style={{ padding: "2.5rem", maxWidth: "450px", textAlign: "center" }}>
          <div className="access-card__icon" style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔑</div>
          <h2>Admin Access Required</h2>
          {error && <p className="banner banner--error" style={{ margin: "1rem 0" }}>{error}</p>}
          <p className="muted" style={{ margin: "1rem 0", lineHeight: "1.5" }}>
            The account <strong>{user.email}</strong> is registered as a regular customer.
          </p>
          <div className="access-card__actions" style={{ marginTop: "1.75rem" }}>
            <button 
              className="btn btn--primary btn--block" 
              onClick={handlePromote}
              disabled={promoting}
            >
              {promoting ? "Upgrading account..." : "Upgrade to Admin (Bypass)"}
            </button>
            <p className="muted small" style={{ marginTop: "1rem", fontSize: "0.8rem", lineHeight: "1.4" }}>
              Click this developer bypass button to instantly elevate your account to Administrator inside MongoDB Atlas!
            </p>
          </div>
        </div>
      </div>
    );
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const { data } = await api.post("/upload", {
          filename: file.name,
          base64Data,
        });
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        setSuccess("Image file uploaded successfully!");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to upload local image.");
      } finally {
        setUploadingFile(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read local file.");
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  }

  async function loadProducts() {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (e) {
      setError("Failed to load products.");
    }
  }

  async function loadOrders() {
    try {
      const { data } = await api.get("/orders/admin/all");
      setOrders(data);
    } catch (e) {
      setError("Failed to load orders.");
    }
  }

  // Open modal for adding
  function handleAddClick() {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Beverages",
      isVeg: true,
      imageUrl: "",
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // Open modal for editing
  function handleEditClick(product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      isVeg: product.isVeg,
      imageUrl: product.imageUrl || "",
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // Handle product save (create or update)
  async function handleSaveProduct(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.price || !formData.category) {
      setError("Name, price, and category are required.");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
    };

    try {
      if (editingProduct) {
        // Update product
        await api.put(`/products/${editingProduct._id}`, payload);
        setSuccess(`Successfully updated "${formData.name}"`);
      } else {
        // Create product
        await api.post("/products", payload);
        setSuccess(`Successfully added "${formData.name}"`);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    }
  }

  // Delete product
  async function handleDeleteProduct(id, name) {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/products/${id}`);
      setSuccess(`Successfully removed "${name}"`);
      loadProducts();
    } catch (err) {
      setError("Failed to delete product.");
    }
  }

  // Update order status
  async function handleStatusChange(orderId, newStatus) {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      setSuccess("Order status updated successfully!");
      loadOrders();
    } catch (err) {
      setError("Failed to update order status.");
    }
  }

  return (
    <div className="page admin-dashboard">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Control Center</span>
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-tabs">
          <button
            className={`btn ${activeTab === "products" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("products")}
          >
            Manage Menu
          </button>
          <button
            className={`btn ${activeTab === "orders" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("orders")}
          >
            Manage Orders ({orders.length})
          </button>
        </div>
      </div>

      {error && <p className="banner banner--error">{error}</p>}
      {success && <p className="banner banner--success">{success}</p>}

      {/* 1. Products Management View */}
      {activeTab === "products" && (
        <div className="admin-content">
          <div className="admin-actions">
            <h2>Menu List ({products.length} Items)</h2>
            <button className="btn btn--primary" onClick={handleAddClick}>
              + Add New Item
            </button>
          </div>

          {["Beverages", "Starters", "Main Course", "Roties & Extras", "Desserts"].map((category) => {
            const catProducts = products.filter((p) => p.category === category);
            if (catProducts.length === 0) return null;
            return (
              <div key={category} style={{ marginBottom: "2.5rem" }}>
                <h3
                  className="menu-section__title"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    color: "var(--accent)",
                    borderLeft: "4px solid var(--accent)",
                    paddingLeft: "0.75rem",
                    marginBottom: "1rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {category} ({catProducts.length} Items)
                </h3>
                <div className="admin-table-wrapper" style={{ marginBottom: "1.5rem" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Diet</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catProducts.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="admin-table__item">
                              <div
                                className="admin-table__img"
                                style={{ backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined }}
                              />
                              <div>
                                <strong>{p.name}</strong>
                                <p className="muted small text-ellipsis" style={{ maxWidth: "250px" }}>
                                  {p.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${p.isVeg ? "badge--veg" : "badge--nonveg"}`}>
                              {p.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                            </span>
                          </td>
                          <td>
                            <strong>₹{p.price}</strong>
                          </td>
                          <td>
                            <div className="admin-table__actions">
                              <button className="btn btn--secondary btn--sm" onClick={() => handleEditClick(p)}>
                                Edit
                              </button>
                              <button
                                className="btn btn--ghost btn--sm"
                                style={{ color: "#e05e5e" }}
                                onClick={() => handleDeleteProduct(p._id, p.name)}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Orders Management View */}
      {activeTab === "orders" && (
        <div className="admin-content">
          <h2>Customer Orders ({orders.length})</h2>
          <div className="admin-orders-list">
            {orders.length === 0 ? (
              <p className="muted">No orders found in the system.</p>
            ) : (
              orders.map((o) => (
                <div key={o._id} className="admin-order-card">
                  <div className="admin-order-card__header">
                    <div>
                      <strong>Order #{o._id.substring(o._id.length - 6).toUpperCase()}</strong>
                      <p className="muted small">Placed on {new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="admin-order-card__status">
                      <label className="muted small" style={{ marginRight: "0.5rem" }}>
                        Status:
                      </label>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className="admin-select"
                      >
                        <option value="Pending">Pending ⏳</option>
                        <option value="Preparing">Preparing 🍳</option>
                        <option value="Ready">Ready 🥡</option>
                        <option value="Delivered">Delivered ✅</option>
                        <option value="Cancelled">Cancelled ❌</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-order-card__details">
                    <p>
                      <strong>Customer:</strong> {o.customerName} (📞 {o.phone})
                    </p>
                    <p>
                      <strong>Address:</strong> {o.address}
                    </p>
                    {o.notes && (
                      <p className="admin-order-card__notes">
                        <strong>Instructions:</strong> {o.notes}
                      </p>
                    )}
                  </div>

                  <div className="admin-order-card__items">
                    <h4>Items Ordered</h4>
                    <ul>
                      {o.items.map((line, idx) => (
                        <li key={idx}>
                          <span>
                            {line.quantity}× {line.name}
                          </span>
                          <span className="muted">₹{line.price} each</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="admin-order-card__footer">
                    <span>Total Amount</span>
                    <strong>₹{o.subtotal.toFixed(2)}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content glassmorphism">
            <h2>{editingProduct ? "Edit Menu Item" : "Add New Menu Item"}</h2>
            <form onSubmit={handleSaveProduct} className="admin-form">
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garlic Naan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 90"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Beverages">Beverages</option>
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Roties & Extras">Roties & Extras</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  />
                  <span>Vegetarian Item (Green Indicator)</span>
                </label>
              </div>

              <div className="form-group">
                <label>Item Image</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* File Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      id="menu-item-image-file"
                    />
                    <label
                      htmlFor="menu-item-image-file"
                      className="btn btn--secondary btn--sm"
                      style={{ cursor: "pointer", margin: 0, padding: "0.5rem 1rem", border: "1px dashed rgba(201, 162, 39, 0.3)" }}
                    >
                      📁 {uploadingFile ? "Uploading File..." : "Choose Image from Folder"}
                    </label>
                    {uploadingFile && <span className="muted small">Uploading...</span>}
                  </div>

                  <span className="muted small" style={{ textAlign: "center", display: "block" }}>— OR —</span>

                  {/* Text URL Input */}
                  <div>
                    <label className="muted small" style={{ marginBottom: "0.25rem", display: "block" }}>Paste Image URL Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </div>

                  {/* Thumbnail Preview */}
                  {formData.imageUrl && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.02)", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "4px",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundImage: `url(${formData.imageUrl})`
                        }}
                      />
                      <span className="muted small text-ellipsis" style={{ maxWidth: "250px" }}>
                        Preview: {formData.imageUrl}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe the dish, ingredients, serving sizes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingProduct ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
