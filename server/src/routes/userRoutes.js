import express from 'express';
import { getUsers, createUser, updateUser, getPermissionsMatrix } from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/permissions-matrix', requireAuth, getPermissionsMatrix);
router.get('/', requireAuth, getUsers);
router.post('/', requireAuth, requireRole(['MaintenanceAdmin']), createUser);
router.put('/:id', requireAuth, requireRole(['MaintenanceAdmin']), updateUser);

export default router;

