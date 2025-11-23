import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateOTP } from '@/lib/utils';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      phone,
      company,
      address,
      city,
      province,
      postalCode,
      country,
      investorType,
      investableAssets,
      referralSource,
      comments,
      hasDimeAccount, 
      dimeBankDetails 
    } = body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Email, password, name, and phone are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all profile fields
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        company: company || null,
        address: address || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        country: country || 'South Africa',
        investorType: investorType || null,
        investableAssets: investableAssets || null,
        referralSource: referralSource || null,
        comments: comments || null,
        hasDimeAccount: hasDimeAccount || false,
        dimeBankAccountNumber: dimeBankDetails?.accountNumber || null,
        dimeBankAccountName: dimeBankDetails?.accountName || null,
        dimeBankDetails: dimeBankDetails ? JSON.parse(JSON.stringify(dimeBankDetails)) : null,
      },
    });

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
      },
    });

    // Send OTP email
    await sendOTPEmail(user.email, otpCode, user.name || undefined);

    return NextResponse.json({
      message: 'Registration successful. Please check your email for OTP verification.',
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
