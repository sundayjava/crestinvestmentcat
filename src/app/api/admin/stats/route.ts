import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalUsers,
      totalInvestments,
      pendingWithdrawals,
      pendingDeposits,
      totalTransactionVolume,
      activeInvestments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.investment.count(),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.transaction.count({ where: { type: 'DEPOSIT', status: 'PENDING' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.investment.count({ where: { isActive: true } }),
    ]);

    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    const assetDistribution = await prisma.investment.groupBy({
      by: ['assetId'],
      _sum: {
        amount: true,
      },
      where: {
        isActive: true,
      },
    });

    // Get asset details for distribution
    const assetIds = assetDistribution.map((item: any) => item.assetId);
    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
    });

    const assetStats = assetDistribution.map((item: any) => {
      const asset = assets.find((a: any) => a.id === item.assetId);
      return {
        assetId: item.assetId,
        assetName: asset?.name || 'Unknown',
        assetSymbol: asset?.symbol || 'N/A',
        totalInvested: item._sum.amount || 0,
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalInvestments,
        pendingWithdrawals,
        pendingDeposits,
        totalTransactionVolume: totalTransactionVolume._sum.amount || 0,
        activeInvestments,
      },
      recentTransactions,
      assetDistribution: assetStats,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching stats' },
      { status: 500 }
    );
  }
}
