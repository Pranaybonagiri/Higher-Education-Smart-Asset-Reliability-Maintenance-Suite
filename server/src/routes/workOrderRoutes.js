import express from 'express';
import {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrderStatus,
  updateChecklist,
  verifyAndClose,
  getCalendarEvents,
} from '../controllers/workOrderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/calendar', requireAuth, getCalendarEvents);
router.get('/', requireAuth, getWorkOrders);
router.get('/:id', requireAuth, getWorkOrderById);
router.post('/', requireAuth, requireRole(['MaintenanceAdmin', 'OperationsManager', 'AcademicDeptHead']), createWorkOrder);
router.patch('/:id/status', requireAuth, updateWorkOrderStatus);
router.patch('/:id/checklist', requireAuth, updateChecklist);
router.post('/:id/verify', requireAuth, requireRole(['MaintenanceAdmin', 'OperationsManager']), verifyAndClose);

export default router;

