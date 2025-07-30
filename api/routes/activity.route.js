import express from "express";
import {
  exportActivityLogs,
  getAdminDashboard,
  getAllUsers,
  getAllUsersActivityLogs,
  getLoginHistory,
  getSecurityLogs,
  getTransactionLogs,
  getUserActivityLogs,
  getUserDetails,
  updateUserRole,
} from "../controllers/activity.controller.js";
import { verifyRole, verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// All activity routes require authentication
router.use(verifyToken);

// User routes (existing)
router.get("/logs", getUserActivityLogs);
router.get("/security", getSecurityLogs);
router.get("/login-history", getLoginHistory);
router.get("/transaction-logs", getTransactionLogs);
router.get("/export", exportActivityLogs);

// Admin routes (new)
router.get("/admin/all-logs", verifyRole(["admin"]), getAllUsersActivityLogs);
router.get("/admin/dashboard", verifyRole(["admin"]), getAdminDashboard);
router.get("/admin/users", verifyRole(["admin"]), getAllUsers);
router.get("/admin/user/:userId", verifyRole(["admin"]), getUserDetails);
router.put("/admin/user/:userId/role", verifyRole(["admin"]), updateUserRole);

export default router;
