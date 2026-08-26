import { Router } from 'express';
import EsimController from '../controllers/esim.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Core eSIM Provisioning API: POST /api/esim/request
router.post('/request', optionalAuth, EsimController.createActivationRequest);
router.get('/my-requests', authenticateToken, EsimController.getMyRequests);
router.get('/request/:id', authenticateToken, EsimController.getRequestById);
router.post('/request/:id/status', authenticateToken, EsimController.updateDemoStatus);

export default router;
