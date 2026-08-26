import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

export class OtpService {
  /**
   * Generates a new 6-digit OTP for a given phone number
   */
  static generateOtp(phone) {
    const cleanPhone = phone.replace(/[\s-+()]/g, '');
    
    // Generate 6-digit random number
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Invalidate any previous unused OTPs for this phone
    const existingOtps = db.find('otp_verifications', item => item.phone === cleanPhone && !item.is_verified);
    existingOtps.forEach(item => {
      db.update('otp_verifications', item.id, { is_verified: false, attempts: MAX_ATTEMPTS });
    });

    // Create new OTP record
    const otpRecord = db.insert('otp_verifications', {
      id: `otp-${uuidv4().slice(0, 8)}`,
      phone: cleanPhone,
      otp_code: otpCode,
      expires_at: expiresAt,
      is_verified: false,
      attempts: 0
    });

    const isDev = process.env.ENABLE_DEV_OTP !== 'false';

    return {
      otpId: otpRecord.id,
      phone: cleanPhone,
      expiresAt: otpRecord.expires_at,
      expirySeconds: OTP_EXPIRY_MINUTES * 60,
      devOtp: isDev ? otpCode : undefined, // Returned for simulated frontend demo helper
      message: `OTP sent successfully to +91 ${cleanPhone.slice(-10)}`
    };
  }

  /**
   * Verifies the provided 6-digit OTP
   */
  static verifyOtp(phone, enteredCode) {
    const cleanPhone = phone.replace(/[\s-+()]/g, '');
    const cleanCode = enteredCode ? enteredCode.toString().trim() : '';

    if (!cleanCode || cleanCode.length !== 6) {
      return {
        success: false,
        error: 'Please enter a valid 6-digit OTP code.'
      };
    }

    // Find the latest active OTP for this phone
    const candidateOtps = db.find('otp_verifications', item => item.phone === cleanPhone)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (!candidateOtps || candidateOtps.length === 0) {
      return {
        success: false,
        error: 'No active OTP found for this number. Please click "Resend OTP".'
      };
    }

    const latestOtp = candidateOtps[0];

    // Check if expired
    if (new Date() > new Date(latestOtp.expires_at)) {
      return {
        success: false,
        error: 'This OTP has expired. Please request a new code.'
      };
    }

    // Check attempt limit
    if (latestOtp.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }

    // Check code match
    if (latestOtp.otp_code !== cleanCode) {
      const newAttempts = (latestOtp.attempts || 0) + 1;
      db.update('otp_verifications', latestOtp.id, { attempts: newAttempts });
      const remaining = MAX_ATTEMPTS - newAttempts;
      return {
        success: false,
        error: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Maximum attempts reached.'}`
      };
    }

    // Success: Mark as verified
    db.update('otp_verifications', latestOtp.id, { is_verified: true });

    return {
      success: true,
      message: 'Mobile number verified successfully!',
      verifiedAt: new Date().toISOString()
    };
  }
}

export default OtpService;
