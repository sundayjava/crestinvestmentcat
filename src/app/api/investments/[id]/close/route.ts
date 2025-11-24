import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { sendInvestmentClosureRequestEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

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

    // Verify the user owns this investment
    if (investment.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this investment' },
        { status: 403 }
      );
    }

    if (!investment.isActive) {
      return NextResponse.json(
        { error: 'Investment is not active' },
        { status: 400 }
      );
    }

    if (investment.closureRequested) {
      return NextResponse.json(
        { error: 'Closure already requested for this investment' },
        { status: 400 }
      );
    }

    // Mark investment as closure requested (awaiting admin approval)
    await prisma.investment.update({
      where: { id },
      data: {
        closureRequested: true,
        closureRequestedAt: new Date(),
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: 'Investment Closure Request',
        message: `${investment.user.name || investment.user.email} requested to close investment in ${investment.asset.name} worth $${investment.currentValue.toFixed(2)}`,
        type: 'investment',
        metadata: JSON.parse(JSON.stringify({ 
          investmentId: investment.id,
          userId: investment.userId,
          currentValue: investment.currentValue,
        })),
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: investment.userId,
        title: 'Closure Request Submitted',
        message: `Your request to close ${investment.asset.name} investment has been submitted and is awaiting admin approval.`,
        type: 'investment',
      },
    });

    // Send email notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
      if (adminEmail) {
        await sendInvestmentClosureRequestEmail(
          adminEmail,
          investment.user.name || investment.user.email,
          investment.asset.name,
          investment.currentValue,
          investment.currentValue - investment.amount,
          investment.id
        );
      }
    } catch (emailError) {
      console.error('Failed to send closure request email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Investment closure request submitted successfully. Awaiting admin approval.',
      success: true,
    });
  } catch (error) {
    console.error('Request investment closure error:', error);
    return NextResponse.json(
      { error: 'An error occurred while requesting investment closure' },
      { status: 500 }
    );
  }
}
