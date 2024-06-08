const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const otpSchema = new Schema({
  otp: {
    type: String,
    default: null,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Otp = model("Otp", otpSchema);

module.exports = { Otp };
