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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Edit, Plus, Trash2 } from 'lucide-react';
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    symbol: '',
    type: 'GOLD',
    description: '',
    currentPrice: '',
    minInvestment: '',
    imageUrl: '',
  });

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

  const handleCreateAsset = async () => {
    if (!newAsset.name || !newAsset.symbol || !newAsset.currentPrice) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAsset,
          currentPrice: parseFloat(newAsset.currentPrice),
          minInvestment: newAsset.minInvestment ? parseFloat(newAsset.minInvestment) : 10,
        }),
      });

      if (response.ok) {
        await fetchAssets();
        setIsAddDialogOpen(false);
        setNewAsset({
          name: '',
          symbol: '',
          type: 'GOLD',
          description: '',
          currentPrice: '',
          minInvestment: '',
          imageUrl: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create asset');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to create asset');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (!confirm(`Are you sure you want to delete "${assetName}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(assetId);
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAssets();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditAsset = async () => {
    if (!editingAsset) return;

    setIsEditing(true);
    try {
      const response = await fetch(`/api/assets/${editingAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingAsset.name,
          symbol: editingAsset.symbol,
          type: editingAsset.type,
          description: editingAsset.description,
          currentPrice: parseFloat(editingAsset.currentPrice),
          minInvestment: editingAsset.minInvestment ? parseFloat(editingAsset.minInvestment) : 10,
          imageUrl: editingAsset.imageUrl,
        }),
      });

      if (response.ok) {
        await fetchAssets();
        setIsEditDialogOpen(false);
        setEditingAsset(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update asset');
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Failed to update asset');
    } finally {
      setIsEditing(false);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
              <p className="text-sm text-gray-600">Manage asset prices and monitor market performance</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#bea425] hover:bg-[#d4b942] text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>
                    Create a new investment asset for users to invest in
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Asset Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Gold"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Symbol *</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., AU"
                        value={newAsset.symbol}
                        onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Asset Type *</Label>
                    <Select value={newAsset.type} onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="SILVER">Silver</SelectItem>
                        <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                        <SelectItem value="STOCKS">Stocks</SelectItem>
                        <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                        <SelectItem value="BONDS">Bonds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPrice">Current Price (USD) *</Label>
                      <Input
                        id="currentPrice"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1850.50"
                        value={newAsset.currentPrice}
                        onChange={(e) => setNewAsset({ ...newAsset, currentPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minInvestment">Min Investment (USD)</Label>
                      <Input
                        id="minInvestment"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 100 (default: 10)"
                        value={newAsset.minInvestment}
                        onChange={(e) => setNewAsset({ ...newAsset, minInvestment: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={newAsset.imageUrl}
                      onChange={(e) => setNewAsset({ ...newAsset, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter asset description..."
                      value={newAsset.description}
                      onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateAsset} 
                    disabled={isCreating || !newAsset.name || !newAsset.symbol || !newAsset.currentPrice} 
                    className="w-full bg-[#bea425] hover:bg-[#d4b942] text-black"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Asset'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingAsset({
                            ...asset,
                            currentPrice: asset.currentPrice.toString(),
                            minInvestment: asset.minInvestment.toString(),
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedAsset({ ...asset, _count: { investments: 0 } })}>
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Price
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
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteAsset(asset.id, asset.name)}
                      disabled={isDeleting === asset.id}
                    >
                      {isDeleting === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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

      {/* Edit Asset Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update asset information and settings
            </DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Asset Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Gold"
                    value={editingAsset.name}
                    onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-symbol">Symbol *</Label>
                  <Input
                    id="edit-symbol"
                    placeholder="e.g., AU"
                    value={editingAsset.symbol}
                    onChange={(e) => setEditingAsset({ ...editingAsset, symbol: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Asset Type *</Label>
                <Select value={editingAsset.type} onValueChange={(value) => setEditingAsset({ ...editingAsset, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                    <SelectItem value="STOCKS">Stocks</SelectItem>
                    <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                    <SelectItem value="BONDS">Bonds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-currentPrice">Current Price (USD) *</Label>
                  <Input
                    id="edit-currentPrice"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1850.50"
                    value={editingAsset.currentPrice}
                    onChange={(e) => setEditingAsset({ ...editingAsset, currentPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minInvestment">Min Investment (USD)</Label>
                  <Input
                    id="edit-minInvestment"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 100"
                    value={editingAsset.minInvestment}
                    onChange={(e) => setEditingAsset({ ...editingAsset, minInvestment: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={editingAsset.imageUrl || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, imageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter asset description..."
                  value={editingAsset.description || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleEditAsset} 
                disabled={isEditing || !editingAsset.name || !editingAsset.symbol || !editingAsset.currentPrice} 
                className="w-full bg-[#bea425] hover:bg-[#d4b942] text-black"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Asset'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
