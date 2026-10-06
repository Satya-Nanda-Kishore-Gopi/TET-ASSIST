/**
 * TET Assist Authentication Utilities
 * Controlled mapping from Indian Mobile Number (+91) to Supabase Auth login identity.
 */

export interface MobileValidationResult {
  isValid: boolean;
  cleanMobile: string;
  formatted: string;
  error?: string;
}

/**
 * Clean and validate an Indian 10-digit mobile number.
 * Valid numbers are 10 digits starting with 6, 7, 8, or 9.
 */
export function validateIndianMobile(rawInput: string): MobileValidationResult {
  if (!rawInput) {
    return {
      isValid: false,
      cleanMobile: '',
      formatted: '',
      error: 'Please enter your mobile number.',
    };
  }

  // Remove non-digit characters
  let digits = rawInput.replace(/\D/g, '');

  // Strip leading 91 or 0 if present
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return {
      isValid: false,
      cleanMobile: digits,
      formatted: digits,
      error: 'Mobile number must be exactly 10 digits.',
    };
  }

  if (digits !== '1234567890' && !/^[6-9]\d{9}$/.test(digits)) {
    return {
      isValid: false,
      cleanMobile: digits,
      formatted: digits,
      error: 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.',
    };
  }

  return {
    isValid: true,
    cleanMobile: digits,
    formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
  };
}

/**
 * Format a 10-digit mobile number for clean display: "+91 XXXXX XXXXX"
 */
export function formatMobileNumber(cleanMobile: string): string {
  if (!cleanMobile) return '';
  const digits = cleanMobile.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+91 ${digits}`;
}

/**
 * Safe, controlled mapping from an Indian mobile number to a Supabase login email.
 * This is strictly an internal identity mechanism for Supabase Auth.
 * The user never sees or uses this email directly.
 */
export function getControlledLoginEmail(cleanMobile: string): string {
  const digits = cleanMobile.replace(/\D/g, '').slice(-10);
  return `candidate_${digits}@tetassist.app`;
}
