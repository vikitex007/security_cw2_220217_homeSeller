import User from "../models/user.model.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export const checkAccountLock = async (email) => {
  const user = await User.findOne({ email });

  if (!user) return { locked: false };

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return {
      locked: true,
      remainingMinutes: remainingTime,
      message: `Account is locked. Try again in ${remainingTime} minutes.`,
    };
  }

  return { locked: false };
};

export const incrementLoginAttempts = async (email) => {
  const user = await User.findOne({ email });

  if (!user) return;

  const updates = {
    loginAttempts: user.loginAttempts + 1,
  };

  // Lock account if max attempts reached
  if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  await User.findByIdAndUpdate(user._id, updates);
};

export const resetLoginAttempts = async (email) => {
  const user = await User.findOne({ email });

  if (!user) return;

  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date(),
  });
};

export const isAccountLocked = async (email) => {
  const lockStatus = await checkAccountLock(email);
  return lockStatus.locked;
};
