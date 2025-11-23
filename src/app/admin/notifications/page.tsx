'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Loader2, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Notification {
  id: string;
  type: 'EMAIL' | 'WHATSAPP' | 'BOTH';
  subject: string;
  message: string;
  recipient: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  sentAt: string;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'EMAIL',
    recipient: 'all',
    subject: '',
    message: '',
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
    fetchNotifications();
  }, [user, isHydrated]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      setSuccess(`Notification sent successfully to ${data.recipientCount} recipient(s)`);
      setFormData({
        type: 'EMAIL',
        recipient: 'all',
        subject: '',
        message: '',
      });
      fetchNotifications();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!isHydrated || isLoading) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">Send notifications to users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Notification Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>
                  Broadcast messages to users via email or WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  {success && (
                    <div className="p-3 text-sm text-[#bea425] bg-[#bea425]/10 border border-[#bea425] rounded-md flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Notification Type</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#bea425]"
                        disabled={isSending}
                      >
                        <option value="EMAIL">Email Only</option>
                        <option value="WHATSAPP">WhatsApp Only</option>
                        <option value="BOTH">Email & WhatsApp</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipients</Label>
                      <select
                        id="recipient"
                        value={formData.recipient}
                        onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#bea425]"
                        disabled={isSending}
                      >
                        <option value="all">All Users</option>
                        <option value="verified">Verified Users Only</option>
                        <option value="dime">Dime Account Holders</option>
                        <option value="investors">Active Investors</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Enter notification subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      disabled={isSending}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message here..."
                      value={formData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                      disabled={isSending}
                      required
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.message.length} characters
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSending}>
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#bea425]" />
                    <span className="text-sm">Total Sent</span>
                  </div>
                  <span className="font-semibold">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#bea425]" />
                    <span className="text-sm">Successful</span>
                  </div>
                  <span className="font-semibold text-[#bea425]">
                    {notifications.filter(n => n.status === 'SENT').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {notifications.filter(n => n.status === 'FAILED').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Keep messages concise and clear</p>
                <p>• Use subject lines that grab attention</p>
                <p>• Test with small groups first</p>
                <p>• WhatsApp requires verified numbers</p>
                <p>• Check spam reports regularly</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Notifications */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>History of sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      {notification.type === 'EMAIL' ? (
                        <Mail className="h-5 w-5 text-[#bea425] mt-0.5" />
                      ) : notification.type === 'WHATSAPP' ? (
                        <MessageSquare className="h-5 w-5 text-[#bea425] mt-0.5" />
                      ) : (
                        <Send className="h-5 w-5 text-[#bea425] mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{notification.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(notification.sentAt)} • To: {notification.recipient}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          notification.status === 'SENT'
                            ? 'bg-[#bea425]/10 text-[#bea425]'
                            : notification.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {notification.status}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {notification.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No notifications sent yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
