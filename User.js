const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [3, "Name must be at least 3 characters long"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  age: {
    type: Number,
    min: [0, "Age cannot be negative"],
    max: [120, "Age cannot exceed 120"],
  },
  hobbies: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    trim: true,
  },
  userId: {
    type: String,
    unique: true,
    default: () => uuidv4(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ─── INDEXES ─────────────────────────────────────────────────────────────────

// 1. Single field index on name
userSchema.index({ name: 1 });

// 2. Compound index on email and age
userSchema.index({ email: 1, age: 1 });

// 3. Multikey index on hobbies (MongoDB auto-creates multikey for arrays)
userSchema.index({ hobbies: 1 });

// 4. Text index on bio
userSchema.index({ bio: "text" });

// 5. Hashed index on userId
userSchema.index({ userId: "hashed" });

// 6. TTL index on createdAt — expires documents after 1 year (31,536,000 seconds)
//    Change expireAfterSeconds as needed (e.g., 60 for 1-minute demo)
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const User = mongoose.model("User", userSchema);

module.exports = User;
