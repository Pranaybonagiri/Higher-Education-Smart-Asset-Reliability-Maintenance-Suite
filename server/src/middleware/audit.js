import { AuditLog } from '../models/AuditLog.js';

export const recordAudit = async ({
  req,
  action,
  entityType,
  entityId = '',
  entityName = '',
  reason = '',
  previousState = null,
  newState = null,
  outcome = 'SUCCESS',
}) => {
  try {
    const actorId = req?.user?._id || null;
    const actorName = req?.user?.name || 'System / Unauthenticated';
    const actorRole = req?.user?.role || 'System';
    const ipAddress = req?.ip || req?.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || '';

    await AuditLog.create({
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId: String(entityId),
      entityName,
      reason,
      previousState,
      newState,
      outcome,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[AuditLog Error] Failed to write audit event:', err.message);
  }
};

