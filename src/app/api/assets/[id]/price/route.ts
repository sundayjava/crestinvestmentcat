import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentPrice } = body;

    if (!currentPrice) {
      return NextResponse.json(
        { error: 'Current price is required' },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Update price and add to price history
    const priceHistory = asset.priceHistory as any[] || [];
    priceHistory.push({ timestamp: Date.now(), price: currentPrice });

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        currentPrice,
        priceHistory: JSON.parse(JSON.stringify(priceHistory.slice(-100))), // Keep last 100 points
      },
    });

    // Update all active investments for this asset
    const investments = await prisma.investment.findMany({
      where: { assetId: id, isActive: true },
    });

    for (const investment of investments) {
      const currentValue = investment.quantity * currentPrice;
      const profitLoss = currentValue - investment.amount;

      await prisma.investment.update({
        where: { id: investment.id },
        data: {
          currentValue,
          profitLoss,
        },
      });

      // Update user balance with profit/loss
      await prisma.user.update({
        where: { id: investment.userId },
        data: {
          balance: {
            increment: profitLoss - investment.profitLoss, // Only add the difference
          },
        },
      });
    }

    return NextResponse.json({ asset: updatedAsset });
  } catch (error) {
    console.error('Update asset price error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating asset price' },
      { status: 500 }
    );
  }
}
