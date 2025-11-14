const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );
};

// ===============================================================
// REGISTER
// ===============================================================
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name too short"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }),
    body("phone").matches(/^[0-9]{10}$/),
    body("role")
      .optional()
      .isIn(["citizen", "admin"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, email, password, phone, address, role } = req.body;

      // Check duplicate email
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Create User
      const user = await User.create({
        name,
        email,
        password,
        phone,
        address,
        role: role || "citizen", // ← FIXED ROLE
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ===============================================================
// LOGIN
// ===============================================================
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account disabled",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ===============================================================
// VERIFY TOKEN
// ===============================================================
router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");

    const user = await User.findById(decoded.userId);

    if (!user)
      return res.status(401).json({ success: false, message: "Invalid token" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: "Token invalid" });
  }
});

// ===============================================================
// GET CURRENT USER PROFILE
// ===============================================================
router.get("/me", auth, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ===============================================================
// UPDATE PROFILE
// ===============================================================
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });

    res.json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

module.exports = router;
