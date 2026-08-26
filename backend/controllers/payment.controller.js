import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const GST_RATE = 0.18; // 18% Telecom GST

export class PaymentController {
  /**
   * Calculate checkout totals
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
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to calculate checkout summary.' });
    }
  }

  /**
   * Process Mock Payment
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

      // Record successful test payment
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
