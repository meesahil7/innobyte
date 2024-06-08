const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "a valid email address is required"],
      validate: [validator.isEmail, "please provide a valid email"],
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      validate: [
        validator.isMobilePhone,
        "Please Provide a valid phone number",
      ],
      required: true,
    },
    gender: {
      type: String,
      enaum: ["Male", "Female"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
