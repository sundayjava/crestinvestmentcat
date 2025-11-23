import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        investorType: true,
        investableAssets: true,
        referralSource: true,
        comments: true,
        balance: true,
        hasDimeAccount: true,
        dimeBankAccountNumber: true,
        dimeBankAccountName: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            investments: true,
            withdrawals: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}
