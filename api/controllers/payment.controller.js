import Stripe from "stripe";
import Listing from "../models/listing.model.js";
import Transaction from "../models/transaction.model.js";
import { logTransaction } from "../utils/activityLogger.js";
import { errorHandler } from "../utils/error.js";

export const createPaymentIntent = async (req, res, next) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { listingId, amount, currency = "usd" } = req.body;
    const { id } = req.user;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      metadata: { userId: id, listingId: listingId, listingName: listing.name },
    });

    const transaction = new Transaction({
      userId: id,
      listingId: listingId,
      amount: amount,
      currency: currency.toUpperCase(),
      status: "pending",
      paymentMethod: "stripe",
      paymentIntentId: paymentIntent.id,
      description: `Payment for ${listing.name}`,
    });
    await transaction.save();
    await logTransaction(
      id,
      "payment_intent_created",
      {
        transactionId: transaction._id,
        listingId: listingId,
        amount: amount,
        currency: currency,
      },
      { ipAddress: req.ip, userAgent: req.get("User-Agent") }
    );

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { paymentIntentId, transactionId } = req.body;
    const { id } = req.user;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      await Transaction.findByIdAndUpdate(transactionId, {
        status: "completed",
        stripePaymentId: paymentIntent.latest_charge,
      });
      await logTransaction(
        id,
        "payment_completed",
        {
          transactionId: transactionId,
          paymentIntentId: paymentIntentId,
          amount: paymentIntent.amount / 100,
        },
        { ipAddress: req.ip, userAgent: req.get("User-Agent") }
      );
      res
        .status(200)
        .json({ success: true, message: "Payment completed successfully!" });
    } else {
      await Transaction.findByIdAndUpdate(transactionId, { status: "failed" });
      await logTransaction(
        id,
        "payment_failed",
        {
          transactionId: transactionId,
          paymentIntentId: paymentIntentId,
          reason: paymentIntent.last_payment_error?.message || "Payment failed",
        },
        {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          status: "failure",
        }
      );
      return next(errorHandler(400, "Payment failed!"));
    }
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { page = 1, limit = 10, status } = req.query;
    const query = { userId: id };
    if (status) query.status = status;
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("listingId", "name address imageUrls");
    const total = await Transaction.countDocuments(query);
    res.status(200).json({
      transactions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { transactionId, reason } = req.body;
    const { id } = req.user;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return next(errorHandler(404, "Transaction not found!"));
    }
    if (transaction.userId !== id) {
      return next(errorHandler(401, "Unauthorized!"));
    }
    if (transaction.status !== "completed") {
      return next(errorHandler(400, "Transaction cannot be refunded!"));
    }
    const refund = await stripe.refunds.create({
      payment_intent: transaction.paymentIntentId,
      reason: "requested_by_customer",
      metadata: { reason: reason, refundedBy: id },
    });
    await Transaction.findByIdAndUpdate(transactionId, {
      status: "refunded",
      refundReason: reason,
      refundedAt: new Date(),
    });
    await logTransaction(
      id,
      "payment_refunded",
      {
        transactionId: transactionId,
        refundId: refund.id,
        reason: reason,
      },
      { ipAddress: req.ip, userAgent: req.get("User-Agent") }
    );
    res.status(200).json({
      success: true,
      message: "Refund processed successfully!",
      refundId: refund.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethods = async (req, res, next) => {
  try {
    // In a real application, you would store payment methods
    res.status(200).json({ paymentMethods: [] });
  } catch (error) {
    next(error);
  }
};
