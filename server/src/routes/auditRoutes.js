import express from 'express';
import { getAuditLogs, getSystemSettings, updateSystemSetting } from '../controllers/auditController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/logs', requireAuth, requireRole(['MaintenanceAdmin', 'OperationsManager']), getAuditLogs);
router.get('/settings', requireAuth, getSystemSettings);
router.put('/settings', requireAuth, requireRole(['MaintenanceAdmin']), updateSystemSetting);

export default router;

