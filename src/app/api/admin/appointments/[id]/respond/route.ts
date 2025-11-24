import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminResponse, adminId } = await request.json();

    if (!adminResponse || !adminId) {
      return NextResponse.json(
        { error: 'Admin response and admin ID are required' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        adminResponse,
        respondedBy: adminId,
        respondedAt: new Date(),
        status: 'RESPONDED',
      },
    });

    // Create notification for the user if they have an account
    if (appointment.userId) {
      await prisma.notification.create({
        data: {
          userId: appointment.userId,
          title: 'Appointment Response',
          message: `Your appointment request has been responded to by admin.`,
          type: 'appointment',
          metadata: {
            appointmentId: appointment.id,
            response: adminResponse,
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Response sent successfully',
      appointment,
    });
  } catch (error) {
    console.error('Respond to appointment error:', error);
    return NextResponse.json(
      { error: 'An error occurred while responding to appointment' },
      { status: 500 }
    );
  }
}
