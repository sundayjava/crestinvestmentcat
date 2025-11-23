'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Eye, Send } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Investment {
  id: string;
  amount: number;
  status: string;
  receiptId: string;
  depositMethod: string;
  depositProof: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  asset: {
    name: string;
    symbol: string;
  };
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  dimeBankDetails: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    balance: number;
  };
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [processingNote, setProcessingNote] = useState('');

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
    fetchTransactions();
  }, [user, isHydrated]);

  const fetchTransactions = async () => {
    try {
      const [investmentsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/investments'),
        fetch('/api/withdrawals'),
      ]);

      const investmentsData = await investmentsRes.json();
      const withdrawalsData = await withdrawalsRes.json();

      setInvestments(investmentsData.investments || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveInvestment = async (investmentId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/investments/${investmentId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchTransactions();
        setShowDetails(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error approving investment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectInvestment = async (investmentId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/investments/${investmentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reject: true }),
      });

      if (response.ok) {
        await fetchTransactions();
        setShowDetails(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error rejecting investment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string, approved: boolean) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, note: processingNote }),
      });

      if (response.ok) {
        await fetchTransactions();
        setShowDetails(false);
        setSelectedItem(null);
        setProcessingNote('');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingInvestments = investments.filter(i => i.status === 'PENDING');
  const approvedInvestments = investments.filter(i => i.status === 'APPROVED');
  const rejectedInvestments = investments.filter(i => i.status === 'REJECTED');

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING');
  const completedWithdrawals = withdrawals.filter(w => w.status === 'COMPLETED');
  const rejectedWithdrawals = withdrawals.filter(w => w.status === 'REJECTED');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-sm text-gray-600">Approve and manage investments and withdrawals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="investments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="investments">
              Investments
              {pendingInvestments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {pendingInvestments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              Withdrawals
              {pendingWithdrawals.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                  {pendingWithdrawals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Investments Tab */}
          <TabsContent value="investments">
            <div className="space-y-6">
              {/* Pending Investments */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Investments ({pendingInvestments.length})</CardTitle>
                  <CardDescription>Investments awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingInvestments.map((investment) => (
                      <div key={investment.id} className="border rounded-lg p-4 bg-yellow-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{investment.user.name}</h3>
                              <span className="px-2 py-0.5 text-xs bg-yellow-200 text-yellow-800 rounded">Pending</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{investment.user.email}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Asset</p>
                                <p className="font-semibold">{investment.asset.name}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Amount</p>
                                <p className="font-semibold text-purple-600">{formatCurrency(investment.amount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Method</p>
                                <p className="font-semibold">{investment.depositMethod}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Receipt ID</p>
                                <p className="font-mono text-xs">{investment.receiptId}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{formatDateTime(investment.createdAt)}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(investment);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApproveInvestment(investment.id)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectInvestment(investment.id)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingInvestments.length === 0 && (
                      <p className="text-center text-gray-600 py-8">No pending investments</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Approved Investments */}
              <Card>
                <CardHeader>
                  <CardTitle>Approved Investments ({approvedInvestments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {approvedInvestments.slice(0, 10).map((investment) => (
                      <div key={investment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{investment.user.name}</p>
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Approved</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {investment.asset.name} - {formatCurrency(investment.amount)}
                            </p>
                            <p className="text-xs text-gray-600">{formatDateTime(investment.createdAt)}</p>
                          </div>
                          <p className="font-mono text-xs text-gray-600">{investment.receiptId}</p>
                        </div>
                      </div>
                    ))}
                    {approvedInvestments.length === 0 && (
                      <p className="text-center text-gray-600 py-8">No approved investments yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <div className="space-y-6">
              {/* Pending Withdrawals */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Withdrawals ({pendingWithdrawals.length})</CardTitle>
                  <CardDescription>Withdrawal requests awaiting processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingWithdrawals.map((withdrawal) => {
                      const dimeDetails = JSON.parse(withdrawal.dimeBankDetails);
                      return (
                        <div key={withdrawal.id} className="border rounded-lg p-4 bg-orange-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{withdrawal.user.name}</h3>
                                <span className="px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded">Pending</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{withdrawal.user.email}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Amount</p>
                                  <p className="font-semibold text-orange-600">{formatCurrency(withdrawal.amount)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">User Balance</p>
                                  <p className="font-semibold">{formatCurrency(withdrawal.user.balance)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Account Number</p>
                                  <p className="font-mono text-xs">{dimeDetails.accountNumber}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Account Name</p>
                                  <p className="font-semibold">{dimeDetails.accountName}</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-2">{formatDateTime(withdrawal.createdAt)}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setSelectedItem(withdrawal);
                                  setShowDetails(true);
                                }}
                                disabled={isProcessing}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Process
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleProcessWithdrawal(withdrawal.id, false)}
                                disabled={isProcessing}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {pendingWithdrawals.length === 0 && (
                      <p className="text-center text-gray-600 py-8">No pending withdrawals</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Completed Withdrawals */}
              <Card>
                <CardHeader>
                  <CardTitle>Completed Withdrawals ({completedWithdrawals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedWithdrawals.slice(0, 10).map((withdrawal) => (
                      <div key={withdrawal.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{withdrawal.user.name}</p>
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Completed</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(withdrawal.amount)}
                            </p>
                            <p className="text-xs text-gray-600">{formatDateTime(withdrawal.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {completedWithdrawals.length === 0 && (
                      <p className="text-center text-gray-600 py-8">No completed withdrawals yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedItem?.asset ? 'Investment Details' : 'Withdrawal Details'}
              </DialogTitle>
              <DialogDescription>
                Review and process transaction
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <p className="font-semibold">{selectedItem.user.name}</p>
                  <p className="text-sm text-gray-600">{selectedItem.user.email}</p>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(selectedItem.amount)}</p>
                </div>
                {selectedItem.asset ? (
                  <>
                    <div className="space-y-2">
                      <Label>Asset</Label>
                      <p className="font-semibold">{selectedItem.asset.name} ({selectedItem.asset.symbol})</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Deposit Method</Label>
                      <p>{selectedItem.depositMethod}</p>
                    </div>
                    {selectedItem.depositProof && (
                      <div className="space-y-2">
                        <Label>Deposit Proof</Label>
                        <p className="text-sm font-mono">{selectedItem.depositProof}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApproveInvestment(selectedItem.id)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleRejectInvestment(selectedItem.id)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Dime Bank Details</Label>
                      {(() => {
                        const details = JSON.parse(selectedItem.dimeBankDetails);
                        return (
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm"><strong>Account Number:</strong> {details.accountNumber}</p>
                            <p className="text-sm"><strong>Account Name:</strong> {details.accountName}</p>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="space-y-2">
                      <Label>Processing Note (Optional)</Label>
                      <Input
                        type="text"
                        placeholder="Add a note about this transaction..."
                        value={processingNote}
                        onChange={(e) => setProcessingNote(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleProcessWithdrawal(selectedItem.id, true)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve & Send'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleProcessWithdrawal(selectedItem.id, false)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
