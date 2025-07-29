import Activity from '../models/activity.model.js';

export const logActivity = async (userId, action, details = {}, options = {}) => {
  try {
    const activity = new Activity({
      userId,
      action,
      details,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      status: options.status || 'success',
      severity: options.severity || 'low',
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Activity logging failed:', error);
    // Don't throw error to avoid breaking the main functionality
  }
};

export const logSecurityEvent = async (userId, action, details = {}, options = {}) => {
  return await logActivity(userId, action, details, {
    ...options,
    severity: options.severity || 'high',
    status: options.status || 'warning',
  });
};

export const logLoginAttempt = async (userId, success, details = {}) => {
  const action = success ? 'login_success' : 'login_failed';
  const status = success ? 'success' : 'failure';
  const severity = success ? 'low' : 'medium';
  
  return await logActivity(userId, action, details, {
    status,
    severity,
  });
};

export const logTransaction = async (userId, action, details = {}) => {
  return await logActivity(userId, action, details, {
    severity: 'medium',
  });
};

export const getActivityLogs = async (userId, options = {}) => {
  const { limit = 50, skip = 0, action, status, severity } = options;
  
  const query = { userId };
  if (action) query.action = action;
  if (status) query.status = status;
  if (severity) query.severity = severity;
  
  return await Activity.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}; 