import User from '../models/User.js'
import jwt from 'jsonwebtoken'

  const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
      } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
      }
    }
    if (!token) res.status(401).json({ message: "Not authorized, no token" });
  };

  const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Admin access only" });
    }
  };

  const ownerOnly = (req, res, next) => {
    if (req.user && req.user.role === "owner") {
      next();
    } else {
      res.status(403).json({ message: "Store owner access only" });
    }
  };

export { protect, adminOnly, ownerOnly };
