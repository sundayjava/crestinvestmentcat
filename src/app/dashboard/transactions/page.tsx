'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'INVESTMENT' | 'WITHDRAWAL'>('all');

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchTransactions();
  }, [user, isHydrated, router]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#bea425]" />
      </div>
    );
  }

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT':
        return <TrendingUp className="h-4 w-4" />;
      case 'WITHDRAWAL':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#bea425] to-[#d4b942] rounded-xl flex items-center justify-center shadow-lg">
                <Download className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                <p className="text-gray-400 text-sm">View all your transactions</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete history of your investment and withdrawal activities</CardDescription>
              </div>
              <Button onClick={fetchTransactions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setFilterType('all')}
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All
              </Button>
              <Button
                onClick={() => setFilterType('INVESTMENT')}
                variant={filterType === 'INVESTMENT' ? 'default' : 'outline'}
                size="sm"
              >
                Investments
              </Button>
              <Button
                onClick={() => setFilterType('WITHDRAWAL')}
                variant={filterType === 'WITHDRAWAL' ? 'default' : 'outline'}
                size="sm"
              >
                Withdrawals
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No transactions found</p>
                <p className="text-sm text-gray-500">Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span className="text-sm font-medium text-gray-900">
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold ${
                            transaction.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        {filteredTransactions.length > 0 && (
          <Card className="mt-6 shadow-xl border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'INVESTMENT' && t.status === 'COMPLETED')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
