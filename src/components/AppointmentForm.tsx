'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, X, CheckCircle, Loader2 } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required').matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number'),
  preferredDate: yup.string().required('Please select a date'),
  preferredTime: yup.string().required('Please select a time'),
  message: yup.string().optional().default('').max(500, 'Message must not exceed 500 characters'),
});

type FormData = yup.InferType<typeof schema>;

export default function AppointmentForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Combine date and time into ISO string
      const appointmentDateTime = new Date(`${data.preferredDate}T${data.preferredTime}`);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          preferredDate: appointmentDateTime.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to book appointment');
      }

      setSuccess(true);
      reset();
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today) for date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#bea425] hover:bg-[#a08f1f] text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2 group"
          aria-label="Book Appointment"
        >
          <Calendar className="h-6 w-6" />
          <span className="hidden group-hover:inline-block font-medium pr-2 whitespace-nowrap">
            Book Appointment
          </span>
        </button>
      )}

      {/* Modal/Form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setSuccess(false);
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Form Content */}
            <div className="p-6 md:p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Appointment Requested!
                  </h3>
                  <p className="text-gray-600">
                    We've received your appointment request. Our team will contact you shortly to confirm.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Book an Appointment
                    </h2>
                    <p className="text-sm text-gray-600">
                      Schedule a consultation with our investment experts
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        {...register('name')}
                        disabled={isLoading}
                        className="border-gray-300"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        {...register('email')}
                        disabled={isLoading}
                        className="border-gray-300"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...register('phone')}
                        disabled={isLoading}
                        className="border-gray-300"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Date */}
                      <div className="space-y-2">
                        <Label htmlFor="preferredDate" className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Preferred Date *
                        </Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          min={today}
                          {...register('preferredDate')}
                          disabled={isLoading}
                          className="border-gray-300"
                        />
                        {errors.preferredDate && (
                          <p className="text-xs text-red-600">{errors.preferredDate.message}</p>
                        )}
                      </div>

                      {/* Time */}
                      <div className="space-y-2">
                        <Label htmlFor="preferredTime" className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Preferred Time *
                        </Label>
                        <select
                          id="preferredTime"
                          {...register('preferredTime')}
                          disabled={isLoading}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select time</option>
                          <option value="09:00">09:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">01:00 PM</option>
                          <option value="14:00">02:00 PM</option>
                          <option value="15:00">03:00 PM</option>
                          <option value="16:00">04:00 PM</option>
                          <option value="17:00">05:00 PM</option>
                        </select>
                        {errors.preferredTime && (
                          <p className="text-xs text-red-600">{errors.preferredTime.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us what you'd like to discuss..."
                        rows={3}
                        {...register('message')}
                        disabled={isLoading}
                        className="border-gray-300 resize-none"
                      />
                      {errors.message && (
                        <p className="text-xs text-red-600">{errors.message.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsOpen(false);
                          setError('');
                        }}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#bea425] hover:bg-[#a08f1f] text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          'Book Appointment'
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
