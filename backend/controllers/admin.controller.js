import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export class AdminController {
  /**
   * Get complete admin KPI overview metrics
   */
  static async getStats(req, res) {
    try {
      const users = db.find('users');
      const devices = db.find('devices');
      const requests = db.find('esim_requests');
      const payments = db.find('payments');

      const totalUsers = users.length;
      const totalDevices = devices.length;
      const totalRequests = requests.length;

      const completedActivations = requests.filter(r => r.status === 'ACTIVATED').length;
      const pendingRequests = requests.filter(r => ['REQUEST_CREATED', 'OTP_VERIFIED', 'PAYMENT_COMPLETED', 'PROFILE_READY', 'INSTALLATION_PENDING'].includes(r.status)).length;
      const failedRequests = requests.filter(r => ['FAILED', 'REJECTED'].includes(r.status)).length;

      const totalRevenue = payments
        .filter(p => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0);

      // Operator breakdown
      const operatorBreakdown = {};
      requests.forEach(r => {
        operatorBreakdown[r.operator] = (operatorBreakdown[r.operator] || 0) + 1;
      });

      return res.json({
        success: true,
        metrics: {
          totalUsers,
          totalDevices,
          totalRequests,
          completedActivations,
          pendingRequests,
          failedRequests,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalPayments: payments.length,
          operatorBreakdown
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to compute admin statistics.' });
    }
  }

  /**
   * Get all activation requests for admin management
   */
  static async getAllRequests(req, res) {
    try {
      const { status, operator, search } = req.query;
      let requests = db.find('esim_requests')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (status && status !== 'ALL') {
        requests = requests.filter(r => r.status === status);
      }

      if (operator && operator !== 'ALL') {
        requests = requests.filter(r => r.operator.toLowerCase() === operator.toLowerCase());
      }

      const populated = requests.map(r => {
        const user = db.findById('users', r.user_id);
        const device = db.findById('devices', r.device_id);
        const plan = db.findById('plans', r.plan_id);
        const payment = db.findOne('payments', p => p.request_id === r.id);

        return {
          ...r,
          user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
          device: device ? { name: device.device_name, type: device.device_type, os: device.os, eid: device.eid } : null,
          plan: plan ? { name: plan.plan_name, price: plan.price, data: plan.data_per_day, validity: plan.validity_days } : null,
          payment: payment ? { amount: payment.total_amount, status: payment.status, txnId: payment.transaction_id } : null
        };
      });

      if (search) {
        const q = search.toLowerCase();
        return res.json({
          success: true,
          count: populated.length,
          requests: populated.filter(r => 
            r.request_code?.toLowerCase().includes(q) ||
            r.eid?.toLowerCase().includes(q) ||
            r.msisdn?.toLowerCase().includes(q) ||
            r.user?.name?.toLowerCase().includes(q) ||
            r.user?.email?.toLowerCase().includes(q)
          )
        });
      }

      return res.json({
        success: true,
        count: populated.length,
        requests: populated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve activation requests.' });
    }
  }

  /**
   * Approve / Reject Request
   */
  static async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note, failureReason } = req.body;

      const request = db.findById('esim_requests', id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Activation request not found.' });
      }

      const oldStatus = request.status;
      const updates = { status };
      if (failureReason) updates.failure_reason = failureReason;

      const updated = db.update('esim_requests', id, updates);

      // Audit Log
      db.insert('activation_logs', {
        id: `log-${uuidv4().slice(0, 8)}`,
        request_id: id,
        from_status: oldStatus,
        to_status: status,
        note: note || `Administrator modified activation status to ${status}.`,
        created_by: `Admin (${req.user.name})`
      });

      return res.json({
        success: true,
        message: `Request status successfully changed to ${status}.`,
        request: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update request.' });
    }
  }

  /**
   * List all users
   */
  static async getAllUsers(req, res) {
    try {
      const users = db.find('users').map(u => {
        const userDevices = db.find('devices', d => d.user_id === u.id);
        const userRequests = db.find('esim_requests', r => r.user_id === u.id);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          deviceCount: userDevices.length,
          requestCount: userRequests.length,
          created_at: u.created_at
        };
      });

      return res.json({ success: true, count: users.length, users });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  }

  /**
   * List all registered devices and EIDs
   */
  static async getAllDevices(req, res) {
    try {
      const devices = db.find('devices').map(d => {
        const user = db.findById('users', d.user_id);
        return {
          ...d,
          owner: user ? { name: user.name, email: user.email } : null
        };
      });

      return res.json({ success: true, count: devices.length, devices });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve devices.' });
    }
  }

  /**
   * List all payment transactions
   */
  static async getAllPayments(req, res) {
    try {
      const payments = db.find('payments')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(p => {
          const user = db.findById('users', p.user_id);
          const plan = db.findById('plans', p.plan_id);
          const request = db.findById('esim_requests', p.request_id);
          return {
            ...p,
            user: user ? { name: user.name, email: user.email } : null,
            plan: plan ? { name: plan.plan_name, operator: plan.operator } : null,
            requestCode: request ? request.request_code : 'N/A'
          };
        });

      return res.json({ success: true, count: payments.length, payments });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve payments.' });
    }
  }

  /**
   * List activation audit trail
   */
  static async getAuditLogs(req, res) {
    try {
      const logs = db.find('activation_logs')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(l => {
          const reqItem = db.findById('esim_requests', l.request_id);
          return {
            ...l,
            requestCode: reqItem ? reqItem.request_code : 'N/A',
            operator: reqItem ? reqItem.operator : 'N/A'
          };
        });

      return res.json({ success: true, count: logs.length, logs });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
  }
}

export default AdminController;
