import express from 'express';
import {
  getAssets,
  getAssetById,
  getAssetStats,
  getAssetTelemetry,
  createAsset,
  updateAsset,
} from '../controllers/assetController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', requireAuth, getAssetStats);
router.get('/', requireAuth, getAssets);
router.get('/:id', requireAuth, getAssetById);
router.get('/:id/telemetry', requireAuth, getAssetTelemetry);
router.post('/', requireAuth, requireRole(['MaintenanceAdmin', 'OperationsManager']), createAsset);
router.put('/:id', requireAuth, requireRole(['MaintenanceAdmin', 'OperationsManager', 'Technician']), updateAsset);

export default router;

