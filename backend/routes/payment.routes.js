import { Router } from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/calculate', PaymentController.calculateCheckout);
router.post('/process', authenticateToken, PaymentController.processPayment);
router.post('/razorpay/create-order', authenticateToken, PaymentController.createRazorpayOrder);
router.post('/razorpay/verify-payment', authenticateToken, PaymentController.verifyRazorpayPayment);
router.get('/my-payments', authenticateToken, PaymentController.getMyPayments);

export default router;
