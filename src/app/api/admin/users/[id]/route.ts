import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        role: true,
        hasDimeAccount: true,
        dimeBankAccountNumber: true,
        dimeBankAccountName: true,
        dimeBankDetails: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            investments: true,
            withdrawals: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user' },
      { status: 500 }
    );
  }
}

// PATCH update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with any provided fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.province !== undefined && { province: body.province }),
        ...(body.postalCode !== undefined && { postalCode: body.postalCode }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.investorType !== undefined && { investorType: body.investorType }),
        ...(body.investableAssets !== undefined && { investableAssets: body.investableAssets }),
        ...(body.referralSource !== undefined && { referralSource: body.referralSource }),
        ...(body.comments !== undefined && { comments: body.comments }),
        ...(body.balance !== undefined && { balance: body.balance }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.emailVerified !== undefined && { emailVerified: body.emailVerified }),
        ...(body.hasDimeAccount !== undefined && { hasDimeAccount: body.hasDimeAccount }),
        ...(body.dimeBankAccountNumber !== undefined && { dimeBankAccountNumber: body.dimeBankAccountNumber }),
        ...(body.dimeBankAccountName !== undefined && { dimeBankAccountName: body.dimeBankAccountName }),
      },
    });

    // Create notification for significant changes
    if (body.isActive !== undefined && body.isActive !== user.isActive) {
      await prisma.notification.create({
        data: {
          userId: id,
          title: body.isActive ? 'Account Activated' : 'Account Disabled',
          message: body.isActive 
            ? 'Your account has been activated by admin. You can now access all features.' 
            : 'Your account has been disabled by admin. Please contact support for assistance.',
          type: 'system',
        },
      });
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting user' },
      { status: 500 }
    );
  }
}
