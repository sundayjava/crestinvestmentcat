import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, quantity, purchasePrice, currentValue } = body;

    // Update the investment
    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        quantity: quantity ? parseFloat(quantity) : undefined,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        currentValue: currentValue ? parseFloat(currentValue) : undefined,
        profitLoss: currentValue && amount ? parseFloat(currentValue) - parseFloat(amount) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            symbol: true,
            currentPrice: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      investment: updatedInvestment,
    });
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json(
      { error: 'Failed to update investment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            symbol: true,
            currentPrice: true,
            description: true,
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ investment });
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment' },
      { status: 500 }
    );
  }
}
