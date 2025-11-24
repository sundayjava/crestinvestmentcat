'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, XCircle, Edit, Eye, Loader2, Search, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Investment {
  id: string;
  userId: string;
  assetId: string;
  amount: number;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  profitLoss: number;
  depositProof: string | null;
  depositMethod: string | null;
  isActive: boolean;
  closureRequested: boolean;
  closureRequestedAt: string | null;
  closedAt: string | null;
  closureNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  asset: {
    id: string;
    name: string;
    symbol: string;
    currentPrice: number;
  };
}

export default function AdminInvestmentsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'closure-requested'>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [editForm, setEditForm] = useState({
    amount: 0,
    quantity: 0,
    purchasePrice: 0,
    currentValue: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchInvestments();
    fetchTransactions();
  }, [user, isHydrated]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        console.error('Failed to fetch transactions');
        setTransactions([]);
        return;
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  useEffect(() => {
    // EXCLUDE all closed investments from ALL views
    let filtered = investments.filter(inv => !inv.closedAt);

    // Filter by status (only non-closed investments)
    if (filterStatus === 'pending') {
      // Pending: Not active, not closure requested
      filtered = filtered.filter(inv => !inv.isActive && !inv.closureRequested);
    } else if (filterStatus === 'approved') {
      // Approved: Active investments only (not closure requested)
      filtered = filtered.filter(inv => inv.isActive && !inv.closureRequested);
    } else if (filterStatus === 'closure-requested') {
      // Closure requested: Active but user wants to close
      filtered = filtered.filter(inv => inv.closureRequested && inv.isActive);
    }
    // Removed 'history' filter - closed investments are completely hidden

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvestments(filtered);
  }, [investments, searchTerm, filterStatus]);

  const fetchInvestments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/investments');
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch investments:', errorText);
        setInvestments([]);
        return;
      }
      const data = await response.json();
      setInvestments(data.investments || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setInvestments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (investmentId: string) => {
    if (!confirm('Are you sure you want to approve this investment?')) return;
    
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/investments/${investmentId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setErrorMessage(errorData.error || 'Failed to approve investment');
        } catch {
          setErrorMessage(errorText || 'Failed to approve investment');
        }
        return;
      }

      const data = await response.json();

      if (data) {
        setSuccessMessage('Investment approved successfully!');
        await fetchInvestments();
        setShowDetailsModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving investment:', error);
      setErrorMessage('An error occurred while approving investment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (investmentId: string) => {
    if (!confirm('Are you sure you want to reject this investment?')) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/investments/${investmentId}/approve`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setErrorMessage(errorData.error || 'Failed to reject investment');
        } catch {
          setErrorMessage(errorText || 'Failed to reject investment');
        }
        return;
      }

      const data = await response.json();

      if (data) {
        setSuccessMessage('Investment rejected successfully!');
        await fetchInvestments();
        setShowDetailsModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error rejecting investment:', error);
      setErrorMessage('An error occurred while rejecting investment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedInvestment) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/investments/${selectedInvestment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setErrorMessage(errorData.error || 'Failed to update investment');
        } catch {
          setErrorMessage(errorText || 'Failed to update investment');
        }
        return;
      }

      const data = await response.json();

      if (data) {
        setSuccessMessage('Investment updated successfully!');
        await fetchInvestments();
        setShowEditModal(false);
        setShowDetailsModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating investment:', error);
      setErrorMessage('An error occurred while updating investment');
    } finally {
      setIsProcessing(false);
    }
  };

  const openDetailsModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
  };

  const openEditModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setEditForm({
      amount: investment.amount,
      quantity: investment.quantity,
      purchasePrice: investment.purchasePrice,
      currentValue: investment.currentValue,
    });
    setShowEditModal(true);
  };

  const openCloseModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setCloseNotes('');
    setShowCloseModal(true);
  };

  const handleApproveClosure = async () => {
    if (!selectedInvestment) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/investments/${selectedInvestment.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user?.id,
          notes: closeNotes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to approve closure';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        setErrorMessage(errorMessage);
        return;
      }

      const data = await response.json();
      setSuccessMessage(`Investment closed! $${selectedInvestment.currentValue.toFixed(2)} added to user balance.`);
      await fetchInvestments();
      setShowCloseModal(false);
      setShowDetailsModal(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error approving closure:', error);
      setErrorMessage('An error occurred while approving closure');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClosure = async () => {
    if (!selectedInvestment) return;
    if (!closeNotes) {
      setErrorMessage('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/investments/${selectedInvestment.id}/close`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: closeNotes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to reject closure';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        setErrorMessage(errorMessage);
        return;
      }

      const data = await response.json();
      setSuccessMessage('Closure request rejected successfully!');
      await fetchInvestments();
      setShowCloseModal(false);
      setShowDetailsModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error rejecting closure:', error);
      setErrorMessage('An error occurred while rejecting closure');
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = {
    total: investments.length,
    pending: investments.filter(inv => !inv.isActive && !inv.closureRequested).length,
    approved: investments.filter(inv => inv.isActive && !inv.closureRequested).length,
    closureRequested: investments.filter(inv => inv.closureRequested).length,
    totalValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#bea425]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investment Management</h1>
          <p className="text-gray-600 mt-1">Review, approve, and manage user investments</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {errorMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-linear-to-br from-white to-blue-50 border-2 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-white to-yellow-50 border-2 border-yellow-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#bea425]">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-white to-green-50 border-2 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-white to-orange-50 border-2 border-orange-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Closure Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.closureRequested}</div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-white to-purple-50 border-2 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalValue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white shadow-lg border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user, asset..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Status Filter</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Investments</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved & Active</option>
                  <option value="closure-requested">Closure Requested</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchInvestments} variant="outline" className="w-full">
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investments Table */}
        <Card className="bg-white shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle>Investments ({filteredInvestments.length})</CardTitle>
            <CardDescription>Manage and approve user investments</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-gray-700">User</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Asset</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Current Value</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        No investments found
                      </td>
                    </tr>
                  ) : (
                    filteredInvestments.map((investment) => (
                      <tr key={investment.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{investment.user.name}</p>
                            <p className="text-sm text-gray-500">{investment.user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{investment.asset.name}</p>
                            <p className="text-sm text-gray-500">{investment.quantity.toFixed(4)} {investment.asset.symbol}</p>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-gray-900">{formatCurrency(investment.amount)}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-gray-900">{formatCurrency(investment.currentValue)}</p>
                            <p className={`text-sm ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {investment.profitLoss >= 0 ? '+' : ''}{formatCurrency(investment.profitLoss)}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          {investment.closureRequested ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                              Closure Requested
                            </span>
                          ) : investment.isActive ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                              Pending Approval
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(investment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetailsModal(investment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(investment)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!investment.isActive && !investment.closureRequested && !investment.closedAt && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(investment.id)}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            )}
                            {investment.closureRequested && investment.isActive && (
                              <Button
                                size="sm"
                                onClick={() => openCloseModal(investment)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve Close
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Table */}
        <Card className="bg-white shadow-lg border-2 border-gray-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All investment-related transactions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-gray-700">User</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{tx.user?.name || tx.userId}</td>
                        <td className="p-4">{tx.type}</td>
                        <td className="p-4 font-semibold text-gray-900">{formatCurrency(tx.amount)}</td>
                        <td className="p-4 text-sm text-gray-600">{tx.description}</td>
                        <td className="p-4 text-sm text-gray-600">{formatDateTime(tx.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Investment Details</DialogTitle>
              <DialogDescription>Complete information about this investment</DialogDescription>
            </DialogHeader>
            {selectedInvestment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Investor</Label>
                    <p className="font-semibold">{selectedInvestment.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedInvestment.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Asset</Label>
                    <p className="font-semibold">{selectedInvestment.asset.name} ({selectedInvestment.asset.symbol})</p>
                    <p className="text-sm text-gray-500">Current: {formatCurrency(selectedInvestment.asset.currentPrice)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Investment Amount</Label>
                    <p className="font-semibold text-lg">{formatCurrency(selectedInvestment.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Quantity</Label>
                    <p className="font-semibold text-lg">{selectedInvestment.quantity.toFixed(4)} units</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Purchase Price</Label>
                    <p className="font-semibold">{formatCurrency(selectedInvestment.purchasePrice)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Current Value</Label>
                    <p className="font-semibold">{formatCurrency(selectedInvestment.currentValue)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Profit/Loss</Label>
                    <p className={`font-semibold text-lg ${selectedInvestment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedInvestment.profitLoss >= 0 ? '+' : ''}{formatCurrency(selectedInvestment.profitLoss)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p className="font-semibold">
                      {selectedInvestment.isActive ? (
                        <span className="text-green-600">Approved</span>
                      ) : (
                        <span className="text-yellow-600">Pending Approval</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Deposit Method</Label>
                    <p className="font-semibold">{selectedInvestment.depositMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Created At</Label>
                    <p className="font-semibold">{formatDateTime(selectedInvestment.createdAt)}</p>
                  </div>
                </div>

                {selectedInvestment.depositProof && (
                  <div>
                    <Label className="text-gray-600">Deposit Proof</Label>
                    <a
                      href={selectedInvestment.depositProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Proof
                    </a>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {!selectedInvestment.isActive && (
                    <>
                      <Button
                        onClick={() => handleApprove(selectedInvestment.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve Investment
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedInvestment.id)}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => openEditModal(selectedInvestment)}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1 disabled:opacity-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Investment</DialogTitle>
              <DialogDescription>Update investment details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Investment Amount (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label>Quantity (Units)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label>Purchase Price (per unit)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.purchasePrice}
                  onChange={(e) => setEditForm({ ...editForm, purchasePrice: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label>Current Value (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.currentValue}
                  onChange={(e) => setEditForm({ ...editForm, currentValue: parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleEdit} 
                  disabled={isProcessing}
                  className="flex-1 bg-[#bea425] hover:bg-[#a08d1f] text-black disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button 
                  onClick={() => setShowEditModal(false)} 
                  disabled={isProcessing}
                  variant="outline" 
                  className="flex-1 disabled:opacity-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Close Investment Modal */}
        <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Review Investment Closure Request</DialogTitle>
              <DialogDescription>
                {selectedInvestment && `${selectedInvestment.user.name} wants to close their ${selectedInvestment.asset.name} investment`}
              </DialogDescription>
            </DialogHeader>
            {selectedInvestment && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-semibold text-orange-800">Closure Request Details</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Requested: {selectedInvestment.closureRequestedAt ? formatDateTime(selectedInvestment.closureRequestedAt) : 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Original Investment</Label>
                    <p className="font-semibold text-lg">{formatCurrency(selectedInvestment.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Current Value</Label>
                    <p className="font-semibold text-lg">{formatCurrency(selectedInvestment.currentValue)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Profit/Loss</Label>
                    <p className={`font-semibold text-lg ${selectedInvestment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedInvestment.profitLoss >= 0 ? '+' : ''}{formatCurrency(selectedInvestment.profitLoss)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Return %</Label>
                    <p className={`font-semibold text-lg ${selectedInvestment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedInvestment.profitLoss >= 0 ? '+' : ''}{((selectedInvestment.profitLoss / selectedInvestment.amount) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-800">Amount to Transfer to Balance</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(selectedInvestment.currentValue)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    This amount will be added to user's withdrawable balance
                  </p>
                </div>

                <div>
                  <Label>Admin Notes</Label>
                  <textarea
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    placeholder="Add notes about this closure decision..."
                    className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleApproveClosure}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Closure
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRejectClosure}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
