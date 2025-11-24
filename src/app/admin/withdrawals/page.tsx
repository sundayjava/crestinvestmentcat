'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Eye, DollarSign, User, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  dimeBankAccountNumber: string;
  dimeBankAccountName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  adminNotes?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState('');

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }

    fetchWithdrawals();
  }, [user, isHydrated, router]);

  useEffect(() => {
    // Filter withdrawals by status
    let filtered = withdrawals;

    if (filterStatus === 'pending') {
      filtered = filtered.filter(w => w.status === 'PENDING');
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(w => w.status === 'COMPLETED');
    } else if (filterStatus === 'rejected') {
      filtered = filtered.filter(w => w.status === 'REJECTED');
    }

    setFilteredWithdrawals(filtered);
  }, [withdrawals, filterStatus]);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/withdrawals');
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }
      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessWithdrawal = async (action: 'approve' | 'reject') => {
    if (!selectedWithdrawal || !user) return;

    setIsProcessing(true);
    setProcessError('');

    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminId: user.id,
          adminNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} withdrawal`);
      }

      // Refresh withdrawals list
      await fetchWithdrawals();
      setShowProcessModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
    } catch (error: any) {
      setProcessError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openProcessModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowProcessModal(true);
    setAdminNotes('');
    setProcessError('');
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#bea425]" />
      </div>
    );
  }

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'PENDING').length,
    approved: withdrawals.filter(w => w.status === 'COMPLETED').length,
    rejected: withdrawals.filter(w => w.status === 'REJECTED').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    pendingAmount: withdrawals.filter(w => w.status === 'PENDING').reduce((sum, w) => sum + w.amount, 0),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Management</h1>
        <p className="text-gray-600">Review and process user withdrawal requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.totalAmount)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Loader2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.pendingAmount)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="status-filter" className="mb-2 block">Filter by Status</Label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Withdrawals</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchWithdrawals} variant="outline" className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests ({filteredWithdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No withdrawal requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-600">User</th>
                    <th className="text-left p-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-600">Bank Account</th>
                    <th className="text-left p-4 font-medium text-gray-600">Date</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{withdrawal.user.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{withdrawal.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-lg">{formatCurrency(withdrawal.amount)}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{withdrawal.dimeBankAccountNumber}</div>
                            <div className="text-sm text-gray-500">{withdrawal.dimeBankAccountName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDateTime(new Date(withdrawal.createdAt))}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            withdrawal.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : withdrawal.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {withdrawal.status === 'PENDING' ? (
                          <Button
                            onClick={() => openProcessModal(withdrawal)}
                            size="sm"
                            className="bg-[#bea425] hover:bg-[#a08d1f]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        ) : (
                          <Button
                            onClick={() => openProcessModal(withdrawal)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and process the withdrawal request
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs text-gray-600">User</Label>
                  <p className="font-medium">{selectedWithdrawal.user.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedWithdrawal.user.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Amount</Label>
                  <p className="font-bold text-2xl text-[#bea425]">{formatCurrency(selectedWithdrawal.amount)}</p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Dime Bank Account Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Account Number</Label>
                    <p className="font-medium">{selectedWithdrawal.dimeBankAccountNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Account Name</Label>
                    <p className="font-medium">{selectedWithdrawal.dimeBankAccountName}</p>
                  </div>
                </div>
              </div>

              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-600">Request Date</Label>
                  <p>{formatDateTime(new Date(selectedWithdrawal.createdAt))}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Status</Label>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedWithdrawal.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedWithdrawal.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedWithdrawal.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Previous Admin Notes (if any) */}
              {selectedWithdrawal.adminNotes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-xs text-blue-800">Previous Admin Notes</Label>
                  <p className="text-sm text-blue-900 mt-1">{selectedWithdrawal.adminNotes}</p>
                </div>
              )}

              {/* Admin Notes Input (only for pending) */}
              {selectedWithdrawal.status === 'PENDING' && (
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                  <textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this withdrawal..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}

              {processError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {processError}
                </div>
              )}

              {/* Action Buttons */}
              {selectedWithdrawal.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleProcessWithdrawal('approve')}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Transfer
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleProcessWithdrawal('reject')}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
