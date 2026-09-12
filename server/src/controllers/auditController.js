import { AuditLog } from '../models/AuditLog.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { recordAudit } from '../middleware/audit.js';

export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      action,
      entityType,
      actorRole,
      outcome,
      search,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (action && action !== 'All') {
      query.action = action;
    }
    if (entityType && entityType !== 'All') {
      query.entityType = entityType;
    }
    if (actorRole && actorRole !== 'All') {
      query.actorRole = actorRole;
    }
    if (outcome && outcome !== 'All') {
      query.outcome = outcome;
    }
    if (search) {
      query.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find().sort({ category: 1 });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const updateSystemSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await SystemSetting.findOne({ key });

    if (!setting) {
      return res.status(404).json({ success: false, error: { message: 'Setting not found' } });
    }

    const previousValue = setting.value;
    setting.value = value;
    setting.updatedBy = req.user?.name || 'Administrator';
    await setting.save();

    await recordAudit({
      req,
      action: 'CONFIG_CHANGE',
      entityType: 'SystemSetting',
      entityId: setting._id,
      entityName: setting.label,
      reason: `Updated system parameter ${setting.key}`,
      previousState: { key, value: previousValue },
      newState: { key, value },
    });

    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

