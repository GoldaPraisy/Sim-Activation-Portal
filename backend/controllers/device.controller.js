import db from '../config/db.js';
import { validateEID } from '../utils/eidValidator.js';
import { v4 as uuidv4 } from 'uuid';

export class DeviceController {
  /**
   * Get all registered devices for the authenticated user
   */
  static async getMyDevices(req, res) {
    try {
      const userId = req.user.id;
      const devices = db.find('devices', d => d.user_id === userId);
      return res.json({ success: true, count: devices.length, devices });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve registered devices.' });
    }
  }

  /**
   * Register a new eSIM-capable device
   */
  static async registerDevice(req, res) {
    try {
      const userId = req.user.id;
      const { device_name, device_model, os, device_type, eid, imei } = req.body;

      if (!device_name || !os || !device_type || !eid) {
        return res.status(400).json({
          success: false,
          message: 'Device name, operating system, device type, and 32-digit EID are required.'
        });
      }

      // Validate 32-digit EID format
      const eidValidation = validateEID(eid);
      if (!eidValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: eidValidation.error
        });
      }

      // Check if EID is already registered under this user
      const existingDevice = db.findOne('devices', d => d.user_id === userId && d.eid === eidValidation.cleanEid);
      if (existingDevice) {
        return res.status(409).json({
          success: false,
          message: 'This device EID is already registered to your account.'
        });
      }

      const newDevice = db.insert('devices', {
        id: `dev-${uuidv4().slice(0, 8)}`,
        user_id: userId,
        device_name: device_name.trim(),
        device_model: (device_model || device_name).trim(),
        os: os.trim(),
        device_type: device_type, // 'Android', 'iPhone', 'iPad', 'Other'
        eid: eidValidation.cleanEid,
        imei: imei ? imei.trim() : null
      });

      return res.status(201).json({
        success: true,
        message: 'Device registered successfully with eSIM compatibility verified!',
        device: newDevice
      });
    } catch (err) {
      console.error('Device registration error:', err);
      return res.status(500).json({ success: false, message: 'Failed to register device.' });
    }
  }

  /**
   * Delete a registered device
   */
  static async deleteDevice(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const device = db.findById('devices', id);
      if (!device) {
        return res.status(404).json({ success: false, message: 'Device not found.' });
      }

      if (device.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to remove this device.' });
      }

      db.delete('devices', id);
      return res.json({ success: true, message: 'Device removed successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete device.' });
    }
  }

  /**
   * Validate EID endpoint for live client form feedback
   */
  static async validateEIDEndpoint(req, res) {
    const { eid } = req.body;
    const result = validateEID(eid);
    return res.json(result);
  }
}

export default DeviceController;
