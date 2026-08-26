/**
 * EID (eUICC-ID) Validation and Formatting Utility
 * Standard GSMA eSIM EID is exactly 32 hexadecimal or decimal digits, usually beginning with '89' (Telecom ID)
 */

export function validateEID(eid) {
  if (!eid || typeof eid !== 'string') {
    return {
      isValid: false,
      error: 'EID is required.'
    };
  }

  // Remove spaces, hyphens, and whitespace
  const cleanEid = eid.replace(/[\s-]/g, '').trim();

  if (cleanEid.length !== 32) {
    return {
      isValid: false,
      error: `EID must be exactly 32 digits long (currently ${cleanEid.length} characters).`
    };
  }

  const hexRegex = /^[0-9A-Fa-f]{32}$/;
  if (!hexRegex.test(cleanEid)) {
    return {
      isValid: false,
      error: 'EID contains invalid characters. Only numeric digits and hex characters (0-9, A-F) are allowed.'
    };
  }

  // Standard GSMA EID prefix warning/check (Telecom standard is 89)
  const isStandardTelecomPrefix = cleanEid.startsWith('89');

  return {
    isValid: true,
    cleanEid: cleanEid.toUpperCase(),
    isStandardTelecomPrefix,
    formatted: formatEID(cleanEid.toUpperCase())
  };
}

export function formatEID(eid) {
  if (!eid) return '';
  const clean = eid.replace(/[\s-]/g, '').toUpperCase();
  // Format as 8 groups of 4 digits
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

export function validatePhone(phone) {
  if (!phone) return { isValid: false, error: 'Mobile number is required.' };
  const clean = phone.replace(/[\s-+()]/g, '');
  if (!/^[6-9]\d{9}$/.test(clean) && !/^\d{10,12}$/.test(clean)) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number.' };
  }
  return { isValid: true, cleanPhone: clean };
}
