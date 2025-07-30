import express from "express";
import rateLimit from "express-rate-limit";
import {
  disableMFA,
  enableMFA,
  google,
  healthCheck,
  resendVerificationEmail,
  setupMFA,
  signin,
  signOut,
  signup,
  testMFAToken,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 signup attempts per hour
  message: "Too many signup attempts, please try again later.",
});

router.post("/signup", signupLimiter, signup);
router.post("/signin", authLimiter, signin);
router.get("/signout", signOut);
router.post("/google", google);
router.get("/health", healthCheck);

// Email verification routes
router.post("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// MFA routes
router.post("/setup-mfa", verifyToken, setupMFA);
router.post("/enable-mfa", verifyToken, enableMFA);
router.post("/disable-mfa", verifyToken, disableMFA);
router.get("/test-mfa", verifyToken, testMFAToken);

export default router;
