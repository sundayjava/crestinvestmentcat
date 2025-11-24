'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Search, Loader2, Plus, Minus, DollarSign, User, CheckCircle, Ban, Check, Eye, Edit } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
  investorType: string | null;
  investableAssets: string | null;
  referralSource: string | null;
  balance: number;
  hasDimeAccount: boolean;
  dimeBankAccountNumber: string | null;
  dimeBankAccountName: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  _count: {
    investments: number;
    withdrawals: number;
    transactions: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [balanceOperation, setBalanceOperation] = useState<'set' | 'increase' | 'decrease'>('set');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dimeAccountData, setDimeAccountData] = useState({ accountNumber: '', accountName: '' });
  const [isCreatingDime, setIsCreatingDime] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);

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
    fetchUsers();
  }, [user, isHydrated]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter(u =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBalanceUpdate = async () => {
    if (!selectedUser || !balanceAmount) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: balanceOperation,
          balance: parseFloat(balanceAmount),
        }),
      });

      if (response.ok) {
        await fetchUsers();
        setBalanceAmount('');
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setIsTogglingStatus(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleCreateDimeAccount = async () => {
    if (!selectedUser || !dimeAccountData.accountNumber || !dimeAccountData.accountName) return;

    setIsCreatingDime(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/dime-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dimeAccountData),
      });

      if (response.ok) {
        await fetchUsers();
        setDimeAccountData({ accountNumber: '', accountName: '' });
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error creating Dime account:', error);
    } finally {
      setIsCreatingDime(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    setIsEditingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          company: editingUser.company,
          address: editingUser.address,
          city: editingUser.city,
          province: editingUser.province,
          postalCode: editingUser.postalCode,
          country: editingUser.country,
        }),
      });

      if (response.ok) {
        await fetchUsers();
        setIsEditDialogOpen(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setIsEditingUser(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600">Manage user accounts and balances</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.emailVerified).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{userData.name}</h3>
                        {userData.emailVerified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {!userData.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{userData.email}</p>
                      {userData.phone && (
                        <p className="text-sm text-gray-600 mb-2">📱 {userData.phone}</p>
                      )}
                      
                      {/* Profile Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm my-3 p-3 bg-gray-50 rounded">
                        {userData.company && (
                          <div>
                            <p className="text-gray-500 text-xs">Company</p>
                            <p className="font-medium">{userData.company}</p>
                          </div>
                        )}
                        {userData.investorType && (
                          <div>
                            <p className="text-gray-500 text-xs">Investor Type</p>
                            <p className="font-medium">{userData.investorType}</p>
                          </div>
                        )}
                        {userData.investableAssets && (
                          <div>
                            <p className="text-gray-500 text-xs">Assets Range</p>
                            <p className="font-medium">{userData.investableAssets}</p>
                          </div>
                        )}
                        {userData.referralSource && (
                          <div>
                            <p className="text-gray-500 text-xs">Referral</p>
                            <p className="font-medium">{userData.referralSource}</p>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      {(userData.city || userData.province || userData.country) && (
                        <p className="text-sm text-gray-600 mb-2">
                          📍 {[userData.city, userData.province, userData.country].filter(Boolean).join(', ')}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                        <div>
                          <p className="text-gray-600">Balance</p>
                          <p className="font-semibold text-[#bea425]">{formatCurrency(userData.balance)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Investments</p>
                          <p className="font-semibold">{userData._count.investments}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Withdrawals</p>
                          <p className="font-semibold">{userData._count.withdrawals}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Dime Account</p>
                          <p className="font-semibold">{userData.hasDimeAccount ? '✓' : '✗'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">Joined {formatDateTime(userData.createdAt)}</p>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {/* Edit User */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser({ ...userData });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      {/* Toggle Active Status */}
                      <Button
                        size="sm"
                        variant={userData.isActive ? 'outline' : 'default'}
                        onClick={() => handleToggleUserStatus(userData.id, userData.isActive)}
                        disabled={isTogglingStatus}
                        className={!userData.isActive ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {userData.isActive ? (
                          <>
                            <Ban className="h-4 w-4 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>

                      {/* View Details */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedUser(userData)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>User Profile - {userData.name}</DialogTitle>
                            <DialogDescription>Complete user information</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Email</p>
                                <p className="text-sm">{userData.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Phone</p>
                                <p className="text-sm">{userData.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Company</p>
                                <p className="text-sm">{userData.company || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Investor Type</p>
                                <p className="text-sm">{userData.investorType || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Investable Assets</p>
                                <p className="text-sm">{userData.investableAssets || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Referral Source</p>
                                <p className="text-sm">{userData.referralSource || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Address</p>
                              <p className="text-sm">
                                {userData.address || 'N/A'}<br/>
                                {userData.city && `${userData.city}, `}
                                {userData.province && `${userData.province} `}
                                {userData.postalCode}<br/>
                                {userData.country}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Dime Account</p>
                              <p className="text-sm">
                                {userData.hasDimeAccount ? (
                                  <>
                                    Account #: {userData.dimeBankAccountNumber}<br/>
                                    Name: {userData.dimeBankAccountName}
                                  </>
                                ) : 'No Dime account'}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Account Status</p>
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 text-xs rounded ${userData.emailVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {userData.emailVerified ? 'Verified' : 'Not Verified'}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded ${userData.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                  {userData.isActive ? 'Active' : 'Disabled'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Statistics</p>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-600">Balance</p>
                                  <p className="font-bold text-[#bea425]">{formatCurrency(userData.balance)}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-600">Investments</p>
                                  <p className="font-bold">{userData._count.investments}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-600">Withdrawals</p>
                                  <p className="font-bold">{userData._count.withdrawals}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* Manage Balance */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedUser(userData)}>
                            <DollarSign className="h-4 w-4 mr-1" />
                            Balance
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Balance - {userData.name}</DialogTitle>
                            <DialogDescription>
                              Current Balance: {formatCurrency(userData.balance)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={balanceOperation === 'set' ? 'default' : 'outline'}
                                onClick={() => setBalanceOperation('set')}
                              >
                                Set
                              </Button>
                              <Button
                                size="sm"
                                variant={balanceOperation === 'increase' ? 'default' : 'outline'}
                                onClick={() => setBalanceOperation('increase')}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Increase
                              </Button>
                              <Button
                                size="sm"
                                variant={balanceOperation === 'decrease' ? 'default' : 'outline'}
                                onClick={() => setBalanceOperation('decrease')}
                              >
                                <Minus className="h-4 w-4 mr-1" />
                                Decrease
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label>Amount (USD)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter amount"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                              />
                            </div>
                            <Button onClick={handleBalanceUpdate} disabled={isUpdating || !balanceAmount} className="w-full">
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Balance'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {!userData.hasDimeAccount && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(userData)}>
                              <User className="h-4 w-4 mr-1" />
                              Create Dime Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Dime Bank Account - {userData.name}</DialogTitle>
                              <DialogDescription>
                                Create a Dime Bank account for this user
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter account number"
                                  value={dimeAccountData.accountNumber}
                                  onChange={(e) => setDimeAccountData({ ...dimeAccountData, accountNumber: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Account Name</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter account holder name"
                                  value={dimeAccountData.accountName}
                                  onChange={(e) => setDimeAccountData({ ...dimeAccountData, accountName: e.target.value })}
                                />
                              </div>
                              <Button 
                                onClick={handleCreateDimeAccount} 
                                disabled={isCreatingDime || !dimeAccountData.accountNumber || !dimeAccountData.accountName} 
                                className="w-full"
                              >
                                {isCreatingDime ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <p className="text-center text-gray-600 py-8">No users found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
            <DialogDescription>
              Update user profile details
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    placeholder="Enter full name"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="Enter email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    placeholder="Enter phone number"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    placeholder="Enter company name"
                    value={editingUser.company || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  placeholder="Enter street address"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    placeholder="Enter city"
                    value={editingUser.city || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-province">Province</Label>
                  <Input
                    id="edit-province"
                    placeholder="Enter province"
                    value={editingUser.province || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, province: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-postalCode">Postal Code</Label>
                  <Input
                    id="edit-postalCode"
                    placeholder="Enter postal code"
                    value={editingUser.postalCode || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  placeholder="Enter country"
                  value={editingUser.country || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                />
              </div>

              <Button 
                onClick={handleEditUser} 
                disabled={isEditingUser || !editingUser.name || !editingUser.email} 
                className="w-full bg-[#bea425] hover:bg-[#d4b942] text-black"
              >
                {isEditingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
