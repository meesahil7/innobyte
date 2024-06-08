const mongoose = require("mongoose");
const { User } = require("../models/user.model");

const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    // check if the userId is a valid mongoose object id
    const isValidId = mongoose.isValidObjectId(userId);
    if (!isValidId) return res.status(404).json({ error: "user-not-found" });

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ error: "user-not-found" });
    res.status(200).json({
      message: "user-found",
      user,
    });
  } catch (err) {
    console.log({
      message: "error-in-getUserData-controller",
      error: err.message,
    }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

const updateUserData = async (req, res) => {
  try {
    const { userId, fullName, phoneNumber, gender } = req.body;

    // check if the userId is a valid mongoose object id
    const isValidId = mongoose.isValidObjectId(userId);
    if (!isValidId) return res.status(404).json({ error: "user-not-found" });

    if (!fullName && !phoneNumber && !gender)
      return res.status(404).json({ error: "no-payload" });

    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.log({
      message: "error-in-updateUserData-controller",
      error: err.message,
    }),
      res.status(500).json({ error: "internal-server-error" });
  }
};

module.exports = { getUserData, updateUserData };
