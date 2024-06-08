const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the database");
  } catch (err) {
    console.log({ message: "error-connecting-to-database", error: err });
  }
};

module.exports = { connectToMongoDB };
