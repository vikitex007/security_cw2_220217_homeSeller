import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";
import { getActivityLogs } from "../utils/activityLogger.js";

export const getUserActivityLogs = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const { page = 1, limit = 20, action, status, severity } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      action,
      status,
      severity,
    };

    const logs = await getActivityLogs(id, options);

    res.status(200).json({
      logs,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getSecurityLogs = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const { page = 1, limit = 20 } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      severity: "high",
    };

    const logs = await getActivityLogs(id, options);

    res.status(200).json({
      securityLogs: logs,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getLoginHistory = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const { page = 1, limit = 20 } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      action: { $in: ["login_success", "login_failed"] },
    };

    const logs = await getActivityLogs(id, options);

    res.status(200).json({
      loginHistory: logs,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionLogs = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const { page = 1, limit = 20 } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      action: { $regex: /^payment_/ },
    };

    const logs = await getActivityLogs(id, options);

    res.status(200).json({
      transactionLogs: logs,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const exportActivityLogs = async (req, res, next) => {
  try {
    const { id } = req.user; // Changed from userId to id
    const { startDate, endDate, format = "json" } = req.query;

    const options = {
      limit: 1000, // Export up to 1000 records
    };

    if (startDate && endDate) {
      options.startDate = new Date(startDate);
      options.endDate = new Date(endDate);
    }

    const logs = await getActivityLogs(id, options);

    if (format === "csv") {
      // Convert to CSV format
      const csvHeaders =
        "Timestamp,Action,Status,Severity,Details,IP Address\n";
      const csvData = logs
        .map((log) => {
          return `${log.createdAt},${log.action},${log.status},${
            log.severity
          },"${JSON.stringify(log.details)}",${log.ipAddress || ""}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=activity_logs.csv"
      );
      res.status(200).send(csvHeaders + csvData);
    } else {
      res.status(200).json({
        logs,
        exportDate: new Date(),
        totalRecords: logs.length,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllUsersActivityLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      status,
      severity,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "username email");

    const total = await Activity.countDocuments(filter);

    res.status(200).json({
      success: true,
      logs,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get recent activities (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivities = await Activity.countDocuments({
      createdAt: { $gte: last24Hours },
    });

    // Get failed login attempts
    const failedLogins = await Activity.countDocuments({
      action: "login_failed",
      createdAt: { $gte: last24Hours },
    });

    // Get critical security events
    const criticalEvents = await Activity.countDocuments({
      severity: "critical",
      createdAt: { $gte: last24Hours },
    });

    // Get user activity by action type
    const actionStats = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: last24Hours },
        },
      },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email createdAt");

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        recentActivities,
        failedLogins,
        criticalEvents,
        actionStats,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's recent activities
    const recentActivities = await Activity.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's login history
    const loginHistory = await Activity.find({
      userId: userId,
      action: { $in: ["login_success", "login_failed"] },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get user's security events
    const securityEvents = await Activity.find({
      userId: userId,
      severity: { $in: ["high", "critical"] },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      user,
      recentActivities,
      loginHistory,
      securityEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      users,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
