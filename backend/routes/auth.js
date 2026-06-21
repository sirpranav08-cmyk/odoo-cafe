const express  = require("express");
const crypto   = require("crypto");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const makeOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const exists = await User.findOne({ email });
    if (exists && exists.isEmailVerified)
      return res.status(409).json({ message: "Email already registered." });

    const otp       = makeOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (exists && !exists.isEmailVerified) {
      exists.verifyToken       = otp;
      exists.verifyTokenExpiry = otpExpiry;
      await exists.save();
    } else {
      await User.create({
        name, email, password,
        role: role || "admin",
        status: "inactive",
        isEmailVerified: false,
        verifyToken: otp,
        verifyTokenExpiry: otpExpiry,
      });
    }

    res.status(201).json({ message: "OTP generated", otp, name, email });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required." });

    const user = await User.findOne({ email });
    if (!user)       return res.status(404).json({ message: "Account not found." });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified." });
    if (user.verifyToken !== otp) return res.status(400).json({ message: "Invalid OTP." });
    if (new Date() > user.verifyTokenExpiry)
      return res.status(400).json({ message: "OTP has expired. Please sign up again." });

    user.isEmailVerified   = true;
    user.status            = "active";
    user.verifyToken       = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({
      message: "Email verified! Welcome to Odoo Cafe.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)            return res.status(404).json({ message: "No account with that email." });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email is already verified." });

    const otp       = makeOTP();
    user.verifyToken       = otp;
    user.verifyTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res.json({ message: "OTP regenerated", otp, name: user.name, email });
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
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const ok = await user.comparePassword(password);
    if (!ok)   return res.status(401).json({ message: "Invalid credentials." });

    if (!user.isEmailVerified)
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });

    if (user.status !== "active")
      return res.status(403).json({ message: "Account is inactive. Contact admin." });

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ── POST /api/auth/forgot-password — generate OTP ────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    // Always return same message to avoid user enumeration
    if (!user || !user.isEmailVerified)
      return res.json({ message: "OTP sent", sent: false });

    const otp       = makeOTP();
    user.resetToken       = otp;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    res.json({ message: "OTP sent", otp, name: user.name, email, sent: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/auth/verify-reset-otp ──────────────────────────────────────────
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user)                       return res.status(404).json({ message: "Account not found." });
    if (user.resetToken !== otp)     return res.status(400).json({ message: "Invalid OTP." });
    if (new Date() > user.resetTokenExpiry)
      return res.status(400).json({ message: "OTP has expired. Request a new one." });

    res.json({ message: "OTP verified", email });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password)
      return res.status(400).json({ message: "All fields are required." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({ email });
    if (!user)                       return res.status(404).json({ message: "Account not found." });
    if (user.resetToken !== otp)     return res.status(400).json({ message: "Invalid OTP." });
    if (new Date() > user.resetTokenExpiry)
      return res.status(400).json({ message: "OTP has expired. Request a new one." });

    user.password          = password; // pre-save hook hashes it
    user.resetToken        = undefined;
    user.resetTokenExpiry  = undefined;
    await user.save();

    res.json({ message: "Password reset successfully! You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  const user = await User.findById(req.userId).select("-password -verifyToken -resetToken");
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json(user);
});

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

module.exports = { router, authenticate };