import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if asset has active investments
    const investmentCount = await prisma.investment.count({
      where: {
        assetId: id,
        isActive: true,
      },
    });

    if (investmentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete asset. It has ${investmentCount} active investment(s).` },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.asset.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting asset' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, symbol, type, description, currentPrice, minInvestment, imageUrl } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (symbol !== undefined) updateData.symbol = symbol;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (currentPrice !== undefined) updateData.currentPrice = currentPrice;
    if (minInvestment !== undefined) updateData.minInvestment = minInvestment;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Update asset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating asset' },
      { status: 500 }
    );
  }
}
