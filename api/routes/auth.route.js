import express from "express";
import rateLimit from "express-rate-limit";
import {
  disableMFA,
  enableMFA,
  google,
  setupMFA,
  signOut,
  signin,
  signup,
  testMFAToken,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Rate limiter: 5 requests per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again later.",
  },
});

router.post("/signup", authLimiter, signup);
router.post("/signin", authLimiter, signin);
router.post("/google", google);
router.get("/signout", signOut);

// MFA routes (protected)
router.post("/mfa/setup", verifyToken, setupMFA);
router.post("/mfa/enable", verifyToken, enableMFA);
router.post("/mfa/disable", verifyToken, disableMFA);
router.get("/mfa/test", verifyToken, testMFAToken);

export default router;
