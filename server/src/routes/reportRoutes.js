import express from 'express';
import { getAnalyticsSummary, exportReport, getReportHistory } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', requireAuth, getAnalyticsSummary);
router.post('/export', requireAuth, exportReport);
router.get('/history', requireAuth, getReportHistory);

export default router;

