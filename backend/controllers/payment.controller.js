import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const GST_RATE = 0.18; // 18% Telecom GST

export class PaymentController {
  /**
   * Calculate checkout totals and check payment gateway configuration status
   */
  static async calculateCheckout(req, res) {
    try {
      const { planId } = req.body;
      const plan = db.findById('plans', planId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found.' });
      }

      const baseAmount = Number(plan.price);
      const tax = Number((baseAmount * GST_RATE).toFixed(2));
      const totalAmount = Number((baseAmount + tax).toFixed(2));

      const razorpayActive = !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

      return res.json({
        success: true,
        summary: {
          planId: plan.id,
          planName: plan.plan_name,
          operator: plan.operator,
          validity: `${plan.validity_days} Days`,
          baseAmount,
          taxRate: '18% GST',
          tax,
          totalAmount,
          currency: 'INR (₹)'
        },
        razorpayConfig: {
          active: razorpayActive,
          keyId: process.env.RAZORPAY_KEY_ID || null
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to calculate checkout summary.' });
    }
  }

  /**
   * Process Mock Payment (Fallback when Razorpay is not configured)
   */
  static async processPayment(req, res) {
    try {
      const userId = req.user.id;
      const { planId, paymentMethod = 'MOCK_UPI', paymentDetails = {} } = req.body;

      const plan = db.findById('plans', planId);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Invalid plan selected for payment.' });
      }

      const baseAmount = Number(plan.price);
      const tax = Number((baseAmount * GST_RATE).toFixed(2));
      const totalAmount = Number((baseAmount + tax).toFixed(2));
      const transactionId = `TXN-DEMO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Record successful mock payment
      const paymentRecord = db.insert('payments', {
        id: `pay-${uuidv4().slice(0, 8)}`,
        user_id: userId,
        request_id: req.body.requestId || 'pending-activation',
        plan_id: plan.id,
        amount: baseAmount,
        tax,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: 'SUCCESS'
      });

      return res.status(201).json({
        success: true,
        message: 'Mock Payment processed successfully!',
        payment: paymentRecord
      });
    } catch (err) {
      console.error('Payment processing error:', err);
      return res.status(500).json({ success: false, message: 'Payment gateway simulation failed.' });
    }
  }

  /**
   * Create Razorpay Order (For real payments)
   */
  static async createRazorpayOrder(req, res) {
    try {
      const { planId } = req.body;
      const plan = db.findById('plans', planId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found.' });
      }

      const baseAmount = Number(plan.price);
      const tax = Number((baseAmount * GST_RATE).toFixed(2));
      const totalAmount = Number((baseAmount + tax).toFixed(2));

      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!razorpayKeyId || !razorpaySecret) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay keys not configured on this server.'
        });
      }

      const orderAmountPaisa = Math.round(totalAmount * 100);

      // Create order via REST API using native fetch
      const auth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: orderAmountPaisa,
          currency: 'INR',
          receipt: `rcpt_${uuidv4().slice(0, 8)}`
        })
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error?.description || `HTTP ${response.status}`);
      }

      return res.status(201).json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: razorpayKeyId
      });
    } catch (err) {
      console.error('Razorpay order creation failure:', err);
      return res.status(500).json({ success: false, message: 'Failed to initiate real Razorpay transaction.' });
    }
  }

  /**
   * Verify Razorpay Payment Signature (For real payments)
   */
  static async verifyRazorpayPayment(req, res) {
    try {
      const userId = req.user.id;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planId,
        requestId
      } = req.body;

      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpaySecret) {
        return res.status(400).json({ success: false, message: 'Razorpay secret key not found.' });
      }

      // Verify HMAC SHA256 signature
      const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Cryptographic signature mismatch.'
        });
      }

      // Locate corresponding plan
      const plan = db.findById('plans', planId);
      const baseAmount = plan ? Number(plan.price) : 0;
      const tax = Number((baseAmount * GST_RATE).toFixed(2));
      const totalAmount = Number((baseAmount + tax).toFixed(2));

      // Store payment record
      const paymentRecord = db.insert('payments', {
        id: `pay-${uuidv4().slice(0, 8)}`,
        user_id: userId,
        request_id: requestId || 'pending-activation',
        plan_id: planId,
        amount: baseAmount,
        tax,
        total_amount: totalAmount,
        payment_method: 'RAZORPAY',
        transaction_id: razorpay_payment_id,
        status: 'SUCCESS'
      });

      return res.json({
        success: true,
        message: 'Payment verified and recorded successfully!',
        payment: paymentRecord
      });
    } catch (err) {
      console.error('Razorpay signature verification failure:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during verification.' });
    }
  }

  /**
   * Get user payment history
   */
  static async getMyPayments(req, res) {
    try {
      const userId = req.user.id;
      const payments = db.find('payments', p => p.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json({
        success: true,
        count: payments.length,
        payments
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve payment records.' });
    }
  }
}

export default PaymentController;
