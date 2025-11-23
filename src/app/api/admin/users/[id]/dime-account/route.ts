import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDimeBankAccountDetails } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { accountNumber, accountName, additionalDetails } = body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        hasDimeAccount: true,
        dimeBankAccountNumber: accountNumber,
        dimeBankAccountName: accountName,
        dimeBankDetails: additionalDetails ? JSON.parse(JSON.stringify(additionalDetails)) : null,
      },
    });

    // Send email with account details
    await sendDimeBankAccountDetails(user.email, {
      name: user.name || user.email,
      accountNumber,
      accountName,
      additionalDetails,
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: id,
        title: 'Dime Bank Account Created',
        message: 'Your Dime Bank account has been created. Check your email for details.',
        type: 'system',
      },
    });

    return NextResponse.json({
      message: 'Dime Bank account created successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Create Dime account error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating Dime account' },
      { status: 500 }
    );
  }
}
