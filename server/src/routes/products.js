import { Router } from "express";
import Product from "../models/Product.js";
import { adminRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ category: 1, name: 1 }).lean();
    res.json(products);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: "Item not found" });
    res.json(p);
  } catch (e) {
    next(e);
  }
});

// Admin Route: Add new product
router.post("/", adminRequired, async (req, res, next) => {
  try {
    const { name, description, price, category, isVeg, imageUrl } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }
    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category,
      isVeg: !!isVeg,
      imageUrl: imageUrl || "",
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (e) {
    next(e);
  }
});

// Admin Route: Update product
router.put("/:id", adminRequired, async (req, res, next) => {
  try {
    const { name, description, price, category, isVeg, imageUrl } = req.body;
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Item not found" });

    if (name !== undefined) p.name = name;
    if (description !== undefined) p.description = description;
    if (price !== undefined) p.price = Number(price);
    if (category !== undefined) p.category = category;
    if (isVeg !== undefined) p.isVeg = !!isVeg;
    if (imageUrl !== undefined) p.imageUrl = imageUrl;

    await p.save();
    res.json(p);
  } catch (e) {
    next(e);
  }
});

// Admin Route: Delete product
router.delete("/:id", adminRequired, async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Item not found" });
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: "Item deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
