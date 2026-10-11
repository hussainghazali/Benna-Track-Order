// JWT authentication middleware (simplified standalone port).
// Original checks a Redis token blacklist + DB session record; here we verify
// the JWT and load the user so downstream code can rely on req.userId/req.user.
const jwt = require("jsonwebtoken");
const Auth = require("../app/auth/model/auth.model");

const JWT_SECRET = process.env.JWT_SECRET;

const tokenFrom = (req) => {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return req.cookies?.userDetail || req.cookies?.token || null;
};

const authenticate = async (req, res, next) => {
  try {
    const token = tokenFrom(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await Auth.findById(payload.userId || payload.id).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "Session Expire" });
    }
    req.user = user;
    req.userId = String(user._id);
    req.roleId = user.roleId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Session Expire" });
  }
};

// Attach req.userId/req.user when a valid Bearer token is present, otherwise
// continue unauthenticated — used by public order tracking (owner sees the
// full view; everyone else gets the masked limited view).
const optionalAuth = async (req, res, next) => {
  try {
    const token = tokenFrom(req);
    if (!token) return next();
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await Auth.findById(payload.userId || payload.id).lean();
    if (user) {
      req.user = user;
      req.userId = String(user._id);
      req.roleId = user.roleId;
    }
  } catch {
    /* invalid token → treat as anonymous */
  }
  next();
};

module.exports = { authenticate, optionalAuth };
