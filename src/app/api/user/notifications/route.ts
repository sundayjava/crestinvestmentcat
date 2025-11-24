import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent notifications
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId, userId } = await request.json();

    if (notificationId) {
      // Mark single notification as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    } else if (userId) {
      // Mark all notifications as read for user
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or userId is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Notification(s) marked as read' });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating notification' },
      { status: 500 }
    );
  }
}
