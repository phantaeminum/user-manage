const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ─── CREATE USER ─────────────────────────────────────────────────────────────
// POST /api/users
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── GET ALL USERS (with filtering, sorting, pagination) ─────────────────────
// GET /api/users?name=&email=&age=&hobby=&page=&limit=&sortBy=&order=
router.get("/", async (req, res) => {
  try {
    const {
      name,
      email,
      age,
      minAge,
      maxAge,
      hobby,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    // Filter by name (case-insensitive partial match)
    if (name) filter.name = { $regex: name, $options: "i" };

    // Filter by email (case-insensitive exact match)
    if (email) filter.email = { $regex: email, $options: "i" };

    // Filter by exact age or age range
    if (age) {
      filter.age = Number(age);
    } else if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    // Filter by hobby (multikey index query)
    if (hobby) filter.hobbies = { $in: [hobby] };

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET SINGLE USER ─────────────────────────────────────────────────────────
// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── TEXT SEARCH ON BIO ───────────────────────────────────────────────────────
// GET /api/users/search/bio?q=keyword
router.get("/search/bio", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query (q) is required" });
    }
    const users = await User.find({ $text: { $search: q } }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── SEARCH BY HOBBIES ───────────────────────────────────────────────────────
// GET /api/users/search/hobbies?hobbies=reading,coding
router.get("/search/hobbies", async (req, res) => {
  try {
    const { hobbies } = req.query;
    if (!hobbies) {
      return res.status(400).json({ success: false, message: "hobbies query parameter is required" });
    }
    const hobbiesArray = hobbies.split(",").map((h) => h.trim());
    const users = await User.find({ hobbies: { $in: hobbiesArray } });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── UPDATE USER ─────────────────────────────────────────────────────────────
// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User updated successfully", data: user });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── DELETE USER ─────────────────────────────────────────────────────────────
// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
