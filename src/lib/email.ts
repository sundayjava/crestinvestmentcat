import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD, 
  },
});

export async function sendOTPEmail(email: string, otp: string, name?: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Email Verification - OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${name || 'User'},</p>
              <p>Thank you for registering with ${process.env.NEXT_PUBLIC_APP_NAME}. Please use the following OTP code to verify your email address:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendDepositReceipt(
  email: string,
  receiptData: {
    name: string;
    receiptId: string;
    amount: number;
    assetName: string;
    date: string;
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Deposit Receipt - ${receiptData.receiptId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .receipt-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .receipt-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .amount { font-size: 24px; font-weight: bold; color: #667eea; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Deposit Receipt</h1>
              <p>Payment Confirmation</p>
            </div>
            <div class="content">
              <p>Dear ${receiptData.name},</p>
              <p>Your deposit has been received and is being processed. Below are the details of your transaction:</p>
              
              <div class="receipt-box">
                <div class="receipt-row">
                  <span class="label">Receipt ID:</span>
                  <span class="value">${receiptData.receiptId}</span>
                </div>
                <div class="receipt-row">
                  <span class="label">Date:</span>
                  <span class="value">${receiptData.date}</span>
                </div>
                <div class="receipt-row">
                  <span class="label">Asset:</span>
                  <span class="value">${receiptData.assetName}</span>
                </div>
                <div class="receipt-row">
                  <span class="label">Amount:</span>
                  <span class="amount">$${receiptData.amount.toFixed(2)}</span>
                </div>
              </div>
              
              <p>Your investment will be activated once the admin verifies your payment. You will receive another notification once your investment is confirmed.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWithdrawalReceipt(
  email: string,
  receiptData: {
    name: string;
    receiptId: string;
    amount: number;
    bankAccount: string;
    date: string;
    status: string;
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Withdrawal Receipt - ${receiptData.receiptId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .receipt-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .receipt-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .amount { font-size: 24px; font-weight: bold; color: #667eea; }
            .status { padding: 5px 15px; border-radius: 20px; background: #10b981; color: white; font-size: 14px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Withdrawal Processed</h1>
              <p>Transaction Complete</p>
            </div>
            <div class="content">
              <p>Dear ${receiptData.name},</p>
              <p>Your withdrawal request has been processed successfully. Please check your Dime Bank account for the funds.</p>
              
              <div class="receipt-box">
                <div class="receipt-row">
                  <span class="label">Receipt ID:</span>
                  <span class="value">${receiptData.receiptId}</span>
                </div>
                <div class="receipt-row">
                  <span class="label">Date:</span>
                  <span class="value">${receiptData.date}</span>
                </div>
                <div class="receipt-row">
                  <span class="label">Dime Bank Account:</span>
                  <span class="value">${receiptData.bankAccount}</span>
                </div>
                <div class="receipt-row">
                  <span class="label">Amount:</span>
                  <span class="amount">$${receiptData.amount.toFixed(2)}</span>
                </div>
                <div class="receipt-row">
                  <span class="label">Status:</span>
                  <span class="status">${receiptData.status}</span>
                </div>
              </div>
              
              <p>The funds should reflect in your Dime Bank account within 24-48 hours. If you haven't received the funds after this period, please contact our support team.</p>
              <p>If you don't have a Dime Bank account yet, please contact admin to create one for you.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendDimeBankAccountDetails(
  email: string,
  accountData: {
    name: string;
    accountNumber: string;
    accountName: string;
    additionalDetails?: any;
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your Dime Bank Account Details',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .account-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .account-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .account-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; display: block; margin-bottom: 5px; }
            .value { color: #333; font-size: 18px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dime Bank Account Created</h1>
              <p>Welcome to Dime Bank</p>
            </div>
            <div class="content">
              <p>Dear ${accountData.name},</p>
              <p>Your Dime Bank account has been successfully created by our admin team. Below are your account details:</p>
              
              <div class="account-box">
                <div class="account-row">
                  <span class="label">Account Number:</span>
                  <span class="value">${accountData.accountNumber}</span>
                </div>
                <div class="account-row">
                  <span class="label">Account Name:</span>
                  <span class="value">${accountData.accountName}</span>
                </div>
              </div>
              
              <p>Please keep these details safe. You will need them for withdrawal transactions.</p>
              <p>You can now proceed to make withdrawals using this Dime Bank account.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
