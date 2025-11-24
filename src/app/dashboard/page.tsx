'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAssetsStore } from '@/store/assetsStore';
import { useInvestmentsStore } from '@/store/investmentsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  LogOut,
  Activity,
  DollarSign,
  Target,
  XCircle
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isHydrated, updateBalance } = useAuthStore();
  const { assets, setAssets } = useAssetsStore();
  const { investments, setInvestments } = useInvestmentsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cryptoPrices, setCryptoPrices] = useState<any[]>([]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [closeMessage, setCloseMessage] = useState('');
  const [closeError, setCloseError] = useState('');

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

  useEffect(() => {
    fetchCryptoPrices();
    // Update crypto prices every 60 seconds
    const interval = setInterval(fetchCryptoPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,ripple,binancecoin,dogecoin,polkadot,litecoin,chainlink,polygon,uniswap,avalanche-2,stellar,tron,pax-gold,silver-tokenized-stock-defichain&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      
      const formattedData = [
        { id: 'pax-gold', name: 'Gold', symbol: 'GOLD', price: data['pax-gold']?.usd || 0, change: data['pax-gold']?.usd_24h_change || 0, isMetal: true },
        { id: 'silver-tokenized-stock-defichain', name: 'Silver', symbol: 'SILVER', price: data['silver-tokenized-stock-defichain']?.usd || 0, change: data['silver-tokenized-stock-defichain']?.usd_24h_change || 0, isMetal: true },
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
        { id: 'binancecoin', name: 'BNB', symbol: 'BNB', price: data.binancecoin?.usd || 0, change: data.binancecoin?.usd_24h_change || 0 },
        { id: 'solana', name: 'Solana', symbol: 'SOL', price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 },
        { id: 'ripple', name: 'XRP', symbol: 'XRP', price: data.ripple?.usd || 0, change: data.ripple?.usd_24h_change || 0 },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: data.cardano?.usd || 0, change: data.cardano?.usd_24h_change || 0 },
        { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: data.dogecoin?.usd || 0, change: data.dogecoin?.usd_24h_change || 0 },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: data.polkadot?.usd || 0, change: data.polkadot?.usd_24h_change || 0 },
        { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', price: data.litecoin?.usd || 0, change: data.litecoin?.usd_24h_change || 0 },
        { id: 'polygon', name: 'Polygon', symbol: 'MATIC', price: data.polygon?.usd || 0, change: data.polygon?.usd_24h_change || 0 },
        { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', price: data.chainlink?.usd || 0, change: data.chainlink?.usd_24h_change || 0 },
        { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', price: data.uniswap?.usd || 0, change: data.uniswap?.usd_24h_change || 0 },
        { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', price: data['avalanche-2']?.usd || 0, change: data['avalanche-2']?.usd_24h_change || 0 },
        { id: 'stellar', name: 'Stellar', symbol: 'XLM', price: data.stellar?.usd || 0, change: data.stellar?.usd_24h_change || 0 },
        { id: 'tron', name: 'TRON', symbol: 'TRX', price: data.tron?.usd || 0, change: data.tron?.usd_24h_change || 0 },
      ];
      
      setCryptoPrices(formattedData);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    }
  };

  const fetchData = async () => {
    if (!user) return;

    try {
      const [assetsRes, investmentsRes, userProfileRes] = await Promise.all([
        fetch('/api/assets'),
        fetch(`/api/investments?userId=${user.id}`),
        fetch(`/api/user/profile?userId=${user.id}`),
      ]);

      const assetsData = await assetsRes.json();
      const investmentsData = await investmentsRes.json();
      const userProfileData = await userProfileRes.json();

      setAssets(assetsData.assets);
      setInvestments(investmentsData.investments);
      
      // Update user balance in store if it changed
      if (userProfileData.user && userProfileData.user.balance !== user.balance) {
        updateBalance(userProfileData.user.balance);
      }
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
        <Loader2 className="h-8 w-8 animate-spin text-[#bea425]" />
      </div>
    );
  }

  const activeInvestments = investments.filter(inv => inv.isActive);
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = activeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Portfolio distribution for pie chart
  const portfolioDistribution = activeInvestments.reduce((acc: any[], inv) => {
    const existing = acc.find(item => item.name === inv.asset.name);
    if (existing) {
      existing.value += inv.currentValue;
    } else {
      acc.push({
        name: inv.asset.name,
        value: inv.currentValue,
      });
    }
    return acc;
  }, []);

  const COLORS = ['#bea425', '#000000', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  // Generate sample performance data for chart
  const performanceData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const baseValue = totalInvested || 10000;
    const variance = Math.random() * 0.1 - 0.05;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: baseValue * (1 + variance + (i * 0.02)),
    };
  });

  const handleRequestClose = async (investment: any) => {
    setSelectedInvestment(investment);
    setShowCloseModal(true);
    setCloseError('');
    setCloseMessage('');
  };

  const confirmCloseRequest = async () => {
    if (!selectedInvestment || !user) return;

    setIsClosing(true);
    setCloseError('');
    try {
      const response = await fetch(`/api/investments/${selectedInvestment.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCloseMessage('Closure request submitted successfully! Awaiting admin approval.');
        await fetchData(); // Refresh investments
        setTimeout(() => {
          setShowCloseModal(false);
          setCloseMessage('');
        }, 3000);
      } else {
        setCloseError(data.error || 'Failed to submit closure request');
      }
    } catch (error) {
      console.error('Error requesting closure:', error);
      setCloseError('An error occurred while submitting closure request');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-[#bea425] to-[#d4b942] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-2xl">I</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CrestCat</h1>
                <p className="text-sm text-gray-400">Welcome back, <span className="text-[#bea425]">{user?.name}</span></p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} size="sm" className="text-white hover:text-[#bea425] hover:bg-gray-800">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Crypto Ticker */}
      <div className="bg-black border-b border-gray-800 overflow-hidden shadow-lg">
        <div className="relative">
          <div className="animate-marquee whitespace-nowrap py-3 flex">
            {cryptoPrices.length > 0 ? (
              <>
                {/* First set */}
                {cryptoPrices.map((crypto) => (
                  <div key={`${crypto.id}-1`} className="inline-flex items-center space-x-2 mx-6">
                    <span className={`font-semibold text-sm ${crypto.isMetal ? 'text-[#bea425]' : 'text-gray-400'}`}>
                      {crypto.symbol}
                    </span>
                    <span className="text-white font-bold">${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                    <span className={`text-xs font-semibold ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
                {/* Second set for seamless loop */}
                {cryptoPrices.map((crypto) => (
                  <div key={`${crypto.id}-2`} className="inline-flex items-center space-x-2 mx-6">
                    <span className={`font-semibold text-sm ${crypto.isMetal ? 'text-[#bea425]' : 'text-gray-400'}`}>
                      {crypto.symbol}
                    </span>
                    <span className="text-white font-bold">${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                    <span className={`text-xs font-semibold ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-gray-400 text-sm px-6">Loading market data...</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#bea425] to-[#d4b942] flex items-center justify-center">
                <Wallet className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(user?.balance || 0)}</div>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <PieChartIcon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-blue-600 mt-2 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                {activeInvestments.length} active investments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Value</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalCurrentValue)}</div>
              <p className="text-xs text-purple-600 mt-2 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Portfolio value
              </p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${totalProfitLoss >= 0 ? 'from-white to-green-50 border-green-200' : 'from-white to-red-50 border-red-200'} border-2 shadow-lg hover:shadow-xl transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Profit/Loss</CardTitle>
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${totalProfitLoss >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} flex items-center justify-center`}>
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-white" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfitLoss)}
              </div>
              <p className={`text-xs mt-2 font-semibold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}% return
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Performance Chart */}
          <Card className="lg:col-span-2 bg-white shadow-lg border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#bea425]" />
                Portfolio Performance
              </CardTitle>
              <CardDescription>Last 7 days trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#bea425" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#bea425" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#bea425" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Portfolio Distribution Pie Chart */}
          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-[#bea425]" />
                Asset Distribution
              </CardTitle>
              <CardDescription>Portfolio breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#bea425"
                      dataKey="value"
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No investments yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/invest">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-[#bea425] bg-gradient-to-br from-[#bea425] to-[#d4b942] text-black h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Make an Investment</h3>
                    <p className="text-sm text-black/80">Browse assets and start investing today</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center">
                    <ArrowUpRight className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/withdraw">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-black bg-gradient-to-br from-gray-900 to-black text-white h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Request Withdrawal</h3>
                    <p className="text-sm text-white/80">Withdraw funds to your Dime Bank account</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                    <ArrowDownRight className="h-8 w-8 text-[#bea425]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Active Investments */}
        <Card className="mb-8 bg-white shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="text-xl">Active Investments</CardTitle>
            <CardDescription>Your current investment portfolio</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {activeInvestments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <PieChartIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4 text-lg">No active investments yet</p>
                <Link href="/dashboard/invest">
                  <Button className="bg-[#bea425] hover:bg-[#a08d1f] text-black font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                    Start Investing Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeInvestments.map((investment) => {
                  const profitLossPercent = investment.amount > 0 ? ((investment.profitLoss / investment.amount) * 100) : 0;
                  return (
                    <div key={investment.id} className="flex items-center justify-between p-4 border-2 rounded-xl hover:shadow-md transition-shadow bg-linear-to-r from-white to-gray-50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-full ${investment.profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                          <span className={`text-2xl font-bold ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {investment.asset.symbol.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-gray-900">{investment.asset.name}</h4>
                            {investment.closureRequested && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                                Closure Pending
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {investment.quantity.toFixed(4)} units @ {formatCurrency(investment.purchasePrice)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Invested: {formatCurrency(investment.amount)}
                          </p>
                          {/* {investment.depositProof && (
                            <a
                              href={investment.depositProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs mt-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              View Proof
                            </a>
                          )} */}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-xl text-gray-900">{formatCurrency(investment.currentValue)}</p>
                          <p className={`text-sm font-semibold ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {investment.profitLoss >= 0 ? '+' : ''}{formatCurrency(investment.profitLoss)}
                          </p>
                          <p className={`text-xs font-medium ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                          </p>
                        </div>
                        {!investment.closureRequested && (
                          <Button
                            onClick={() => handleRequestClose(investment)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Assets */}
        <Card className="bg-white shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="text-xl">Available Assets</CardTitle>
            <CardDescription>Browse and invest in different asset classes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-[#bea425] bg-gradient-to-br from-white to-gray-50 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-full bg-[#bea425]/10 flex items-center justify-center group-hover:bg-[#bea425] transition-colors">
                      <span className="font-bold text-[#bea425] group-hover:text-black transition-colors">{asset.symbol.charAt(0)}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{asset.type}</span>
                  </div>
                  <h4 className="font-bold text-lg mb-1 text-gray-900">{asset.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{asset.symbol}</p>
                  <p className="text-2xl font-bold text-[#bea425] mb-2">{formatCurrency(asset.currentPrice)}</p>
                  <p className="text-xs text-gray-600">Min: {formatCurrency(asset.minInvestment)}</p>
                  <Link href="/dashboard/invest">
                    <Button className="w-full mt-3 bg-[#bea425] hover:bg-[#a08d1f] text-black font-semibold" size="sm">
                      Invest Now
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Close Investment Modal */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Investment Closure</DialogTitle>
            <DialogDescription>
              {selectedInvestment && `Close your ${selectedInvestment.asset.name} investment and transfer funds to your balance`}
            </DialogDescription>
          </DialogHeader>
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-800 mb-2">⚠️ Important Information</p>
                <p className="text-sm text-gray-700">
                  This action will request to close your investment. The admin will review and approve your request. Once approved, the current value will be added to your withdrawable balance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Original Investment</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedInvestment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedInvestment.currentValue)}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Return</p>
                <p className={`text-2xl font-bold ${selectedInvestment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedInvestment.profitLoss >= 0 ? '+' : ''}{formatCurrency(selectedInvestment.profitLoss)}
                </p>
                <p className={`text-sm font-medium ${selectedInvestment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({selectedInvestment.profitLoss >= 0 ? '+' : ''}{((selectedInvestment.profitLoss / selectedInvestment.amount) * 100).toFixed(2)}%)
                </p>
              </div>

              {closeMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  {closeMessage}
                </div>
              )}

              {closeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {closeError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={confirmCloseRequest}
                  disabled={isClosing}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {isClosing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Confirm Close Request
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCloseModal(false)}
                  disabled={isClosing}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
