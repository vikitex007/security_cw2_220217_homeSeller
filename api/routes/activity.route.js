import express from 'express';
import { 
  getUserActivityLogs, 
  getSecurityLogs, 
  getLoginHistory, 
  getTransactionLogs, 
  exportActivityLogs 
} from '../controllers/activity.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// All activity routes require authentication
router.use(verifyToken);

router.get('/logs', getUserActivityLogs);
router.get('/security', getSecurityLogs);
router.get('/login-history', getLoginHistory);
router.get('/transaction-logs', getTransactionLogs);
router.get('/export', exportActivityLogs);

export default router; 