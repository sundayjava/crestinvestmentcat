import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateReceiptId, formatDateTime } from '@/lib/utils';
import { sendWithdrawalReceipt } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, adminId, adminNotes } = body; // action: 'approve' or 'reject'

    if (!action || !adminId) {
      return NextResponse.json(
        { error: 'Action and admin ID are required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'COMPLETED' : 'REJECTED';

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    if (status === 'COMPLETED') {
      // Check if user has sufficient balance
      if (withdrawal.user.balance < withdrawal.amount) {
        return NextResponse.json(
          { error: 'User has insufficient balance' },
          { status: 400 }
        );
      }

      // Deduct amount from user balance
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: {
            decrement: withdrawal.amount,
          },
        },
      });

      // Update withdrawal status
      await prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          processedBy: adminId,
          processedAt: new Date(),
          adminNotes,
        },
      });

      // Update transaction status
      await prisma.transaction.updateMany({
        where: {
          metadata: {
            path: ['withdrawalId'],
            equals: id,
          },
        },
        data: {
          status: 'COMPLETED',
          processedBy: adminId,
        },
      });

      // Generate and send receipt
      const receiptId = generateReceiptId();
      await sendWithdrawalReceipt(withdrawal.user.email, {
        name: withdrawal.user.name || withdrawal.user.email,
        receiptId,
        amount: withdrawal.amount,
        bankAccount: withdrawal.dimeBankAccountNumber,
        date: formatDateTime(new Date()),
        status: 'Completed',
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Completed',
          message: `Your withdrawal of $${withdrawal.amount} has been processed. Check your email for the receipt.`,
          type: 'withdrawal',
        },
      });
    } else if (status === 'REJECTED') {
      // Update withdrawal status
      await prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedBy: adminId,
          processedAt: new Date(),
          adminNotes,
        },
      });

      // Update transaction status
      await prisma.transaction.updateMany({
        where: {
          metadata: {
            path: ['withdrawalId'],
            equals: id,
          },
        },
        data: {
          status: 'REJECTED',
          processedBy: adminId,
        },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Rejected',
          message: `Your withdrawal request has been rejected. ${adminNotes || 'Please contact support.'}`,
          type: 'withdrawal',
        },
      });
    }

    return NextResponse.json({
      message: `Withdrawal ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing withdrawal' },
      { status: 500 }
    );
  }
}
