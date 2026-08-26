import db from '../config/db.js';
import MockSmdpService from '../services/mockSmdpService.js';
import { validateEID, validatePhone } from '../utils/eidValidator.js';
import { v4 as uuidv4 } from 'uuid';

export class EsimController {
  /**
   * Core Provisioning API: POST /api/esim/request
   * Simulates carrier communication with SM-DP+ and returns activation code + QR
   */
  static async createActivationRequest(req, res) {
    try {
      const userId = req.user ? req.user.id : req.body.userId;
      const { eid, deviceId, device, planId, operator, msisdn, paymentId } = req.body;

      if (!eid || !planId) {
        return res.status(400).json({
          success: false,
          message: 'EID and planId are required.'
        });
      }

      // Validate EID
      const eidValidation = validateEID(eid);
      if (!eidValidation.isValid) {
        return res.status(400).json({ success: false, message: eidValidation.error });
      }

      // Validate Plan
      const plan = db.findById('plans', planId);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Selected plan not found.' });
      }

      const targetOperator = operator || plan.operator || 'Demo Telecom';
      const targetPhone = msisdn || (req.user ? req.user.phone : '9876543210');

      // Resolve or Register Device if deviceId not given
      let resolvedDeviceId = deviceId;
      if (!resolvedDeviceId) {
        const existingDevice = db.findOne('devices', d => d.user_id === userId && d.eid === eidValidation.cleanEid);
        if (existingDevice) {
          resolvedDeviceId = existingDevice.id;
        } else {
          const newDevice = db.insert('devices', {
            id: `dev-${uuidv4().slice(0, 8)}`,
            user_id: userId,
            device_name: typeof device === 'string' ? device : 'eSIM Smartphone',
            device_model: typeof device === 'string' ? device : 'Generic Smartphone',
            os: typeof device === 'string' && device.toLowerCase().includes('iphone') ? 'iOS' : 'Android',
            device_type: typeof device === 'string' && device.toLowerCase().includes('iphone') ? 'iPhone' : 'Android',
            eid: eidValidation.cleanEid
          });
          resolvedDeviceId = newDevice.id;
        }
      }

      // Generate simulated SM-DP+ profile & QR code
      const profile = await MockSmdpService.provisionProfile({
        userId,
        eid: eidValidation.cleanEid,
        device: typeof device === 'string' ? device : 'Smartphone',
        planId: plan.id,
        operator: targetOperator,
        msisdn: targetPhone
      });

      const requestCode = MockSmdpService.generateRequestCode();
      const requestId = `req-${uuidv4().slice(0, 8)}`;

      // Create eSIM Request record
      const esimRequest = db.insert('esim_requests', {
        id: requestId,
        request_code: requestCode,
        user_id: userId,
        device_id: resolvedDeviceId,
        plan_id: plan.id,
        operator: targetOperator,
        eid: eidValidation.cleanEid,
        msisdn: targetPhone,
        status: 'PROFILE_READY', // Ready for QR scan & installation
        activation_code: profile.activationCode,
        smdp_server: profile.smdpServer,
        qr_code_url: profile.qrCodeUrl,
        failure_reason: null
      });

      // Link payment if available
      if (paymentId) {
        db.update('payments', paymentId, { request_id: esimRequest.id });
      }

      // Record lifecycle audit logs
      db.insert('activation_logs', {
        id: `log-${uuidv4().slice(0, 8)}`,
        request_id: esimRequest.id,
        from_status: 'REQUEST_CREATED',
        to_status: 'PROFILE_READY',
        note: `Mock SM-DP+ profile issued for ${targetOperator}. Activation code & QR generated.`,
        created_by: 'MOCK_SMDP_PROVISIONING_ENGINE'
      });

      return res.status(201).json({
        success: true,
        message: 'Mock eSIM profile successfully provisioned and ready for download!',
        requestId: esimRequest.id,
        requestCode: esimRequest.request_code,
        status: 'PROFILE_READY',
        activationCode: profile.activationCode,
        smdpServer: profile.smdpServer,
        iccid: profile.iccid,
        qrCodeUrl: profile.qrCodeUrl,
        operator: targetOperator,
        eid: eidValidation.cleanEid,
        plan: {
          id: plan.id,
          name: plan.plan_name,
          price: plan.price,
          data: plan.data_per_day,
          validity: `${plan.validity_days} Days`
        },
        disclaimer: 'This is a demonstration eSIM profile and cannot be used to activate a real mobile network subscription.'
      });
    } catch (err) {
      console.error('eSIM provisioning error:', err);
      return res.status(500).json({ success: false, message: 'SM-DP+ mock provisioning server encountered an error.' });
    }
  }

  /**
   * Get all activation requests for the authenticated user
   */
  static async getMyRequests(req, res) {
    try {
      const userId = req.user.id;
      const requests = db.find('esim_requests', r => r.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(req => {
          const device = db.findById('devices', req.device_id);
          const plan = db.findById('plans', req.plan_id);
          const payment = db.findOne('payments', p => p.request_id === req.id);
          return {
            ...req,
            device: device ? { name: device.device_name, type: device.device_type, os: device.os } : null,
            plan: plan ? { name: plan.plan_name, price: plan.price, data: plan.data_per_day, validity: plan.validity_days } : null,
            payment: payment ? { amount: payment.total_amount, status: payment.status, txnId: payment.transaction_id } : null
          };
        });

      return res.json({
        success: true,
        count: requests.length,
        requests
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve activation requests.' });
    }
  }

  /**
   * Get single activation request details by ID
   */
  static async getRequestById(req, res) {
    try {
      const { id } = req.params;
      const esimRequest = db.findById('esim_requests', id);

      if (!esimRequest) {
        return res.status(404).json({ success: false, message: 'Activation request not found.' });
      }

      // Check user authorization
      if (req.user.role !== 'admin' && esimRequest.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const device = db.findById('devices', esimRequest.device_id);
      const plan = db.findById('plans', esimRequest.plan_id);
      const payment = db.findOne('payments', p => p.request_id === esimRequest.id);
      const logs = db.find('activation_logs', l => l.request_id === esimRequest.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json({
        success: true,
        request: {
          ...esimRequest,
          device,
          plan,
          payment,
          logs
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to load activation details.' });
    }
  }

  /**
   * Demo Simulation Status Progression (allows testing any stage of the lifecycle)
   */
  static async updateDemoStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const VALID_STATUSES = [
        'REQUEST_CREATED',
        'OTP_VERIFIED',
        'PAYMENT_COMPLETED',
        'PROFILE_READY',
        'QR_CODE_READY',
        'INSTALLATION_PENDING',
        'ACTIVATED',
        'FAILED',
        'REJECTED'
      ];

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        });
      }

      const esimRequest = db.findById('esim_requests', id);
      if (!esimRequest) {
        return res.status(404).json({ success: false, message: 'Request not found.' });
      }

      const oldStatus = esimRequest.status;
      const updated = db.update('esim_requests', id, { status });

      // Add log
      db.insert('activation_logs', {
        id: `log-${uuidv4().slice(0, 8)}`,
        request_id: id,
        from_status: oldStatus,
        to_status: status,
        note: note || `Status updated to ${status} via demonstration control.`,
        created_by: req.user ? req.user.name : 'DEMO_CONTROLLER'
      });

      return res.json({
        success: true,
        message: `Activation status updated to ${status}.`,
        request: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update activation status.' });
    }
  }
}

export default EsimController;
