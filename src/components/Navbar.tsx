'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="border-b bg-gray-900 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation Items - Left Side */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <Image 
                src="/logo.png" 
                alt="CrestCat Logo" 
                width={70} 
                height={400}
                className="transition-opacity group-hover:opacity-80"
              />
              <span className="text-xl font-bold text-white">
                CrestCat
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href="#features" 
                className="text-sm font-medium text-gray-300 hover:text-[#bea425] transition-colors"
              >
                Features
              </a>
              <a 
                href="#assets" 
                className="text-sm font-medium text-gray-300 hover:text-[#bea425] transition-colors"
              >
                Assets
              </a>
              <a 
                href="#about" 
                className="text-sm font-medium text-gray-300 hover:text-[#bea425] transition-colors"
              >
                About
              </a>
            </div>
          </div>

          {/* Auth Buttons - Right Side */}
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button 
                size="sm" 
                className="bg-[#bea425] hover:bg-[#a08d1f] text-white font-semibold shadow-lg"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
