import { Router } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.use(authRequired);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate("items.product");
  }
  return cart;
}

router.get("/", async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const qty = Math.max(1, Number(quantity) || 1);
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }
    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx >= 0) {
      cart.items[idx].quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

router.patch("/items/:productId", async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const q = Number(quantity);
    if (!Number.isFinite(q) || q < 1) {
      return res.status(400).json({ message: "quantity must be a number >= 1" });
    }
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }
    item.quantity = q;
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

router.delete("/items/:productId", async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });
    const cart = await getOrCreateCart(req.userId);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

export default router;
