import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordHistory: {
      type: [String],
      default: [],
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    // Email verification fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationExpires: {
      type: Date,
      default: null,
    },
    // MFA fields
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      default: null,
    },
    mfaBackupCodes: [
      {
        type: String,
      },
    ],
    // Brute force protection
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // Activity logging
    lastLogin: {
      type: Date,
      default: null,
    },
    lastActivity: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Email field encryption
if (process.env.ENCRYPTION_KEY) {
  userSchema.plugin(encrypt, {
    secret: process.env.ENCRYPTION_KEY,
    encryptedFields: ["email"],
    excludeFromEncryption: [
      "_id",
      "username",
      "password",
      "role",
      "avatar",
      "emailVerified",
      "verificationToken",
      "verificationExpires",
      "createdAt",
      "updatedAt",
    ],
  });
}

const User = mongoose.model("User", userSchema);

export default User;
