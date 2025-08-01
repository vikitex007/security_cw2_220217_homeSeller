import bcryptjs from "bcryptjs";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import {
  passwordPolicyMessage,
  validatePasswordPolicy,
} from "../utils/passwordPolicy.js";

export const test = (req, res) => {
  res.json({
    message: "Api route is working!",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    let user = await User.findById(req.params.id);
    if (req.body.password) {
      if (!validatePasswordPolicy(req.body.password)) {
        return next(errorHandler(400, passwordPolicyMessage()));
      }
      const hashedNew = bcryptjs.hashSync(req.body.password, 10);
      // Prevent reuse of last 3 passwords
      const last3 = user.passwordHistory ? user.passwordHistory.slice(-3) : [];
      if (
        last3.some((oldHash) =>
          bcryptjs.compareSync(req.body.password, oldHash)
        )
      ) {
        return next(
          errorHandler(400, "You cannot reuse your last 3 passwords.")
        );
      }
      // Update password history (keep last 5)
      const newHistory = [...(user.passwordHistory || []), hashedNew].slice(-5);
      req.body.password = hashedNew;
      req.body.passwordHistory = newHistory;
      req.body.passwordChangedAt = new Date();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
          passwordHistory: req.body.passwordHistory,
          passwordChangedAt: req.body.passwordChangedAt,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account!"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own listings!"));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(errorHandler(404, "User not found!"));

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
