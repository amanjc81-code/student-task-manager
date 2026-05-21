import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { authRequired, adminRequired } from "../middleware/auth.js";

const router = Router();

// Admin Route: Get all customer orders in the system
router.get("/admin/all", adminRequired, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

// Admin Route: Update status of any order
router.patch("/admin/:id/status", adminRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (e) {
    next(e);
  }
});

router.use(authRequired);

router.post("/checkout", async (req, res, next) => {
  try {
    const { customerName, phone, address, notes } = req.body;
    if (!customerName || !phone || !address) {
      return res.status(400).json({ message: "customerName, phone, and address are required" });
    }
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const lines = [];
    let subtotal = 0;
    for (const row of cart.items) {
      const p = row.product;
      if (!p) continue;
      const lineTotal = p.price * row.quantity;
      subtotal += lineTotal;
      lines.push({
        product: p._id,
        name: p.name,
        price: p.price,
        quantity: row.quantity,
      });
    }
    if (!lines.length) {
      return res.status(400).json({ message: "No valid items in cart" });
    }
    const order = await Order.create({
      user: req.userId,
      items: lines,
      subtotal,
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      notes: notes ? String(notes).trim() : "",
    });
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("items.product")
      .lean();
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order = await Order.findOne({ _id: req.params.id, user: req.userId })
      .populate("items.product")
      .lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (e) {
    next(e);
  }
});

export default router;
