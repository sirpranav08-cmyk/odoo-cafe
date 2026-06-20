const express  = require("express");
const Product  = require("../Product");
const Category = require("../models/Category");
const Order    = require("../models/Order");
const Counter  = require("../models/Counter");
const { authenticate } = require("./auth");

const router = express.Router();
router.use(authenticate);

// ── SEED default data if DB is empty ─────────────────────────────────────────
router.post("/seed", async (req, res) => {
  try {
    const catCount = await Category.countDocuments();
    if (catCount > 0) return res.json({ message: "Already seeded" });

    const cats = await Category.insertMany([
      { name: "Beverages", color: "#4A90D9" },
      { name: "Chaat",     color: "#E8A020" },
      { name: "Meals",     color: "#D94F3D" },
      { name: "Dessert",   color: "#9B59B6" },
    ]);
    const [bev, chaat, meals, dessert] = cats;

    await Product.insertMany([
      { name:"Masala Tea",  category:bev._id,    price:40,  tax:5, uom:"piece", desc:"Spiced Indian tea",     emoji:"🍵" },
      { name:"Coffee",      category:bev._id,    price:60,  tax:5, uom:"piece", desc:"Freshly brewed",        emoji:"☕" },
      { name:"Lassi",       category:bev._id,    price:80,  tax:5, uom:"piece", desc:"Sweet yogurt drink",    emoji:"🥛" },
      { name:"Lemonade",    category:bev._id,    price:50,  tax:5, uom:"piece", desc:"Fresh squeeze",         emoji:"🍋" },
      { name:"Samosa",      category:chaat._id,  price:30,  tax:5, uom:"piece", desc:"Crispy fried pastry",   emoji:"🥟" },
      { name:"Pav Bhaji",   category:chaat._id,  price:90,  tax:5, uom:"piece", desc:"Spiced mashed veggies", emoji:"🍛" },
      { name:"Bhel Puri",   category:chaat._id,  price:60,  tax:5, uom:"piece", desc:"Crispy puffed rice",    emoji:"🍿" },
      { name:"Vada Pav",    category:chaat._id,  price:35,  tax:5, uom:"piece", desc:"Mumbai street burger",  emoji:"🍔" },
      { name:"Cheese Burger",category:meals._id, price:150, tax:5, uom:"piece", desc:"Grilled with cheese",   emoji:"🍔" },
      { name:"Pizza",       category:meals._id,  price:250, tax:5, uom:"piece", desc:"Stone baked",           emoji:"🍕" },
      { name:"Maggie",      category:meals._id,  price:70,  tax:5, uom:"piece", desc:"Spiced noodles",        emoji:"🍜" },
      { name:"Fries",       category:meals._id,  price:120, tax:5, uom:"piece", desc:"Golden crispy",         emoji:"🍟" },
      { name:"Gulab Jamun", category:dessert._id,price:60,  tax:5, uom:"piece", desc:"Syrup soaked sweets",   emoji:"🍮" },
      { name:"Ice Cream",   category:dessert._id,price:80,  tax:5, uom:"piece", desc:"Vanilla scoop",         emoji:"🍨" },
      { name:"Brownie",     category:dessert._id,price:100, tax:5, uom:"piece", desc:"Warm chocolate",        emoji:"🍫" },
      { name:"Jalebi",      category:dessert._id,price:50,  tax:5, uom:"piece", desc:"Crispy & sweet",        emoji:"🍩" },
    ]);

    res.json({ message: "Seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ message: "Seed failed" });
  }
});

// ── BOOTSTRAP — load everything the frontend needs in one call ────────────────
router.get("/bootstrap", async (req, res) => {
  try {
    const [categories, products, orders] = await Promise.all([
      Category.find().sort({ name: 1 }),
      Product.find().populate("category").sort({ name: 1 }),
      Order.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(200),
    ]);
    res.json({ categories, products, orders });
  } catch (err) {
    console.error("Bootstrap error:", err);
    res.status(500).json({ message: "Failed to load data" });
  }
});

// ── CATEGORIES ────────────────────────────────────────────────────────────────
router.get("/categories", async (req, res) => {
  res.json(await Category.find().sort({ name: 1 }));
});
router.post("/categories", async (req, res) => {
  try { res.status(201).json(await Category.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});
router.put("/categories/:id", async (req, res) => {
  try {
    const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: "Not found" });
    res.json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.delete("/categories/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
router.get("/products", async (req, res) => {
  res.json(await Product.find().populate("category").sort({ name: 1 }));
});
router.post("/products", async (req, res) => {
  try { res.status(201).json(await (await Product.create(req.body)).populate("category")); }
  catch (e) { res.status(400).json({ message: e.message }); }
});
router.put("/products/:id", async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("category");
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ── ORDERS ────────────────────────────────────────────────────────────────────
router.get("/orders", async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(200);
  res.json(orders);
});
router.post("/orders", async (req, res) => {
  try {
    const num = await Counter.next("orderNum");
    const order = await Order.create({ ...req.body, userId: req.userId, num });
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put("/orders/:id", async (req, res) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!o) return res.status(404).json({ message: "Not found" });
    res.json(o);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;