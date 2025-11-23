'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAssetsStore } from '@/store/assetsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Edit, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetWithCount {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  currentPrice: number;
  minInvestment: number;
  type: string;
  _count: {
    investments: number;
  };
}

export default function AdminAssetsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const { assets, setAssets } = useAssetsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<AssetWithCount | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchAssets();
  }, [user, isHydrated]);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const data = await response.json();
      setAssets(data.assets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrice = async (assetId: string) => {
    if (!newPrice) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/assets/${assetId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPrice: parseFloat(newPrice) }),
      });

      if (response.ok) {
        await fetchAssets();
        setNewPrice('');
        setSelectedAsset(null);
        generatePriceHistory();
      }
    } catch (error) {
      console.error('Error updating price:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const generatePriceHistory = () => {
    // Generate sample price history for demonstration
    const history = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        gold: 1800 + Math.random() * 200,
        bitcoin: 40000 + Math.random() * 5000,
        silver: 22 + Math.random() * 3,
        realEstate: 250000 + Math.random() * 20000,
      };
    });
    setPriceHistory(history);
  };

  useEffect(() => {
    if (assets.length > 0) {
      generatePriceHistory();
    }
  }, [assets]);

  const getPriceChange = (asset: any) => {
    // Simulate price change percentage
    const change = (Math.random() * 10) - 5;
    return change;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#bea425]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-sm text-gray-600">Manage asset prices and monitor market performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {assets.map((asset) => {
            const priceChange = getPriceChange(asset);
            const isPositive = priceChange >= 0;

            return (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{asset.name}</CardTitle>
                      <CardDescription>{asset.symbol}</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedAsset({ ...asset, _count: { investments: 0 } })}>
                          <Edit className="h-4 w-4 mr-1" />
                          Update Price
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Price - {asset.name}</DialogTitle>
                          <DialogDescription>
                            Current Price: {formatCurrency(asset.currentPrice)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>New Price (USD)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter new price"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={() => handleUpdatePrice(asset.id)} 
                            disabled={isUpdating || !newPrice} 
                            className="w-full"
                          >
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Price'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">{formatCurrency(asset.currentPrice)}</p>
                      <div className="flex items-center mt-1">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-[#bea425] mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-600 ml-2">24h</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-semibold capitalize">{asset.type.toLowerCase()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Min Investment</p>
                        <p className="font-semibold">{formatCurrency(asset.minInvestment)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Active Investments</p>
                        <p className="font-semibold">{(asset as any)._count?.investments || 0}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">{asset.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Price History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Price History (Last 30 Days)</CardTitle>
            <CardDescription>Real-time asset price trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Line type="monotone" dataKey="gold" stroke="#f59e0b" name="Gold" strokeWidth={2} />
                <Line type="monotone" dataKey="bitcoin" stroke="#8b5cf6" name="Bitcoin" strokeWidth={2} />
                <Line type="monotone" dataKey="silver" stroke="#6b7280" name="Silver" strokeWidth={2} />
                <Line type="monotone" dataKey="realEstate" stroke="#10b981" name="Real Estate" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Asset Management Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Update asset prices to reflect current market conditions</li>
              <li>• Price changes are immediately reflected to all users</li>
              <li>• Users with active investments will see updated values in real-time</li>
              <li>• Investment calculations are based on the current price at time of purchase</li>
              <li>• Monitor the price history chart to track market trends</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
