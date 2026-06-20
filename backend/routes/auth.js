const express  = require("express");
const crypto   = require("crypto");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/mailer");

const router = express.Router();

// ── helpers ───────────────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const makeToken = () => crypto.randomBytes(32).toString("hex");

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required." });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already registered." });

    const verifyToken       = makeToken();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const user = await User.create({
      name, email, password,
      role: role || "admin",
      status: "inactive",       // inactive until verified
      isEmailVerified: false,
      verifyToken, verifyTokenExpiry,
    });

    await sendVerificationEmail(email, name, verifyToken);

    res.status(201).json({
      message: "Account created! Please check your email to verify your account before logging in.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// ── GET /api/auth/verify-email?token=... ─────────────────────────────────────
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).send(htmlMsg("Missing token.", false));

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).send(htmlMsg("Verification link is invalid or has expired.", false));

    user.isEmailVerified   = true;
    user.status            = "active";
    user.verifyToken       = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.send(htmlMsg(`Email verified! Welcome, ${user.name}. You can now log in.`, true));
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).send(htmlMsg("Server error.", false));
  }
});

// ── POST /api/auth/resend-verification ───────────────────────────────────────
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "No account with that email." });

    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email is already verified." });

    user.verifyToken       = makeToken();
    user.verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, user.name, user.verifyToken);
    res.json({ message: "Verification email resent." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials." });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res.status(401).json({ message: "Invalid credentials." });

    if (!user.isEmailVerified)
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });

    if (user.status !== "active")
      return res.status(403).json({ message: "Account is inactive. Contact admin." });

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way to avoid user enumeration
    if (!user)
      return res.json({ message: "If that email exists, a reset link has been sent." });

    user.resetToken       = makeToken();
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 h
    await user.save();

    await sendPasswordResetEmail(email, user.name, user.resetToken);
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "Token and new password are required." });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Reset link is invalid or has expired." });

    user.password          = password; // pre-save hook will hash it
    user.resetToken        = undefined;
    user.resetTokenExpiry  = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/auth/me (protected) ─────────────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  const user = await User.findById(req.userId).select("-password -verifyToken -resetToken");
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json(user);
});

// ── Middleware: authenticate JWT ──────────────────────────────────────────────
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided." });

  try {
    const payload = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ── HTML helper for browser-rendered responses ────────────────────────────────
function htmlMsg(msg, success) {
  const color = success ? "#5BA46A" : "#D94F3D";
  const icon  = success ? "✅" : "❌";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Odoo Cafe</title>
  <style>body{font-family:sans-serif;background:#12100D;color:#F5EDD8;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  .card{background:#1E1A14;border:1px solid rgba(232,160,32,.15);border-radius:16px;padding:40px;max-width:420px;text-align:center}
  h1{color:#E8A020;font-size:22px;margin-bottom:4px}p{color:#B0A080;font-size:13px}
  .msg{font-size:16px;margin:20px 0;color:${color}} a{color:#E8A020}</style></head>
  <body><div class="card"><h1>Odoo <em>Cafe</em></h1><p>Restaurant Point of Sale</p>
  <div class="msg">${icon} ${msg}</div>
  <a href="/">← Back to app</a></div></body></html>`;
}

module.exports = { router, authenticate };
