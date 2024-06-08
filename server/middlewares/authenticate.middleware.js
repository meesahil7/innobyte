const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send({ message: "not-authorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded) {
    const userId = decoded.userId;
    req.body.userId = userId;
    next();
  } else {
    return res.status(500).send({ message: "invalid-user-action" });
  }
};

module.exports = { authenticate };
