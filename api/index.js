import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import dotenv from "dotenv";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import mongoose from "mongoose";
import path from "path";
import xss from "xss-clean";
import activityRouter from "./routes/activity.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import paymentRouter from "./routes/payment.route.js";
import userRouter from "./routes/user.route.js";

// Load .env from root directory
dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const app = express();

// CSRF Protection
const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET || "fallback-secret",
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getSessionIdentifier: () => "default-session",
});

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());
app.use(doubleCsrfProtection);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000!");
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// CSRF Token endpoint
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/activity", activityRouter);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
