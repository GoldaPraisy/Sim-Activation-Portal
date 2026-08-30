import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Helper to dispatch SMS via Twilio REST API
 */
async function sendTwilioSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('⚠️ Twilio keys missing. Running in simulated fallback mode.');
    console.log(`[SMS SIMULATION to +91 ${to.slice(-10)}]: ${body}`);
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    // Normalize target phone format (assuming +91 for Indian subscribers if 10 digits)
    let formattedTo = to.trim().replace(/[\s-+()]/g, '');
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    } else if (!formattedTo.startsWith('+')) {
      // Add '+' if missing but country code present
      formattedTo = `+${formattedTo}`;
    }

    const params = new URLSearchParams();
    params.append('To', formattedTo);
    params.append('From', fromNumber);
    params.append('Body', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const resJson = await response.json();
    if (!response.ok) {
      throw new Error(resJson.message || `Twilio HTTP ${response.status}: ${resJson.detail || ''}`);
    }
    
    console.log(`✅ Real Twilio SMS sent to ${formattedTo}. SID: ${resJson.sid}`);
    return true;
  } catch (err) {
    console.error('❌ Twilio Gateway Failure:', err.message);
    return false;
  }
}

export class OtpService {
  /**
   * Generates a new 6-digit OTP for a given phone number
   */
  static async generateOtp(phone) {
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

    // Try sending real SMS
    const msgBody = `Your SIM Activation Portal verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`;
    const wasRealSmsSent = await sendTwilioSms(cleanPhone, msgBody);

    return {
      otpId: otpRecord.id,
      phone: cleanPhone,
      expiresAt: otpRecord.expires_at,
      expirySeconds: OTP_EXPIRY_MINUTES * 60,
      message: wasRealSmsSent 
        ? `OTP successfully sent to +91 ${cleanPhone.slice(-10)}`
        : `OTP sent to +91 ${cleanPhone.slice(-10)}`
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
