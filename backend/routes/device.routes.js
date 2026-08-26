import { Router } from 'express';
import DeviceController from '../controllers/device.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/my-devices', authenticateToken, DeviceController.getMyDevices);
router.post('/register', authenticateToken, DeviceController.registerDevice);
router.delete('/:id', authenticateToken, DeviceController.deleteDevice);
router.post('/validate-eid', DeviceController.validateEIDEndpoint);

export default router;
