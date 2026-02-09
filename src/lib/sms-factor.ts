/**
 * SMS Factor API Integration
 * Documentation: https://dev.smsfactor.com/
 */

const SMS_FACTOR_API_URL = 'https://api.smsfactor.com';

interface SMSRecipient {
  value: string; // Phone number in format 33612345678 (without +)
}

interface SendSMSOptions {
  message: string;
  recipients: string[]; // Array of phone numbers
  sender?: string; // Sender name (max 11 chars, must be registered)
}

interface SMSFactorResponse {
  status: number;
  message: string;
  ticket?: string;
  cost?: number;
  credits?: number;
  total?: number;
  sent?: number;
  blacklisted?: number;
  duplicated?: number;
  invalid?: number;
}

interface CampaignResult {
  success: boolean;
  sent: number;
  failed: number;
  cost: number;
  ticket?: string;
  error?: string;
}

/**
 * Format phone number to SMS Factor format (remove + and spaces)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 0, assume French number and add 33
  if (cleaned.startsWith('0')) {
    cleaned = '33' + cleaned.substring(1);
  }
  
  // If doesn't start with country code, assume French
  if (cleaned.length === 9) {
    cleaned = '33' + cleaned;
  }
  
  return cleaned;
}

/**
 * Send SMS via SMS Factor API
 */
export async function sendSMS(options: SendSMSOptions): Promise<SMSFactorResponse> {
  const token = process.env.SMS_FACTOR_TOKEN;
  
  if (!token) {
    throw new Error('SMS_FACTOR_TOKEN is not configured');
  }

  const recipients = options.recipients.map(phone => ({
    value: formatPhoneNumber(phone)
  }));

  const payload = {
    sms: {
      message: {
        text: options.message,
        sender: options.sender || 'Orphelia',
      },
      recipients: {
        gsm: recipients
      }
    }
  };

  const response = await fetch(`${SMS_FACTOR_API_URL}/send`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'SMS sending failed');
  }

  return data;
}

/**
 * Send marketing campaign to multiple recipients
 */
export async function sendMarketingCampaign(
  message: string,
  phoneNumbers: string[],
  sender?: string
): Promise<CampaignResult> {
  try {
    // Filter out invalid phone numbers
    const validNumbers = phoneNumbers.filter(phone => {
      const formatted = formatPhoneNumber(phone);
      return formatted.length >= 10 && formatted.length <= 15;
    });

    if (validNumbers.length === 0) {
      return {
        success: false,
        sent: 0,
        failed: phoneNumbers.length,
        cost: 0,
        error: 'No valid phone numbers provided'
      };
    }

    const result = await sendSMS({
      message,
      recipients: validNumbers,
      sender,
    });

    console.log('SMS Factor API response:', JSON.stringify(result));

    // SMS Factor returns status 1 for success, but also check for sent count
    const isSuccess = result.status === 1 || (result.sent !== undefined && result.sent > 0);

    return {
      success: Boolean(isSuccess),
      sent: result.sent || (isSuccess ? validNumbers.length : 0),
      failed: (result.invalid || 0) + (result.blacklisted || 0) + (result.duplicated || 0),
      cost: result.cost || 0,
      ticket: result.ticket,
    };
  } catch (error: any) {
    return {
      success: false,
      sent: 0,
      failed: phoneNumbers.length,
      cost: 0,
      error: error.message,
    };
  }
}

/**
 * Get account credits balance
 */
export async function getCreditsBalance(): Promise<{ credits: number }> {
  const token = process.env.SMS_FACTOR_TOKEN;
  
  if (!token) {
    throw new Error('SMS_FACTOR_TOKEN is not configured');
  }

  const response = await fetch(`${SMS_FACTOR_API_URL}/credits`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get credits');
  }

  return { credits: data.credits || 0 };
}

/**
 * Simulate SMS sending (for testing without using credits)
 */
export async function simulateSMS(options: SendSMSOptions): Promise<SMSFactorResponse> {
  const token = process.env.SMS_FACTOR_TOKEN;
  
  if (!token) {
    throw new Error('SMS_FACTOR_TOKEN is not configured');
  }

  const recipients = options.recipients.map(phone => ({
    value: formatPhoneNumber(phone)
  }));

  const payload = {
    sms: {
      message: {
        text: options.message,
        sender: options.sender || 'Orphelia',
      },
      recipients: {
        gsm: recipients
      }
    }
  };

  const response = await fetch(`${SMS_FACTOR_API_URL}/send/simulate`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'SMS simulation failed');
  }

  return data;
}
