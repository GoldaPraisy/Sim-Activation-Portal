import { Router } from 'express';
import OtpController from '../controllers/otp.controller.js';

const router = Router();

router.post('/send', OtpController.sendOtp);
router.post('/verify', OtpController.verifyOtp);
router.post('/resend', OtpController.sendOtp);

export default router;
