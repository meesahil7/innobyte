const express = require("express");
const cors = require("cors");
const { authRouter } = require("./routes/auth.route");
const { connectToMongoDB } = require("./config/db.config");
const dotenv = require("dotenv");
const { userRouter } = require("./routes/user.route");

const app = express();
dotenv.config();
app.use(cors({ origin: "*" }));
app.use(express.json()); // to parse the incoming requests with JSON payload

const PORT = process.env.PORT || 8080;

app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`The server is listening 🚀 on port ${PORT}...`);
});
