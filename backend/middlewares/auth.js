const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Import your DynamoDB Admin model

module.exports = async function (req, res, next) {
  try {
    // 1. Get token from header
    const header = req.header("Authorization");
    if (!header) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // 2. Extract token (handle "Bearer" or direct token)
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Verify admin exists in DynamoDB (added security)
    const admin = await Admin.findOne(decoded.username);
    if (!admin) {
      return res
        .status(401)
        .json({ message: "Admin not found - invalid token" });
    }

    // 5. Attach admin to request
    req.admin = {
      id: decoded.username, // Using username as ID in DynamoDB
      username: decoded.username,
    };

    next();
  } catch (e) {
    console.error("Authentication error:", e.message);

    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (e.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(500).json({ message: "Server error during authentication" });
  }
};
