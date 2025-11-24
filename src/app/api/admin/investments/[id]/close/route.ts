import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { sendInvestmentClosureApprovedEmail, sendInvestmentClosureRejectedEmail } from '@/lib/email';

// Approve closure - transfer money to user balance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminId, notes } = body;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        user: true,
        asset: true,
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    if (!investment.closureRequested) {
      return NextResponse.json(
        { error: 'No closure request found for this investment' },
        { status: 400 }
      );
    }

    // Transfer current value to user balance
    const updatedUser = await prisma.user.update({
      where: { id: investment.userId },
      data: {
        balance: {
          increment: investment.currentValue,
        },
      },
    });

    // Mark investment as closed and remove from approval list
    await prisma.investment.update({
      where: { id },
      data: {
        isActive: false,
        closedAt: new Date(),
        closureApprovedBy: adminId,
        closureNotes: notes,
        closureRequested: false,
      },
    });

    // Create transaction record for the closure
    await prisma.transaction.create({
      data: {
        userId: investment.userId,
        type: 'INVESTMENT',
        status: 'COMPLETED',
        amount: investment.currentValue,
        description: `Investment closure: ${investment.asset.name} - Profit/Loss: $${investment.profitLoss.toFixed(2)}`,
        metadata: JSON.parse(JSON.stringify({
          investmentId: investment.id,
          assetName: investment.asset.name,
          originalAmount: investment.amount,
          closureValue: investment.currentValue,
          profitLoss: investment.profitLoss,
        })),
        processedBy: adminId,
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: investment.userId,
        title: 'Investment Closed',
        message: `Your ${investment.asset.name} investment has been closed. $${investment.currentValue.toFixed(2)} has been added to your balance.`,
        type: 'investment',
      },
    });

    // Send email notification to user
    try {
      await sendInvestmentClosureApprovedEmail(
        investment.user.email,
        investment.user.name || investment.user.email,
        investment.asset.name,
        investment.amount,
        investment.currentValue,
        investment.currentValue - investment.amount,
        updatedUser.balance
      );
    } catch (emailError) {
      console.error('Failed to send closure approved email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Investment closure approved successfully',
      success: true,
      newBalance: updatedUser.balance,
    });
  } catch (error) {
    console.error('Approve investment closure error:', error);
    return NextResponse.json(
      { error: 'An error occurred while approving investment closure' },
      { status: 500 }
    );
  }
}

// Reject closure request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        user: true,
        asset: true,
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    if (!investment.closureRequested) {
      return NextResponse.json(
        { error: 'No closure request found for this investment' },
        { status: 400 }
      );
    }

    // Reject the closure request
    await prisma.investment.update({
      where: { id },
      data: {
        closureRequested: false,
        closureRejectedAt: new Date(),
        closureNotes: notes,
        closureRequestedAt: null,
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: investment.userId,
        title: 'Investment Closure Rejected',
        message: `Your request to close ${investment.asset.name} investment has been rejected. ${notes || 'Please contact support for more information.'}`,
        type: 'investment',
      },
    });

    // Send email notification to user
    try {
      await sendInvestmentClosureRejectedEmail(
        investment.user.email,
        investment.user.name || investment.user.email,
        investment.asset.name,
        investment.currentValue,
        notes
      );
    } catch (emailError) {
      console.error('Failed to send closure rejected email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Investment closure request rejected',
      success: true,
    });
  } catch (error) {
    console.error('Reject investment closure error:', error);
    return NextResponse.json(
      { error: 'An error occurred while rejecting investment closure' },
      { status: 500 }
    );
  }
}
