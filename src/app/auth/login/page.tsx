'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Loader2, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsVerification) {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
          return;
        }
        throw new Error(result.error || 'Login failed');
      }

      // Set user in store
      setUser(result.user);

      // Redirect based on role
      if (result.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Motivation Quote */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#bea425] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#bea425] rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-24">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-16">
            <div className="h-12 w-12 bg-[#bea425] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">I</span>
            </div>
            <span className="text-3xl font-bold text-white">InvestPro</span>
          </div>

          {/* Quote */}
          <div className="space-y-8">
            <div className="relative">
              <svg className="absolute -top-4 -left-4 w-12 h-12 text-[#bea425] opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="relative z-10">
                <p className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                  The best time to invest was yesterday. The second best time is now.
                </p>
                <footer className="text-xl text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#bea425]" />
                  <span>— InvestPro</span>
                </footer>
              </blockquote>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-gray-800">
              <div>
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-sm text-gray-400">Active Investors</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">$50M+</p>
                <p className="text-sm text-gray-400">Assets Managed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-sm text-gray-400">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-linear-to-br from-gray-50 to-white relative">
        {/* Close Button */}
        <Link 
          href="/" 
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors group"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
        </Link>

        <div className="w-full max-w-md">
          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-base">
                Sign in to your InvestPro account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="h-11 border-gray-300 focus:border-[#bea425] focus:ring-[#bea425]"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 border-gray-300 focus:border-[#bea425] focus:ring-[#bea425]"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#bea425] hover:bg-[#a08d1f] text-white font-semibold text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600 pt-2">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-[#bea425] hover:text-[#a08d1f] font-semibold hover:underline">
                    Create account
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mt-8">
            <div className="h-8 w-8 bg-[#bea425] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <span className="text-xl font-bold text-gray-900">InvestPro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
