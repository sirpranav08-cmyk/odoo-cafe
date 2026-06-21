require("dotenv").config();

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const { router: authRouter } = require("./routes/auth");
const productRouter           = require("./routes/products");
const dataRouter              = require("./routes/data");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend from ../frontend/
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRouter);
app.use("/api/products", productRouter);
app.use("/api/data",     dataRouter);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

// Catch-all: serve the SPA
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api"))
    res.sendFile(path.join(__dirname, "../frontend/homepage.html"));
});

// ── MongoDB Atlas ─────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅  MongoDB Atlas connected");
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀  Server running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });