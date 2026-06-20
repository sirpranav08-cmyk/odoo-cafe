const express  = require("express");
const Product  = require("../models/Product");
const { authenticate } = require("./auth");

const router = express.Router();

// All product routes require a valid JWT
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch { res.status(500).json({ message: "Server error." }); }
});

router.post("/", async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: "Product not found." });
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Deleted." });
  } catch { res.status(500).json({ message: "Server error." }); }
});

module.exports = router;
