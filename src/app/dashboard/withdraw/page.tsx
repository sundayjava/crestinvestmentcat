'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const schema = yup.object({
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  dimeAccountNumber: yup
    .string()
    .required('Dime Bank account number is required'),
  dimeAccountName: yup
    .string()
    .required('Account holder name is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function WithdrawPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const watchAmount = watch('amount');

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Pre-fill Dime Bank account if user has one
    if (user.dimeBankAccount) {
      try {
        const dimeBankData = JSON.parse(user.dimeBankAccount);
        if (dimeBankData.accountNumber) {
          setValue('dimeAccountNumber', dimeBankData.accountNumber);
        }
        if (dimeBankData.accountName) {
          setValue('dimeAccountName', dimeBankData.accountName);
        }
      } catch (error) {
        console.error('Error parsing Dime Bank account:', error);
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    if (data.amount > user.balance) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: data.amount,
          dimeBankDetails: {
            accountNumber: data.dimeAccountNumber,
            accountName: data.dimeAccountName,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Withdrawal request failed');
      }

      setWithdrawalId(result.withdrawal.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Withdrawal Submitted!</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Your withdrawal request has been submitted and is pending admin approval.
                </p>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Withdrawal ID</p>
                  <p className="font-mono font-semibold text-purple-600">{withdrawalId}</p>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  The admin will review your request and process the withdrawal to your Dime Bank account. You will receive an email confirmation once completed.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">Back to Dashboard</Button>
                </Link>
                <Button onClick={() => setSuccess(false)} className="flex-1">
                  New Withdrawal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Withdraw Funds</CardTitle>
            <CardDescription>
              Request a withdrawal to your Dime Bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-[#bea425]" />
                  <h4 className="font-semibold text-blue-900">Available Balance</h4>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(user?.balance || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  {...register('amount')}
                  disabled={isLoading}
                />
                {errors.amount && (
                  <p className="text-xs text-red-600">{errors.amount.message}</p>
                )}
                {watchAmount > 0 && user && watchAmount > user.balance && (
                  <p className="text-xs text-red-600">Amount exceeds available balance</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Dime Bank Account Details</h3>
                
                {user?.dimeBankAccount && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                    ✓ Using your registered Dime Bank account
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dimeAccountNumber">Dime Bank Account Number</Label>
                    <Input
                      id="dimeAccountNumber"
                      type="text"
                      placeholder="Enter your Dime Bank account number"
                      {...register('dimeAccountNumber')}
                      disabled={isLoading}
                    />
                    {errors.dimeAccountNumber && (
                      <p className="text-xs text-red-600">{errors.dimeAccountNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimeAccountName">Account Holder Name</Label>
                    <Input
                      id="dimeAccountName"
                      type="text"
                      placeholder="Name as it appears on your account"
                      {...register('dimeAccountName')}
                      disabled={isLoading}
                    />
                    {errors.dimeAccountName && (
                      <p className="text-xs text-red-600">{errors.dimeAccountName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Important Notice</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Withdrawal requests are processed by our admin team</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Ensure your Dime Bank account details are correct</li>
                  <li>• You will receive email confirmation once processed</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !user || watchAmount > (user?.balance || 0)}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  'Submit Withdrawal Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
