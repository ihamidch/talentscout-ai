const jwt = require('jsonwebtoken');

// Middleware to protect routes (Checks if user is logged in)
const protect = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token failed" });
  }
};

// Middleware for Roles (Checks if user is a Recruiter/Candidate)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied for this role" });
    }
    next();
  };
};

module.exports = { protect, authorize };