'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Clock, Mail, Phone, User, Loader2, Send } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string | null;
  status: string;
  adminResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);

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
    fetchAppointments();
  }, [user, isHydrated]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedAppointment || !adminResponse.trim()) return;

    setIsResponding(true);
    try {
      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminResponse: adminResponse.trim(),
          adminId: user?.id,
        }),
      });

      if (response.ok) {
        await fetchAppointments();
        setShowResponseDialog(false);
        setSelectedAppointment(null);
        setAdminResponse('');
      }
    } catch (error) {
      console.error('Error responding to appointment:', error);
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESPONDED':
        return 'bg-green-100 text-green-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
  const respondedAppointments = appointments.filter(a => a.status !== 'PENDING');

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
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-sm text-gray-600">Manage and respond to appointment requests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pending Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Appointments ({pendingAppointments.length})</CardTitle>
            <CardDescription>Appointment requests awaiting your response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <h3 className="font-semibold">{appointment.name}</h3>
                        {appointment.user && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Registered User
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{appointment.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{appointment.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(appointment.preferredDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{appointment.preferredTime}</span>
                        </div>
                      </div>
                      {appointment.message && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-700">{appointment.message}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        Submitted: {formatDateTime(appointment.createdAt)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="ml-4"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowResponseDialog(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Respond
                    </Button>
                  </div>
                </div>
              ))}
              {pendingAppointments.length === 0 && (
                <p className="text-center text-gray-600 py-8">No pending appointments</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responded Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Responded Appointments ({respondedAppointments.length})</CardTitle>
            <CardDescription>Appointments that have been responded to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {respondedAppointments.slice(0, 10).map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{appointment.name}</h3>
                      <p className="text-sm text-gray-600">{appointment.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Date: {new Date(appointment.preferredDate).toLocaleDateString()} at {appointment.preferredTime}</p>
                    {appointment.respondedAt && (
                      <p className="text-xs mt-1">Responded: {formatDateTime(appointment.respondedAt)}</p>
                    )}
                  </div>
                  {appointment.adminResponse && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium text-green-900">Your Response:</p>
                      <p className="text-gray-700">{appointment.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
              {respondedAppointments.length === 0 && (
                <p className="text-center text-gray-600 py-8">No responded appointments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Appointment Request</DialogTitle>
            <DialogDescription>
              Send a response to {selectedAppointment?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedAppointment.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedAppointment.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedAppointment.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Preferred Date:</span>
                    <p className="font-medium">
                      {new Date(selectedAppointment.preferredDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Preferred Time:</span>
                    <p className="font-medium">{selectedAppointment.preferredTime}</p>
                  </div>
                  {selectedAppointment.message && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Message:</span>
                      <p className="mt-1 text-gray-900">{selectedAppointment.message}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  placeholder="Type your response to the appointment request..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {selectedAppointment.user
                    ? 'This response will be saved as a notification in their dashboard.'
                    : 'This response will be recorded. Consider sending an email separately.'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleRespond}
                  disabled={isResponding || !adminResponse.trim()}
                  className="flex-1"
                >
                  {isResponding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Response
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResponseDialog(false);
                    setAdminResponse('');
                    setSelectedAppointment(null);
                  }}
                  disabled={isResponding}
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
