import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Get assets error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, symbol, type, description, currentPrice, minInvestment, imageUrl, benefits } = body;

    // Validate input
    if (!name || !symbol || !type || !currentPrice) {
      return NextResponse.json(
        { error: 'Name, symbol, type, and current price are required' },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        symbol,
        type,
        description,
        currentPrice,
        minInvestment: minInvestment || 10,
        imageUrl,
        benefits: benefits ? JSON.parse(JSON.stringify(benefits)) : null,
        priceHistory: JSON.parse(JSON.stringify([{ timestamp: Date.now(), price: currentPrice }])),
      },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Create asset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating asset' },
      { status: 500 }
    );
  }
}
