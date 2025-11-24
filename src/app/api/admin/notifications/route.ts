import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch notification history
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd store notification history in the database
    // For now, return mock data
    const notifications = [
      {
        id: '1',
        type: 'EMAIL',
        subject: 'Welcome to CrestCat',
        message: 'Thank you for joining our platform',
        recipient: 'all',
        status: 'SENT',
        sentAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: '2',
        type: 'WHATSAPP',
        subject: 'Investment Approved',
        message: 'Your investment has been approved',
        recipient: 'investors',
        status: 'SENT',
        sentAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Send notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipient, subject, message } = body;

    // Validate input
    if (!type || !recipient || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get recipient users based on filter
    let users: { id: string; email: string; name: string | null }[];
    switch (recipient) {
      case 'all':
        users = await prisma.user.findMany({
          where: { role: 'USER' },
          select: { id: true, email: true, name: true },
        });
        break;
      case 'verified':
        users = await prisma.user.findMany({
          where: { role: 'USER', emailVerified: true },
          select: { id: true, email: true, name: true },
        });
        break;
      case 'dime':
        users = await prisma.user.findMany({
          where: { role: 'USER', hasDimeAccount: true },
          select: { id: true, email: true, name: true },
        });
        break;
      case 'investors':
        users = await prisma.user.findMany({
          where: {
            role: 'USER',
            investments: {
              some: { isActive: true },
            },
          },
          select: { id: true, email: true, name: true },
        });
        break;
      default:
        users = [];
    }

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      );
    }

    // Send notifications based on type
    const promises = users.map(async (user: any) => {
      try {
        if (type === 'EMAIL' || type === 'BOTH') {
          // In production, integrate with email service (SendGrid, etc.)
          console.log(`Sending email to ${user.email}: ${subject}`);
          // await sendEmail(user.email, subject, message);
        }

        if (type === 'WHATSAPP' || type === 'BOTH') {
          // In production, integrate with WhatsApp API (Twilio, etc.)
          console.log(`Sending WhatsApp to ${user.name}: ${subject}`);
          // await sendWhatsApp(user.phone, message);
        }

        return { success: true, userId: user.id };
      } catch (error) {
        console.error(`Failed to send to user ${user.id}:`, error);
        return { success: false, userId: user.id };
      }
    });

    const results = await Promise.all(promises);
    const successCount = results.filter((r: any) => r.success).length;

    return NextResponse.json({
      message: 'Notifications sent',
      recipientCount: successCount,
      totalRecipients: users.length,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
