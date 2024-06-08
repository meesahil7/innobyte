const { User } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { generateTokenAndSetCookie } = require("../utils/generateToken");
const { Otp } = require("../models/otp.model");
const { sendEmail } = require("../utils/helper");

const signup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, gender } = req.body;
    const user = await User.findOne({ email });

    // check if user has already a verified account
    if (user && user.isEmailVerified) {
      return res.status(400).json({ error: "user-already-exists" });
    }

    // check if user exists but email is not verified
    if (user && !user.isEmailVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpData = await Otp.find({ userId: user._id });
      if (otpData.length) {
        otpData[0].otp = otp;
        await otpData[0].save();
      } else {
        await Otp.create({ otp, userId: user._id });
      }
      sendEmail(email, otp);
      return res.status(201).json({
        message: "User is already registered",
        info: "An OTP has been sent for email verification",
        newUser: user,
      });
    }

    // register a new user
    const newUser = new User({
      fullName,
      email,
      phoneNumber,
      gender,
    });
    await newUser.save();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ otp, userId: newUser._id });
    sendEmail(email, otp);
    res.status(200).json({
      message: "User registration successful",
      info: "An OTP has been sent to your email",
      newUser,
    });
  } catch (err) {
    console.log({ message: "error-in-signup-controller", error: err.message }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // check if the userId is a valid mongoose object id
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) return res.status(404).json({ error: "user-not-found" });

    // check if the email is already verified
    const user = await User.find({ _id: id });
    if (user.isEmailVerified)
      return res.status(400).json({ message: "email-already-verified" });

    // check if otp is there in the payload
    const otpFromClient = req.body.otp;
    if (!otpFromClient) return res.send({ error: "no-otp-from-client" });

    // fetch otp data to verify with client otp
    const otpData = await Otp.findOne({ userId: id });
    if (!otpData) return res.send({ message: "user-not-found" });

    // return error for wrong otp
    if (otpData.otp !== otpFromClient)
      return res.status(400).json({ error: "invalid-otp" });
    otpData.otp = null;
    await otpData.save();
    const userData = await User.findOne({ _id: id });

    // set user account verification boolean to true
    userData.isEmailVerified = true;
    await userData.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.log({
      message: "error-in-verifyEmail-controller",
      error: err.message,
    }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

const login = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "invalid-credentials" });
    }
    const otpData = await Otp.findOne({ userId: user._id });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (!otpData) {
      await Otp.create({ otp, userId: user._id });
    } else {
      otpData.otp = otp;
      await otpData.save();
    }
    sendEmail(email, otp);
    if (!user.isEmailVerified) {
      return res.status(201).json({
        message: "Email not verified",
        info: "Check your email and verify with otp first",
        userId: user._id,
      });
    }
    res.status(200).json({
      message: "Login OTP sent",
      userId: user._id,
    });
  } catch (err) {
    console.log({ message: "error-in-login-controller", error: err.message }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { id } = req.params;

    // check if the userId is a valid mongoose object id
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) return res.status(404).json({ error: "user-not-found" });

    // check if otp is there in the payload
    const otpFromClient = req.body.otp;
    if (!otpFromClient) return res.send({ error: "no-otp-from-client" });

    // fetch otp data to verify with client otp
    const otpData = await Otp.findOne({ userId: id });
    if (!otpData) return res.send({ message: "user-not-found" });

    // return error for wrong otp
    if (otpData.otp !== otpFromClient)
      return res.status(400).json({ error: "invalid-otp" });
    otpData.otp = null; // set the otp to null
    await otpData.save();

    // generate token to authenticate the user
    const token = generateTokenAndSetCookie(id, res);
    res.status(200).json({ message: "Login successful", token: token });
  } catch (err) {
    console.log({
      message: "error-in-verifyLogin-controller",
      error: err.message,
    }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { id } = req.params;

    // check if the userId is a valid mongoose object id
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) return res.status(404).json({ error: "user-not-found" });

    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = await Otp.findOne({ userId: id });
    if (!otpData) {
      await Otp.create({ otp, userId: id });
    } else {
      otpData.otp = otp;
      await otpData.save();
    }
    sendEmail(email, otp);
    res.status(200).json({ message: "New OTP Sent" });
  } catch (err) {
    console.log({
      message: "error-in-resendOtp-controller",
      error: err.message,
    }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("innobyteJwt", "", { maxAge: 0 });
    res.status(200).json({ message: "logged-out-successfully" });
  } catch (err) {
    console.log({ message: "error-in-logout-controller", error: err.message }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

module.exports = { signup, verifyEmail, login, verifyLogin, resendOtp, logout };
