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
import { X, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const schema = yup.object({
  // Personal Information
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  
  // Company/Business
  company: yup.string().nullable().default(null),
  
  // Address
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  province: yup.string().required('Province is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().nullable().default('USA'),
  
  // Investment Profile
  investorType: yup.string().required('Please select investor type'),
  investableAssets: yup.string().required('Please select your investable assets range'),
  
  // Marketing
  referralSource: yup.string().required('Please tell us how you heard about us'),
  comments: yup.string().nullable().default(null),
  
  // Dime Account
  hasDimeAccount: yup.boolean().default(true),
  dimeBankAccountNumber: yup.string().nullable().default(null),
  dimeBankAccountName: yup.string().nullable().default(null),
});

type RegisterFormData = yup.InferType<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasDimeAccount, setHasDimeAccount] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      hasDimeAccount: true,
      country: 'USA',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dimeBankDetails: !data.hasDimeAccount ? {
            accountNumber: data.dimeBankAccountNumber,
            accountName: data.dimeBankAccountName,
          } : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Redirect to OTP verification page
      router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl my-8">
        {/* Close Button */}
        <Link 
          href="/" 
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors group"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
        </Link>

        <div className="space-y-1 pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-base text-gray-600">
            Fill in your details to get started with CrestCat
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...register('name')}
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+27 12 345 6789"
                        {...register('phone')}
                        disabled={isLoading}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register('email')}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      {...register('password')}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="ABC Corporation"
                      {...register('company')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      {...register('address')}
                      disabled={isLoading}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Johannesburg"
                        {...register('city')}
                        disabled={isLoading}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        placeholder="Gauteng"
                        {...register('province')}
                        disabled={isLoading}
                      />
                      {errors.province && (
                        <p className="text-xs text-red-600">{errors.province.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        placeholder="2000"
                        {...register('postalCode')}
                        disabled={isLoading}
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-red-600">{errors.postalCode.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        defaultValue="USA"
                        {...register('country')}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Investment Profile */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Investment Profile</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="investorType">What type of investor are you? *</Label>
                    <select
                      id="investorType"
                      {...register('investorType')}
                      disabled={isLoading}
                      className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#bea425] focus:ring-[#bea425] focus:outline-none"
                    >
                      <option value="">Select investor type</option>
                      <option value="Individual">Individual Investor</option>
                      <option value="Corporate">Domestic Partnership</option>
                      <option value="Corporate">Corporate Investor</option>
                      <option value="Institutional">Institutional Investor</option>
                      <option value="High Net Worth">High Net Worth Individual</option>
                      <option value="Beginner">Beginner Investor</option>
                    </select>
                    {errors.investorType && (
                      <p className="text-xs text-red-600">{errors.investorType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investableAssets">Investable Assets Range *</Label>
                    <select
                      id="investableAssets"
                      {...register('investableAssets')}
                      disabled={isLoading}
                      className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#bea425] focus:ring-[#bea425] focus:outline-none"
                    >
                      <option value="">Select range</option>
                      <option value="Under $50,000">Under $50,000</option>
                      <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                      <option value="$100,000 - $500,000">$100,000 - $500,000</option>
                      <option value="$500,000 - $1,000,000">$500,000 - $1,000,000</option>
                      <option value="Over $1,000,000">Over $1,000,000</option>
                    </select>
                    {errors.investableAssets && (
                      <p className="text-xs text-red-600">{errors.investableAssets.message}</p>
                    )}
                  </div>
                </div>

                {/* Marketing & Feedback */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referralSource">How did you hear about us? *</Label>
                    <select
                      id="referralSource"
                      {...register('referralSource')}
                      disabled={isLoading}
                      className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#bea425] focus:ring-[#bea425] focus:outline-none"
                    >
                      <option value="">Select option</option>
                      <option value="Google Search">Google Search</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Friend/Family Referral">Friend/Family Referral</option>
                      <option value="Advertisement">Advertisement</option>
                      <option value="Financial Advisor">Financial Advisor</option>
                      <option value="News/Article">News/Article</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.referralSource && (
                      <p className="text-xs text-red-600">{errors.referralSource.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments or Questions (Optional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Tell us about your investment goals or any questions you have..."
                      rows={3}
                      {...register('comments')}
                      disabled={isLoading}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Dime Bank Account */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Banking Information</h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasDimeAccount"
                      checked={hasDimeAccount}
                      onChange={(e) => {
                        const value = e.target.checked;
                        setHasDimeAccount(value);
                        setValue('hasDimeAccount', value);
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                      disabled={isLoading}
                    />
                    <Label htmlFor="hasDimeAccount" className="font-normal cursor-pointer">
                      I have a Dime Bank account
                    </Label>
                  </div>

                  {!hasDimeAccount && (
                    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        Don't have a Dime Bank account? No worries! Our admin team will create one for you. Please provide your preferred details below.
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="dimeBankAccountNumber">Preferred Account Number</Label>
                        <Input
                          id="dimeBankAccountNumber"
                          placeholder="Enter preferred account number"
                          {...register('dimeBankAccountNumber')}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dimeBankAccountName">Account Name</Label>
                        <Input
                          id="dimeBankAccountName"
                          placeholder="Enter your full name"
                          {...register('dimeBankAccountName')}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#bea425] hover:bg-[#a08d1f] text-white font-semibold text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600 pt-2">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-[#bea425] hover:text-[#a08d1f] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        );
      }
