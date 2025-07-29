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
