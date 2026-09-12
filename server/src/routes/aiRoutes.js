import express from 'express';
import {
  predictAssetFailure,
  getRecommendations,
  handleRecommendationAction,
  summarizeNotes,
  getModelStats,
} from '../controllers/aiController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/predict-failure/:assetId', requireAuth, predictAssetFailure);
router.get('/recommendations', requireAuth, getRecommendations);
router.post(
  '/recommendations/:id/action',
  requireAuth,
  requireRole(['MaintenanceAdmin', 'OperationsManager']),
  handleRecommendationAction
);
router.post('/summarize-notes', requireAuth, summarizeNotes);
router.get('/model-stats', requireAuth, getModelStats);

export default router;

