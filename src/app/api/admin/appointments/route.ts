import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching appointments' },
      { status: 500 }
    );
  }
}
