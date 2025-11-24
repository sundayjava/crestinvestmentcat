'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '@/store/authStore';
import { useAssetsStore } from '@/store/assetsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Loader2, CheckCircle, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const schema = yup.object({
  assetId: yup.string().required('Please select an asset'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  depositMethod: yup.string().default(''),
  depositProof: yup.string().default(''),
});

type FormData = yup.InferType<typeof schema>;

export default function InvestPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const { assets, setAssets } = useAssetsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showDepositDetails, setShowDepositDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [depositMethods, setDepositMethods] = useState<any[]>([]);
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const watchAssetId = watch('assetId');
  const watchAmount = watch('amount');
  const watchDepositMethod = watch('depositMethod');

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchAssets();
    fetchDepositMethods();
  }, [user, isHydrated]);

  useEffect(() => {
    if (watchAssetId) {
      const asset = assets.find(a => a.id === watchAssetId);
      setSelectedAsset(asset);
    }
  }, [watchAssetId, assets]);

  useEffect(() => {
    if (watchDepositMethod) {
      const method = depositMethods.find(m => m.id === watchDepositMethod);
      setSelectedDepositMethod(method);
    }
  }, [watchDepositMethod, depositMethods]);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const data = await response.json();
      setAssets(data.assets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchDepositMethods = async () => {
    try {
      const response = await fetch('/api/admin/deposit-methods');
      const data = await response.json();
      const activeMethods = (data.depositMethods || []).filter((m: any) => m.isActive);
      setDepositMethods(activeMethods);
    } catch (error) {
      console.error('Error fetching deposit methods:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !selectedAsset) return;

    if (data.amount < selectedAsset.minInvestment) {
      setError(`Minimum investment for ${selectedAsset.name} is ${formatCurrency(selectedAsset.minInvestment)}`);
      return;
    }

    // First step: Show deposit details
    if (!showDepositDetails) {
      setError(''); // Clear any previous errors
      setShowDepositDetails(true);
      return;
    }

    // Second step: Validate deposit method and submit to database
    if (!data.depositMethod) {
      setError('Please select a deposit method');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          assetId: data.assetId,
          amount: data.amount,
          depositMethod: data.depositMethod,
          depositProof: data.depositProof || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Investment failed');
      }

      setReceiptId(result.receiptId);
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
                <h2 className="text-2xl font-bold text-gray-900">Investment Submitted!</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Your investment has been submitted for admin approval.
                </p>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Receipt ID</p>
                  <p className="font-mono font-semibold text-purple-600">{receiptId}</p>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  You will receive an email confirmation shortly. The admin will review and approve your investment.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">Back to Dashboard</Button>
                </Link>
                <Button onClick={() => { setSuccess(false); setShowDepositDetails(false); }} className="flex-1">
                  New Investment
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
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/dashboard" className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <X className="h-5 w-5" />
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Make an Investment</CardTitle>
            <CardDescription>
              Select an asset and enter your investment amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {!showDepositDetails ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="assetId">Select Asset</Label>
                    <select
                      id="assetId"
                      {...register('assetId')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={isLoading}
                    >
                      <option value="">Choose an asset...</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.symbol}) - {formatCurrency(asset.currentPrice)}
                        </option>
                      ))}
                    </select>
                    {errors.assetId && (
                      <p className="text-xs text-red-600">{errors.assetId.message}</p>
                    )}
                  </div>

                  {selectedAsset && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold mb-2">{selectedAsset.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{selectedAsset.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Price</p>
                          <p className="font-semibold">{formatCurrency(selectedAsset.currentPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Minimum Investment</p>
                          <p className="font-semibold">{formatCurrency(selectedAsset.minInvestment)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="amount">Investment Amount (USD)</Label>
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
                    {selectedAsset && watchAmount && (
                      <p className="text-xs text-gray-600">
                        You will receive approximately {(watchAmount / selectedAsset.currentPrice).toFixed(4)} {selectedAsset.symbol}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || !selectedAsset}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Continue to Deposit Details'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Investment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Asset:</span>
                        <span className="font-medium">{selectedAsset?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatCurrency(watchAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositMethod">Deposit Method</Label>
                    <select
                      id="depositMethod"
                      {...register('depositMethod')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={isLoading}
                    >
                      <option value="">Select method...</option>
                      {depositMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                    {errors.depositMethod && (
                      <p className="text-xs text-red-600">{errors.depositMethod.message}</p>
                    )}
                  </div>

                  {selectedDepositMethod && (
                    <div className="p-4 bg-[#bea425]/10 border border-[#bea425] rounded-lg space-y-3">
                      <h4 className="font-semibold">{selectedDepositMethod.name} - Account Details</h4>
                      
                      {selectedDepositMethod.accountDetails.instructions && (
                        <p className="text-sm text-gray-600">
                          {selectedDepositMethod.accountDetails.instructions}
                        </p>
                      )}

                      <div className="space-y-3">
                        {Object.entries(selectedDepositMethod.accountDetails).map(([key, value]) => {
                          if (key === 'instructions' || !value) return null;
                          
                          return (
                            <div key={key} className="space-y-1">
                              <p className="text-sm font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </p>
                              <div className="flex gap-2">
                                <code className="flex-1 p-2 bg-white rounded text-xs break-all">
                                  {value as string}
                                </code>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopy(value as string)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {copied && (
                        <p className="text-xs text-[#bea425]">✓ Copied to clipboard!</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="depositProof">Deposit Proof (Transaction ID or Screenshot URL)</Label>
                    <Input
                      id="depositProof"
                      type="text"
                      placeholder="Enter transaction ID or upload proof URL"
                      {...register('depositProof')}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-600">
                      Optional: Provide transaction ID or link to payment proof
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDepositDetails(false)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Confirm & Submit'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
