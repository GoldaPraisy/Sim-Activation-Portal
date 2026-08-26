import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// All admin routes require valid admin authentication
router.use(authenticateToken, requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/requests', AdminController.getAllRequests);
router.put('/requests/:id/status', AdminController.updateRequestStatus);
router.get('/users', AdminController.getAllUsers);
router.get('/devices', AdminController.getAllDevices);
router.get('/payments', AdminController.getAllPayments);
router.get('/logs', AdminController.getAuditLogs);

export default router;
