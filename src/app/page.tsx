'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Zap, 
  Lock, 
  BarChart3,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HeroCarousel from '@/components/HeroCarousel';
import AppointmentForm from '@/components/AppointmentForm';
import TestimonialScroll from '@/components/TestimonialScroll';
import InvestmentProcess from '@/components/InvestmentProcess';
import AssetsShowcase from '@/components/AssetsShowcase';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: Shield,
    title: 'Secure & Protected',
    description: 'Bank-grade security with multi-layer encryption to keep your investments safe.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description: 'Track your portfolio performance with live market data and detailed insights.',
  },
  {
    icon: Zap,
    title: 'Instant Transactions',
    description: 'Quick deposits and withdrawals processed efficiently by our admin team.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Diversification',
    description: 'Invest in multiple asset classes including gold, silver, crypto, and real estate.',
  },
  {
    icon: Lock,
    title: 'Email Verification',
    description: 'OTP-based email verification ensures your account security.',
  },
  {
    icon: Shield,
    title: 'Dedicated Support',
    description: 'Professional admin team to handle all your transactions and queries.',
  },
];



export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Testimonials Section */}
      <TestimonialScroll />

      {/* Investment Process Section */}
      <InvestmentProcess />

      {/* Floating Appointment Form */}
      <AppointmentForm />

      {/* Assets Section */}
      <AssetsShowcase />

      {/* Features Section */}
      <section id="features" className="py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose InvestPro
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to invest smartly and securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-start">
                <div className="p-3 bg-[#bea4251e] rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-[#bea425]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-[#bea425]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            Join thousands of investors growing their wealth with InvestPro
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="bg-white text-black hover:bg-gray-100">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-[#bea425] font-bold">I</span>
                </div>
                <span className="text-lg font-bold text-white">InvestPro</span>
              </div>
              <p className="text-sm">
                Professional investment platform for modern investors.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} InvestPro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Appointment Form */}
      <AppointmentForm />
    </div>
  );
}

