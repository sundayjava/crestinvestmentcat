import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { balance, operation } = body; // operation: 'set', 'increase', 'decrease'

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let newBalance = user.balance;

    if (operation === 'set') {
      newBalance = balance;
    } else if (operation === 'increase') {
      newBalance = user.balance + balance;
    } else if (operation === 'decrease') {
      newBalance = user.balance - balance;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { balance: newBalance },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: id,
        type: 'ADMIN_ADJUSTMENT',
        status: 'COMPLETED',
        amount: balance,
        description: `Admin balance adjustment: ${operation}`,
        metadata: JSON.parse(JSON.stringify({
          previousBalance: user.balance,
          newBalance,
          operation,
        })),
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: id,
        title: 'Balance Updated',
        message: `Your balance has been updated by admin. New balance: $${newBalance.toFixed(2)}`,
        type: 'system',
      },
    });

    return NextResponse.json({
      message: 'Balance updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user balance error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating balance' },
      { status: 500 }
    );
  }
}
