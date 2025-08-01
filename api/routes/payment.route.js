import express from "express";
import {
  createPaymentIntent,
  getPaymentMethods,
  getTransactionHistory,
  refundPayment,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// All payment routes require authentication
router.use(verifyToken);

router.post("/create-intent", createPaymentIntent);
router.get("/transactions", getTransactionHistory);
router.post("/refund", refundPayment);
router.get("/payment-methods", getPaymentMethods);

export default router;
