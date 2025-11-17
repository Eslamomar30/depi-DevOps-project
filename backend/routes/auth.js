const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Find admin in DynamoDB
    const admin = await Admin.findOne(username);
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Compare passwords
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT token
    const payload = {
      id: admin.username, // Using username as ID since DynamoDB doesn't have _id
      username: admin.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  // Validate request body
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    // 1. Get admin from DynamoDB
    const admin = await Admin.findOne(req.admin.username);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 3. Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Admin.updatePassword(req.admin.username, hashedPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
