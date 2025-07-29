import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { logActivity, logLoginAttempt } from "../utils/activityLogger.js";
import {
  checkAccountLock,
  incrementLoginAttempts,
  resetLoginAttempts,
} from "../utils/bruteForceProtection.js";
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
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const now = new Date();
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    passwordHistory: [hashedPassword],
    passwordChangedAt: now,
  });
  try {
    await newUser.save();

    // Log user registration
    await logActivity(
      newUser._id,
      "user_registration",
      {
        username,
        email,
      },
      {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      }
    );

    res.status(201).json("User created successfully!");
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
      await logLoginAttempt(email, false, {
        reason: "User not found",
        ipAddress: req.ip,
      });
      return next(errorHandler(404, "User not found!"));
    }

    // Password expiry check (90 days)
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
    if (
      validUser.passwordChangedAt &&
      Date.now() - new Date(validUser.passwordChangedAt).getTime() > maxAge
    ) {
      return next(
        errorHandler(
          403,
          "Your password has expired. Please change your password."
        )
      );
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      await incrementLoginAttempts(email);
      await logLoginAttempt(validUser._id, false, {
        reason: "Invalid password",
        ipAddress: req.ip,
      });
      return next(errorHandler(401, "Wrong credentials!"));
    }

    // Check if MFA is enabled
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
        if (mfaValid) {
          // Remove used backup code
          const updatedBackupCodes = validUser.mfaBackupCodes.filter(
            (code) => code !== backupCode.toUpperCase()
          );
          await User.findByIdAndUpdate(validUser._id, {
            mfaBackupCodes: updatedBackupCodes,
          });
        }
      }

      if (!mfaValid) {
        await incrementLoginAttempts(email);
        await logLoginAttempt(validUser._id, false, {
          reason: "Invalid MFA token",
          ipAddress: req.ip,
        });
        return next(errorHandler(401, "Invalid MFA token!"));
      }
    }

    // Reset login attempts on successful login
    await resetLoginAttempts(email);

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;

    // Log successful login
    await logLoginAttempt(validUser._id, true, {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
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
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
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
    // Log sign out
    if (req.user) {
      await logActivity(
        req.user.id,
        "user_signout",
        {},
        {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        }
      );
    }

    res.clearCookie("access_token");
    res.status(200).json("User has been logged out!");
  } catch (error) {
    next(error);
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

    console.log("MFA Verification Debug:");
    console.log("Token received:", token);
    console.log("User secret:", user.mfaSecret);
    console.log("User email:", user.email);

    const isValid = verifyMFAToken(token, user.mfaSecret);
    console.log("Token verification result:", isValid);

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
    console.error("MFA enable error:", error);
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
