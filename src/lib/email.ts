import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: parseInt(process.env.EMAIL_SERVER_PORT || '587') === 465, // true for 465, false for other ports
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
            .header { background: linear-gradient(135deg, #bea425 0%, #000000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { background: #bea425; color: black; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
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
            .header { background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .receipt-box { background: white; border: 2px solid #bea425; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .receipt-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .amount { font-size: 24px; font-weight: bold; color: #bea425; }
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
            .header { background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .receipt-box { background: white; border: 2px solid #bea425; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .receipt-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .amount { font-size: 24px; font-weight: bold; color: #bea425; }
            .status { padding: 5px 15px; border-radius: 20px; background: #bea425; color: black; font-size: 14px; font-weight: bold; }
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
            .header { background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .account-box { background: white; border: 2px solid #bea425; border-radius: 8px; padding: 20px; margin: 20px 0; }
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

export async function sendInvestmentApprovalEmail(
  email: string,
  investmentData: {
    name: string;
    assetName: string;
    amount: number;
    quantity: number;
    purchasePrice: number;
    date: string;
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Investment Approved - ${investmentData.assetName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .investment-box { background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .investment-row { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
            .investment-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; font-weight: 600; }
            .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
            .cta-button { background: #bea425; color: black; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Investment Approved!</h1>
              <p>Your investment is now active</p>
            </div>
            <div class="content">
              <p>Dear ${investmentData.name},</p>
              <p>Great news! Your investment has been reviewed and <strong>approved</strong> by our admin team.</p>
              
              <div class="success-badge">✓ APPROVED & ACTIVE</div>
              
              <div class="investment-box">
                <div class="investment-row">
                  <span class="label">Asset:</span>
                  <span class="value">${investmentData.assetName}</span>
                </div>
                <div class="investment-row">
                  <span class="label">Investment Amount:</span>
                  <span class="value">$${investmentData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="investment-row">
                  <span class="label">Quantity:</span>
                  <span class="value">${investmentData.quantity.toFixed(4)} units</span>
                </div>
                <div class="investment-row">
                  <span class="label">Purchase Price:</span>
                  <span class="value">$${investmentData.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="investment-row">
                  <span class="label">Approval Date:</span>
                  <span class="value">${investmentData.date}</span>
                </div>
              </div>
              
              <p>Your investment is now active and you can track its performance in your dashboard.</p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">View Dashboard</a>
              </center>
              
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                <strong>What's Next?</strong><br>
                • Monitor your investment performance in real-time<br>
                • Track profit/loss updates<br>
                • Manage your portfolio from your dashboard
              </p>
            </div>
            <div class="footer">
              <p>Thank you for investing with ${process.env.NEXT_PUBLIC_APP_NAME}!</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInvestmentRejectionEmail(
  email: string,
  investmentData: {
    name: string;
    assetName: string;
    amount: number;
    date: string;
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Investment Status - ${investmentData.assetName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .investment-box { background: white; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .investment-row { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
            .investment-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; font-weight: 600; }
            .warning-badge { background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
            .cta-button { background: #bea425; color: black; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .support-box { background: #fef3c7; border-left: 4px solid #bea425; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Investment Status Update</h1>
              <p>Action Required</p>
            </div>
            <div class="content">
              <p>Dear ${investmentData.name},</p>
              <p>We regret to inform you that your recent investment submission could not be approved at this time.</p>
              
              <div class="warning-badge">NOT APPROVED</div>
              
              <div class="investment-box">
                <div class="investment-row">
                  <span class="label">Asset:</span>
                  <span class="value">${investmentData.assetName}</span>
                </div>
                <div class="investment-row">
                  <span class="label">Investment Amount:</span>
                  <span class="value">$${investmentData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="investment-row">
                  <span class="label">Review Date:</span>
                  <span class="value">${investmentData.date}</span>
                </div>
              </div>
              
              <div class="support-box">
                <strong>Need Assistance?</strong><br>
                Please contact our support team for more information about this decision. Our team is here to help you understand the next steps.
              </div>
              
              <p><strong>Common reasons for rejection:</strong></p>
              <ul style="color: #666;">
                <li>Invalid or unclear deposit proof</li>
                <li>Deposit amount mismatch</li>
                <li>Incomplete transaction information</li>
                <li>Payment verification issues</li>
              </ul>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">Contact Support</a>
              </center>
              
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                You can submit a new investment after resolving any issues with our support team.
              </p>
            </div>
            <div class="footer">
              <p>If you have questions, please don't hesitate to reach out to our support team.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInvestmentClosureRequestEmail(
  adminEmail: string,
  userName: string,
  assetName: string,
  currentValue: number,
  profitLoss: number,
  investmentId: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: '🔔 New Investment Closure Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #ffffff; padding: 30px; }
            .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { color: #6b7280; font-weight: 500; }
            .detail-value { color: #111827; font-weight: 600; }
            .profit { color: #10b981; }
            .loss { color: #ef4444; }
            .cta-button { 
              display: inline-block;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Investment Closure Request</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Action required for approval</p>
            </div>
            <div class="content">
              <div class="info-box">
                <strong>📋 Review Required</strong>
                <p style="margin: 5px 0 0 0;">A user has requested to close their investment position.</p>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">User</span>
                  <span class="detail-value">${userName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Asset</span>
                  <span class="detail-value">${assetName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Current Value</span>
                  <span class="detail-value">$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Profit/Loss</span>
                  <span class="detail-value ${profitLoss >= 0 ? 'profit' : 'loss'}">
                    ${profitLoss >= 0 ? '+' : ''}$${Math.abs(profitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <p style="color: #6b7280; margin: 20px 0;">
                Please review this closure request in the admin dashboard. Once approved, the current value will be transferred to the user's withdrawable balance.
              </p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/investments" class="cta-button">Review Request</a>
              </center>
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

export async function sendInvestmentClosureApprovedEmail(
  userEmail: string,
  userName: string,
  assetName: string,
  originalAmount: number,
  closedValue: number,
  profitLoss: number,
  newBalance: number
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: '✅ Investment Closure Approved',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #ffffff; padding: 30px; }
            .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { color: #6b7280; font-weight: 500; }
            .detail-value { color: #111827; font-weight: 600; }
            .highlight { background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .highlight-value { font-size: 32px; font-weight: bold; margin: 10px 0; }
            .profit { color: #10b981; }
            .loss { color: #ef4444; }
            .cta-button { 
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Investment Closed Successfully</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your funds are now available</p>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              
              <div class="success-box">
                <strong>🎉 Closure Approved!</strong>
                <p style="margin: 5px 0 0 0;">Your investment closure request has been approved and processed.</p>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Asset</span>
                  <span class="detail-value">${assetName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Original Investment</span>
                  <span class="detail-value">$${originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Closed Value</span>
                  <span class="detail-value">$${closedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Profit/Loss</span>
                  <span class="detail-value ${profitLoss >= 0 ? 'profit' : 'loss'}">
                    ${profitLoss >= 0 ? '+' : ''}$${Math.abs(profitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div class="highlight">
                <div>Your New Balance</div>
                <div class="highlight-value">$${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style="font-size: 14px; opacity: 0.9;">Available for withdrawal</div>
              </div>

              <p style="color: #6b7280;">
                The investment value has been transferred to your account balance. You can now withdraw these funds or reinvest them in other opportunities.
              </p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">View Dashboard</a>
              </center>
            </div>
            <div class="footer">
              <p>Thank you for investing with ${process.env.NEXT_PUBLIC_APP_NAME}!</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInvestmentClosureRejectedEmail(
  userEmail: string,
  userName: string,
  assetName: string,
  currentValue: number,
  rejectionNotes?: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: '❌ Investment Closure Request Rejected',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #ffffff; padding: 30px; }
            .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { color: #6b7280; font-weight: 500; }
            .detail-value { color: #111827; font-weight: 600; }
            .notes-box { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .cta-button { 
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Closure Request Not Approved</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your investment remains active</p>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              
              <div class="warning-box">
                <strong>⚠️ Request Rejected</strong>
                <p style="margin: 5px 0 0 0;">Your investment closure request has been reviewed and not approved at this time.</p>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Asset</span>
                  <span class="detail-value">${assetName}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Current Value</span>
                  <span class="detail-value">$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              ${rejectionNotes ? `
                <div class="notes-box">
                  <strong>📝 Admin Notes:</strong>
                  <p style="margin: 10px 0 0 0; color: #78350f;">${rejectionNotes}</p>
                </div>
              ` : ''}

              <p style="color: #6b7280;">
                Your investment will remain active. Common reasons for rejection include:
              </p>
              <ul style="color: #6b7280;">
                <li>Market conditions require holding period</li>
                <li>Minimum investment duration not met</li>
                <li>Pending transactions or processing</li>
                <li>Administrative review required</li>
              </ul>

              <p style="color: #6b7280;">
                You can submit a new closure request at any time or contact our support team for more information.
              </p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">Contact Support</a>
              </center>
            </div>
            <div class="footer">
              <p>If you have questions, please don't hesitate to reach out to our support team.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
