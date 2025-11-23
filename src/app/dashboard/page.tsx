'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAssetsStore } from '@/store/assetsStore';
import { useInvestmentsStore } from '@/store/investmentsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  LogOut
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isHydrated } = useAuthStore();
  const { assets, setAssets } = useAssetsStore();
  const { investments, setInvestments } = useInvestmentsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, isHydrated]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [assetsRes, investmentsRes] = await Promise.all([
        fetch('/api/assets'),
        fetch(`/api/investments?userId=${user.id}`),
      ]);

      const assetsData = await assetsRes.json();
      const investmentsData = await investmentsRes.json();

      setAssets(assetsData.assets);
      setInvestments(investmentsData.investments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const activeInvestments = investments.filter(inv => inv.isActive);
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = activeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#bea425] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">InvestPro</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(user?.balance || 0)}</div>
              <p className="text-xs text-gray-600 mt-1">Available for withdrawal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <PieChart className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-gray-600 mt-1">{activeInvestments.length} active investments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
              <p className="text-xs text-gray-600 mt-1">Portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfitLoss)}
              </div>
              <p className={`text-xs mt-1 ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/invest">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Make an Investment</h3>
                    <p className="text-sm text-gray-600">Browse assets and start investing</p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/withdraw">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Request Withdrawal</h3>
                    <p className="text-sm text-gray-600">Withdraw funds to Dime Bank</p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Active Investments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Investments</CardTitle>
            <CardDescription>Your current investment portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            {activeInvestments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No active investments yet</p>
                <Link href="/dashboard/invest">
                  <Button className="mt-4">Start Investing</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{investment.asset.name}</h4>
                      <p className="text-sm text-gray-600">
                        {investment.quantity.toFixed(4)} units @ {formatCurrency(investment.purchasePrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(investment.currentValue)}</p>
                      <p className={`text-sm ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.profitLoss >= 0 ? '+' : ''}{formatCurrency(investment.profitLoss)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Available Assets</CardTitle>
            <CardDescription>Browse and invest in different asset classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold mb-1">{asset.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{asset.symbol}</p>
                  <p className="text-lg font-bold">{formatCurrency(asset.currentPrice)}</p>
                  <p className="text-xs text-gray-600 mt-1">Min: {formatCurrency(asset.minInvestment)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
