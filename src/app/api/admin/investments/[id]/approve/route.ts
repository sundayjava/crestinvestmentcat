import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminId } = body; // status: 'APPROVED' or 'REJECTED'

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

    if (status === 'APPROVED') {
      // Activate investment
      await prisma.investment.update({
        where: { id },
        data: { isActive: true },
      });

      // Update transaction status
      await prisma.transaction.updateMany({
        where: {
          metadata: {
            path: ['investmentId'],
            equals: id,
          },
        },
        data: {
          status: 'APPROVED',
          processedBy: adminId,
        },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: investment.userId,
          title: 'Investment Approved',
          message: `Your investment in ${investment.asset.name} has been approved and activated.`,
          type: 'investment',
        },
      });
    } else if (status === 'REJECTED') {
      // Mark investment as inactive
      await prisma.investment.update({
        where: { id },
        data: { isActive: false },
      });

      // Update transaction status
      await prisma.transaction.updateMany({
        where: {
          metadata: {
            path: ['investmentId'],
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
          userId: investment.userId,
          title: 'Investment Rejected',
          message: `Your investment in ${investment.asset.name} has been rejected. Please contact support.`,
          type: 'investment',
        },
      });
    }

    return NextResponse.json({
      message: `Investment ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Approve investment error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing investment' },
      { status: 500 }
    );
  }
}
