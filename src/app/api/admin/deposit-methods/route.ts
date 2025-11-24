import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all deposit methods
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { key: 'depositMethods' },
    });

    if (!settings) {
      return NextResponse.json({ depositMethods: [] });
    }

    return NextResponse.json({ depositMethods: settings.value });
  } catch (error) {
    console.error('Error fetching deposit methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposit methods' },
      { status: 500 }
    );
  }
}

// PUT - Update deposit methods
export async function PUT(request: NextRequest) {
  try {
    const { depositMethods } = await request.json();

    const updated = await prisma.systemSettings.upsert({
      where: { key: 'depositMethods' },
      update: {
        value: depositMethods,
      },
      create: {
        key: 'depositMethods',
        value: depositMethods,
        description: 'Available deposit methods and account details for investments',
      },
    });

    return NextResponse.json({ 
      message: 'Deposit methods updated successfully',
      depositMethods: updated.value 
    });
  } catch (error) {
    console.error('Error updating deposit methods:', error);
    return NextResponse.json(
      { error: 'Failed to update deposit methods' },
      { status: 500 }
    );
  }
}
