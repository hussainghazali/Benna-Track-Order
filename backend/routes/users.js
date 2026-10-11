// /api/users — auth + public order tracking (standalone port).
const express = require("express");
const router = express.Router();

const AUTH = require("../middleware/auth");
const { authLimiter, rateLimit } = require("../middleware/rateLimit");
const AUTH_CONTROLLER = require("../app/auth/controller/auth.controller");
const TRACK = require("../app/user/controller/track.controller");

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many tracking requests — slow down a little.",
});

// Auth
router.post("/auth/registration", authLimiter, AUTH_CONTROLLER.register);
router.post("/auth/customer/registration", authLimiter, AUTH_CONTROLLER.register);
router.post("/auth/customer/login", authLimiter, AUTH_CONTROLLER.login);
router.get("/auth/customer/me", AUTH.authenticate, AUTH_CONTROLLER.me);

// Public order tracking — no auth required; optionalAuth upgrades the
// response to the full owner view when a valid Bearer token is present.
router.get(
  "/website/track/:orderId",
  trackLimiter,
  AUTH.optionalAuth,
  TRACK.getOrderByIdPublic,
);

module.exports = router;
