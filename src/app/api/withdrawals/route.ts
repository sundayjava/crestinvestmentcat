import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateReceiptId, formatDateTime } from '@/lib/utils';
import { sendWithdrawalReceipt } from '@/lib/email';
import { notifyAdminOfWithdrawal } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, dimeBankAccountNumber, dimeBankAccountName, additionalDetails } = body;

    // Validate input
    if (!userId || !amount || !dimeBankAccountNumber || !dimeBankAccountName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        dimeBankAccountNumber,
        dimeBankAccountName,
        additionalDetails: additionalDetails ? JSON.parse(JSON.stringify(additionalDetails)) : null,
        status: 'PENDING',
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        amount,
        description: `Withdrawal to Dime Bank ${dimeBankAccountNumber}`,
        metadata: JSON.parse(JSON.stringify({ withdrawalId: withdrawal.id })),
      },
    });

    // Notify admin via WhatsApp
    await notifyAdminOfWithdrawal({
      userName: user.name || user.email,
      userEmail: user.email,
      amount,
      bankAccount: dimeBankAccountNumber,
      timestamp: formatDateTime(new Date()),
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: 'New Withdrawal Request',
        message: `${user.name || user.email} requested withdrawal of $${amount}`,
        type: 'withdrawal',
        metadata: JSON.parse(JSON.stringify({ withdrawalId: withdrawal.id, userId, amount })),
      },
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully. Awaiting admin approval.',
      withdrawal,
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating withdrawal request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If userId is provided, fetch for specific user, otherwise fetch all (for admin)
    const withdrawals = await prisma.withdrawal.findMany({
      where: userId ? { userId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching withdrawals' },
      { status: 500 }
    );
  }
}
