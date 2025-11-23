import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, preferredDate, preferredTime, message } = body;

    // Validation
    if (!name || !email || !phone || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedMessage = message ? sanitizeInput(message) : '';

    // Validate email
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!isValidPhone(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const appointmentDate = new Date(preferredDate);
    const now = new Date();
    if (appointmentDate < now) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        preferredDate: appointmentDate,
        preferredTime: preferredTime,
        message: sanitizedMessage,
        status: 'PENDING',
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    return NextResponse.json(
      {
        message: 'Appointment booked successfully',
        appointment: {
          id: appointment.id,
          name: appointment.name,
          email: appointment.email,
          preferredDate: appointment.preferredDate,
          preferredTime: appointment.preferredTime,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Appointment booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where = status ? { status: status as any } : {};

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { preferredDate: 'asc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
