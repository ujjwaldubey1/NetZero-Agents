import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.userId - User ID performing the action
 * @param {string} params.action - Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} params.resource - Resource type (e.g., 'REPORT', 'CERTIFICATE')
 * @param {string} params.resourceId - Resource ID
 * @param {Object} params.details - Additional details
 * @param {string} params.ipAddress - IP address of the request
 * @param {string} params.userAgent - User agent of the request
 * @returns {Promise<Object>} - Created audit log entry
 */
export const createAuditLog = async ({
  userId,
  action,
  resource,
  resourceId = null,
  details = {},
  ipAddress = null,
  userAgent = null,
}) => {
  const auditLog = new AuditLog({
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
  });
  
  await auditLog.save();
  return auditLog;
};

/**
 * Get audit logs for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.skip - Number of results to skip
 * @returns {Promise<Array>} - Array of audit logs
 */
export const getAuditLogsByUser = async (userId, options = {}) => {
  const { limit = 50, skip = 0 } = options;
  return await AuditLog.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get audit logs for a resource
 * @param {string} resource - Resource type
 * @param {string} resourceId - Resource ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of audit logs
 */
export const getAuditLogsByResource = async (resource, resourceId, options = {}) => {
  const { limit = 50, skip = 0 } = options;
  return await AuditLog.find({ resource, resourceId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Log user action (convenience wrapper)
 * @param {Object} req - Express request object
 * @param {string} action - Action performed
 * @param {string} resource - Resource type
 * @param {string} resourceId - Resource ID
 * @param {Object} details - Additional details
 */
export const logAction = async (req, action, resource, resourceId = null, details = {}) => {
  if (!req.user) return;
  
  await createAuditLog({
    userId: req.user.id,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  });
};

