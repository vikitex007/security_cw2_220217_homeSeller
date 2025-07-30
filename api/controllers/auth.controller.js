import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { logActivity, logLoginAttempt } from "../utils/activityLogger.js";
import {
  checkAccountLock,
  incrementLoginAttempts,
  resetLoginAttempts,
} from "../utils/bruteForceProtection.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { errorHandler } from "../utils/error.js";
import {
  generateBackupCodes,
  generateMFASecret,
  generateMFAToken,
  generateQRCode,
  verifyBackupCode,
  verifyMFAToken,
} from "../utils/mfa.js";
import {
  passwordPolicyMessage,
  validatePasswordPolicy,
} from "../utils/passwordPolicy.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!validatePasswordPolicy(password)) {
    return next(errorHandler(400, passwordPolicyMessage()));
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "Email already registered"));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const now = new Date();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      passwordHistory: [hashedPassword],
      passwordChangedAt: now,
      emailVerified: false,
      verificationToken: verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await newUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, username);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, but log it
    }

    // Log user registration
    await logActivity(
      newUser._id,
      "user_registration",
      {
        username,
        email,
        verificationSent: true,
      },
      {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      }
    );

    res.status(201).json({
      message:
        "User created successfully! Please check your email to verify your account.",
      requiresVerification: true,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(errorHandler(400, "Invalid or expired verification token"));
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    await logActivity(user._id, "email_verified", {
      email: user.email,
    });

    res.status(200).json({
      message: "Email verified successfully! You can now sign in.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (user.emailVerified) {
      return next(errorHandler(400, "Email is already verified"));
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send new verification email
    try {
      await sendVerificationEmail(email, verificationToken, user.username);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return next(errorHandler(500, "Failed to send verification email"));
    }

    await logActivity(user._id, "verification_email_resent", {
      email: user.email,
    });

    res.status(200).json({
      message: "Verification email sent successfully!",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password, mfaToken, backupCode } = req.body;

  try {
    // Check if account is locked
    const lockStatus = await checkAccountLock(email);
    if (lockStatus.locked) {
      return next(errorHandler(423, lockStatus.message));
    }

    const validUser = await User.findOne({ email });
    if (!validUser) {
      await incrementLoginAttempts(email);
      return next(errorHandler(404, "User not found!"));
    }

    // Check if email is verified
    if (!validUser.emailVerified) {
      return next(
        errorHandler(
          401,
          "Please verify your email before signing in. Check your inbox or request a new verification email."
        )
      );
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      await incrementLoginAttempts(email);
      await logLoginAttempt(validUser._id, false, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return next(errorHandler(401, "Wrong credentials!"));
    }

    // Check MFA if enabled
    if (validUser.mfaEnabled) {
      if (!mfaToken && !backupCode) {
        return res.status(200).json({
          requiresMFA: true,
          message: "MFA token required",
        });
      }

      let mfaValid = false;
      if (mfaToken) {
        mfaValid = verifyMFAToken(mfaToken, validUser.mfaSecret);
      } else if (backupCode) {
        mfaValid = verifyBackupCode(backupCode, validUser.mfaBackupCodes);
      }

      if (!mfaValid) {
        await logLoginAttempt(validUser._id, false, {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          reason: "invalid_mfa",
        });
        return next(errorHandler(401, "Invalid MFA token or backup code"));
      }
    }

    // Reset login attempts on successful login
    await resetLoginAttempts(email);

    const token = jwt.sign(
      { id: validUser._id, role: validUser.role },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .status(200)
      .json(rest);

    // Log successful login
    await logLoginAttempt(validUser._id, true, {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET
      );
      const { password: pass, ...rest } = user._doc;

      // Log Google OAuth login
      await logLoginAttempt(user._id, true, {
        method: "google_oauth",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET
      );
      const { password: pass, ...rest } = newUser._doc;

      // Log Google OAuth registration
      await logActivity(
        newUser._id,
        "user_registration",
        {
          method: "google_oauth",
          username: newUser.username,
          email: newUser.email,
        },
        {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        }
      );

      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    // Get user from token if available
    const token = req.cookies.access_token;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        // Token is invalid, but we still want to clear the cookie
        // Token is invalid, but we still want to clear the cookie
      }
    }

    // Log sign out if we have a valid user
    if (userId) {
      await logActivity(
        userId,
        "user_signout",
        {},
        {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        }
      );
    }

    res.clearCookie("access_token");
    res
      .status(200)
      .json({ success: true, message: "User has been logged out!" });
  } catch (error) {
    // Even if there's an error, clear the cookie
    res.clearCookie("access_token");
    res
      .status(200)
      .json({ success: true, message: "User has been logged out!" });
  }
};

// MFA setup endpoint
export const setupMFA = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const user = await User.findById(id);

    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    if (user.mfaEnabled) {
      return next(errorHandler(400, "MFA is already enabled!"));
    }

    const secret = generateMFASecret();
    const backupCodes = generateBackupCodes();

    // Use the base32 secret for QR code generation
    const qrCode = await generateQRCode(secret.base32, user.email);

    await User.findByIdAndUpdate(id, {
      mfaSecret: secret.base32,
      mfaBackupCodes: backupCodes,
    });

    // Log MFA setup
    await logActivity(
      id,
      "mfa_setup",
      {},
      {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        severity: "medium",
      }
    );

    res.status(200).json({
      secret: secret.base32,
      qrCode: qrCode,
      backupCodes,
      otpauthUrl: secret.otpauth_url, // Also provide the otpauth URL for manual entry
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    next(error);
  }
};

// Enable MFA endpoint
export const enableMFA = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const { token } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    if (!user.mfaSecret) {
      return next(errorHandler(400, "MFA not set up!"));
    }

    const isValid = verifyMFAToken(token, user.mfaSecret);

    if (!isValid) {
      return next(errorHandler(400, "Invalid MFA token!"));
    }

    await User.findByIdAndUpdate(id, {
      mfaEnabled: true,
    });

    // Log MFA enable
    await logActivity(
      id,
      "mfa_enabled",
      {},
      {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        severity: "medium",
      }
    );

    res.status(200).json("MFA enabled successfully!");
  } catch (error) {
    next(error);
  }
};

// Disable MFA endpoint
export const disableMFA = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const { token } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    if (!user.mfaEnabled) {
      return next(errorHandler(400, "MFA is not enabled!"));
    }

    if (!verifyMFAToken(token, user.mfaSecret)) {
      return next(errorHandler(400, "Invalid MFA token!"));
    }

    await User.findByIdAndUpdate(id, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: [],
    });

    // Log MFA disable
    await logActivity(
      id,
      "mfa_disabled",
      {},
      {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        severity: "medium",
      }
    );

    res.status(200).json("MFA disabled successfully!");
  } catch (error) {
    next(error);
  }
};

// Test MFA token generation (for debugging)
export const testMFAToken = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user || !user.mfaSecret) {
      return next(errorHandler(400, "MFA not set up!"));
    }

    const currentToken = generateMFAToken(user.mfaSecret);

    res.status(200).json({
      currentToken,
      secret: user.mfaSecret,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

export const healthCheck = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
