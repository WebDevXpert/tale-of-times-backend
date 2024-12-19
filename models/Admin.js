const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required field"],
    minLength: [3, "First name should be at least of 3 characters"],
    maxLength: [20, "First name should not exceed 20 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required field"],
    minLength: [3, "Last name should be at least of 3 characters"],
    maxLength: [20, "Last name should not exceed 20 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required field"],
  },
  password: {
    type: String,
    required: [true, "Password is required field"],
    minLength: [8, "Password should be at least of 8 characters"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required field"],
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordTokenExpiry: {
    type: Date,
    default: null,
  },
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
