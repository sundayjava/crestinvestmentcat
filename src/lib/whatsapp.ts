export async function sendWhatsAppNotification(message: string, phoneNumber?: string) {
  const number = phoneNumber || process.env.WHATSAPP_ADMIN_NUMBER;
  
  if (!number) {
    console.error('WhatsApp number not configured');
    return;
  }

  // Format the message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `${process.env.WHATSAPP_API_URL}?phone=${number}&text=${encodedMessage}`;

  // In production, you would integrate with WhatsApp Business API
  // For now, we'll just log and return the URL
  console.log('WhatsApp notification:', message);
  console.log('WhatsApp URL:', whatsappUrl);

  // You can integrate with services like:
  // - Twilio WhatsApp API
  // - WhatsApp Business API
  // - Other third-party services

  return whatsappUrl;
}

export async function notifyAdminOfDeposit(depositData: {
  userName: string;
  userEmail: string;
  amount: number;
  assetName: string;
  timestamp: string;
}) {
  const message = `
🔔 NEW DEPOSIT ALERT

User: ${depositData.userName}
Email: ${depositData.userEmail}
Asset: ${depositData.assetName}
Amount: $${depositData.amount.toFixed(2)}
Time: ${depositData.timestamp}

Please review and approve this deposit in the admin dashboard.
  `.trim();

  return sendWhatsAppNotification(message);
}

export async function notifyAdminOfWithdrawal(withdrawalData: {
  userName: string;
  userEmail: string;
  amount: number;
  bankAccount: string;
  timestamp: string;
}) {
  const message = `
💰 NEW WITHDRAWAL REQUEST

User: ${withdrawalData.userName}
Email: ${withdrawalData.userEmail}
Amount: $${withdrawalData.amount.toFixed(2)}
Dime Bank: ${withdrawalData.bankAccount}
Time: ${withdrawalData.timestamp}

Please process this withdrawal in the admin dashboard.
  `.trim();

  return sendWhatsAppNotification(message);
}
