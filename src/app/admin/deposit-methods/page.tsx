'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface DepositMethod {
  id: string;
  name: string;
  isActive: boolean;
  accountDetails: any;
}

export default function DepositMethodsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [depositMethods, setDepositMethods] = useState<DepositMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    fetchDepositMethods();
  }, [user, isHydrated]);

  const fetchDepositMethods = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/deposit-methods');
      const data = await response.json();
      setDepositMethods(data.depositMethods || []);
    } catch (error) {
      console.error('Error fetching deposit methods:', error);
      setError('Failed to load deposit methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMethod = () => {
    const newMethod: DepositMethod = {
      id: `method-${Date.now()}`,
      name: 'New Method',
      isActive: true,
      accountDetails: {
        instructions: ''
      }
    };
    setDepositMethods([...depositMethods, newMethod]);
  };

  const handleRemoveMethod = (id: string) => {
    setDepositMethods(depositMethods.filter(m => m.id !== id));
  };

  const handleUpdateMethod = (id: string, field: string, value: any) => {
    setDepositMethods(depositMethods.map(method => {
      if (method.id === id) {
        if (field.startsWith('accountDetails.')) {
          const detailField = field.replace('accountDetails.', '');
          return {
            ...method,
            accountDetails: {
              ...method.accountDetails,
              [detailField]: value
            }
          };
        }
        return { ...method, [field]: value };
      }
      return method;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/deposit-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositMethods }),
      });

      if (!response.ok) {
        throw new Error('Failed to save deposit methods');
      }

      setSuccess('Deposit methods saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
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
      <div className="max-w-5xl mx-auto py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deposit Methods</h1>
            <p className="text-gray-600 mt-1">Manage payment methods and account details</p>
          </div>
          <Button onClick={handleAddMethod} className="bg-[#bea425] hover:bg-[#a08d1f]">
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {depositMethods.map((method, index) => (
            <Card key={method.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Method Name</Label>
                        <Input
                          value={method.name}
                          onChange={(e) => handleUpdateMethod(method.id, 'name', e.target.value)}
                          placeholder="e.g., USDT (TRC20)"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={method.isActive}
                            onChange={(e) => handleUpdateMethod(method.id, 'isActive', e.target.checked)}
                            className="w-4 h-4 text-[#bea425] border-gray-300 rounded focus:ring-[#bea425]"
                          />
                          <span className="text-sm">Active</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMethod(method.id)}
                    className="ml-4 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Instructions</Label>
                  <textarea
                    value={method.accountDetails.instructions || ''}
                    onChange={(e) => handleUpdateMethod(method.id, 'accountDetails.instructions', e.target.value)}
                    placeholder="Instructions for users..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(method.accountDetails).map(([key, value]) => {
                    if (key === 'instructions') return null;
                    return (
                      <div key={key}>
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <Input
                          value={value as string}
                          onChange={(e) => handleUpdateMethod(method.id, `accountDetails.${key}`, e.target.value)}
                          placeholder={`Enter ${key}`}
                        />
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fieldName = prompt('Enter new field name (e.g., swiftCode, email):');
                    if (fieldName) {
                      handleUpdateMethod(method.id, `accountDetails.${fieldName}`, '');
                    }
                  }}
                  className="text-[#bea425]"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Field
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {depositMethods.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No deposit methods configured. Click "Add Method" to create one.
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#bea425] hover:bg-[#a08d1f]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
