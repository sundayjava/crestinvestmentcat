import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateReceiptId, formatDateTime } from '@/lib/utils';
import { sendDepositReceipt } from '@/lib/email';
import { notifyAdminOfDeposit } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, assetId, amount, depositMethod, depositProof } = body;

    // Validate input
    if (!userId || !assetId || !amount) {
      return NextResponse.json(
        { error: 'User ID, asset ID, and amount are required' },
        { status: 400 }
      );
    }

    // Get user and asset
    const [user, asset] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.asset.findUnique({ where: { id: assetId } }),
    ]);

    if (!user || !asset) {
      return NextResponse.json(
        { error: 'User or asset not found' },
        { status: 404 }
      );
    }

    // Check minimum investment
    if (amount < asset.minInvestment) {
      return NextResponse.json(
        { error: `Minimum investment for ${asset.name} is $${asset.minInvestment}` },
        { status: 400 }
      );
    }

    // Calculate quantity
    const quantity = amount / asset.currentPrice;
    const currentValue = amount;

    // Create investment
    const investment = await prisma.investment.create({
      data: {
        userId,
        assetId,
        amount,
        quantity,
        purchasePrice: asset.currentPrice,
        currentValue,
        depositMethod,
        depositProof,
        isActive: false, // Will be activated by admin
      },
      include: {
        asset: true,
      },
    });

    // Create transaction record
    const receiptId = generateReceiptId();
    await prisma.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        status: 'PENDING',
        amount,
        description: `Investment in ${asset.name}`,
        metadata: JSON.parse(JSON.stringify({ 
          investmentId: investment.id,
          assetName: asset.name,
          receiptId,
        })),
      },
    });

    // Send deposit receipt to user
    await sendDepositReceipt(user.email, {
      name: user.name || user.email,
      receiptId,
      amount,
      assetName: asset.name,
      date: formatDateTime(new Date()),
    });

    // Notify admin via WhatsApp
    await notifyAdminOfDeposit({
      userName: user.name || user.email,
      userEmail: user.email,
      amount,
      assetName: asset.name,
      timestamp: formatDateTime(new Date()),
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: 'New Deposit',
        message: `${user.name || user.email} deposited $${amount} for ${asset.name}`,
        type: 'deposit',
        metadata: JSON.parse(JSON.stringify({ investmentId: investment.id, userId, amount })),
      },
    });

    return NextResponse.json({
      message: 'Investment created successfully. Awaiting admin approval.',
      investment,
      receiptId,
    });
  } catch (error) {
    console.error('Create investment error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating investment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If userId is provided, fetch for that user only
    // If not, fetch all investments (for admin)
    const investments = await prisma.investment.findMany({
      where: userId ? { userId } : {},
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            symbol: true,
            currentPrice: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ investments });
  } catch (error) {
    console.error('Get investments error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching investments' },
      { status: 500 }
    );
  }
}
