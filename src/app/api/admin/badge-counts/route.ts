import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Count new users (created in last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
        role: 'USER',
      },
    });

    // Count pending investments (newly created investments awaiting admin approval OR closure requests)
    const pendingInvestmentsCount = await prisma.investment.count({
      where: {
        OR: [
          // Closure requests pending
          {
            closureRequested: true,
            closedAt: null,
            closureRejectedAt: null,
          },
          // New investments awaiting approval (not yet active, not closed)
          {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
            isActive: false,
            closedAt: null,
          },
        ],
      },
    });

    // Count pending withdrawals
    const pendingWithdrawalsCount = await prisma.withdrawal.count({
      where: {
        status: 'PENDING',
      },
    });

    // Count pending appointments
    const pendingAppointmentsCount = await prisma.appointment.count({
      where: {
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      newUsers: newUsersCount,
      pendingInvestments: pendingInvestmentsCount,
      pendingWithdrawals: pendingWithdrawalsCount,
      pendingAppointments: pendingAppointmentsCount,
    });
  } catch (error) {
    console.error('Badge counts error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching badge counts' },
      { status: 500 }
    );
  }
}
