import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SMDP_SERVER = process.env.SMDP_SERVER || 'smdp.telecom-demo.io';

export class MockSmdpService {
  /**
   * Generates a realistic mock GSMA SM-DP+ eSIM profile
   * GSMA LPA Activation String Format:
   * LPA:1$<SMDP+ Server Address>$<Matching ID / Activation Code>
   */
  static async provisionProfile({
    userId,
    eid,
    device,
    planId,
    operator = 'Demo Telecom',
    msisdn = '9876543210'
  }) {
    // Generate unique matching ID for SM-DP+ profile download
    const matchingCode = `ACT-${operator.toUpperCase().replace(/\s+/g, '')}-${uuidv4().slice(0, 8).toUpperCase()}`;
    const smdpServer = DEFAULT_SMDP_SERVER;
    const lpaActivationCode = `LPA:1$${smdpServer}$${matchingCode}`;
    
    // Generate simulated ICCID (Integrated Circuit Card Identifier)
    const iccid = `8991${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;

    // Generate high-resolution QR code data URL from the LPA string
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(lpaActivationCode, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generating QR code for LPA profile:', err);
    }

    return {
      profileStatus: 'PROFILE_READY',
      matchingCode,
      activationCode: lpaActivationCode,
      smdpServer,
      iccid,
      qrCodeUrl: qrCodeDataUrl,
      eid: eid.toUpperCase(),
      operator,
      msisdn,
      provisionedAt: new Date().toISOString(),
      metadata: {
        networkTechnology: '5G SA / LTE Advanced',
        roamingAllowed: true,
        apn: `${operator.toLowerCase().replace(/\s+/g, '')}.telecom.net`,
        isDemoProfile: true,
        disclaimer: 'This is a demonstration eSIM profile and cannot be used to activate a real mobile network subscription.'
      }
    };
  }

  /**
   * Generates a human-friendly request tracking code e.g. REQ-2026-84920
   */
  static generateRequestCode() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `REQ-${year}-${randomNum}`;
  }
}

export default MockSmdpService;
