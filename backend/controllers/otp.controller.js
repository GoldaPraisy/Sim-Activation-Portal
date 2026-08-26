import OtpService from '../services/otpService.js';
import { validatePhone } from '../utils/eidValidator.js';

export class OtpController {
  /**
   * Request / Send 6-digit OTP to mobile number
   */
  static async sendOtp(req, res) {
    try {
      const { phone } = req.body;
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ success: false, message: phoneValidation.error });
      }

      const result = OtpService.generateOtp(phoneValidation.cleanPhone);
      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('OTP Send error:', err);
      return res.status(500).json({ success: false, message: 'Failed to dispatch simulated OTP.' });
    }
  }

  /**
   * Verify 6-digit OTP
   */
  static async verifyOtp(req, res) {
    try {
      const { phone, otpCode } = req.body;
      if (!phone || !otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Both phone number and 6-digit OTP code are required.'
        });
      }

      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ success: false, message: phoneValidation.error });
      }

      const result = OtpService.verifyOtp(phoneValidation.cleanPhone, otpCode);
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (err) {
      console.error('OTP Verification error:', err);
      return res.status(500).json({ success: false, message: 'Failed to verify OTP code.' });
    }
  }
}

export default OtpController;
