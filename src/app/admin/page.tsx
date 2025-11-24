'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, DollarSign, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  totalUsers: number;
  totalInvestments: number;
  totalWithdrawals: number;
  pendingInvestments: number;
  pendingWithdrawals: number;
  totalVolume: number;
  activeInvestments: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount: number;
  createdAt: string;
}

const COLORS = ['#bea425', '#000000', '#666666', '#999999'];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, isHydrated]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
      
      // Generate sample chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          investments: Math.floor(Math.random() * 50000) + 20000,
          withdrawals: Math.floor(Math.random() * 30000) + 10000,
        };
      });
      setChartData(last7Days);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = stats ? [
    { name: 'Active Investments', value: stats.activeInvestments },
    { name: 'Pending Investments', value: stats.pendingInvestments },
    { name: 'Pending Withdrawals', value: stats.pendingWithdrawals },
  ] : [];

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bea425] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Monitor your platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-blue-600 mt-2">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.totalVolume || 0)}</div>
            <p className="text-xs text-green-600 mt-2">All-time platform volume</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Investments</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#bea425] to-[#d4b942] flex items-center justify-center">
              <Clock className="h-5 w-5 text-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#bea425]">{stats?.pendingInvestments || 0}</div>
            <p className="text-xs text-[#bea425] mt-2">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Withdrawals</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats?.pendingWithdrawals || 0}</div>
            <p className="text-xs text-purple-600 mt-2">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle>Platform Activity (Last 7 Days)</CardTitle>
              <CardDescription>Investment and withdrawal trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInvestments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#bea425" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#bea425" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="investments" stroke="#bea425" fillOpacity={1} fill="url(#colorInvestments)" />
                  <Area type="monotone" dataKey="withdrawals" stroke="#000000" fillOpacity={1} fill="url(#colorWithdrawals)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle>Transaction Distribution</CardTitle>
              <CardDescription>Current status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => entry.name}
                    outerRadius={80}
                    fill="#bea425"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform transactions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.type === 'investment' ? (
                        <ArrowDownRight className="h-5 w-5 text-[#bea425]" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-black" />
                      )}
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-600">{formatDateTime(activity.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(activity.amount)}</p>
                      <p className="text-xs text-gray-600 capitalize">{activity.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}