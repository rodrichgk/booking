'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Check, Star, MapPin, Scissors, DollarSign } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface BarberBookingClientProps {
  barber: {
    id: string;
    barbershopId: string;
    name: string;
    profileImage: string | null;
    specialties: string[];
    experience: number | null;
    rating: string | null;
  };
  barbershop: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: string;
    duration: number;
    category: string | null;
  }>;
  locale: string;
  userId: string;
}

export function BarberBookingClient({ barber, barbershop, services, locale, userId }: BarberBookingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedServiceId = searchParams.get('serviceId');
  
  const [step, setStep] = useState(1); // 1: Service, 2: Date/Time, 3: Confirm
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select service if provided in URL and skip to step 2
  useEffect(() => {
    if (preSelectedServiceId && services.find(s => s.id === preSelectedServiceId)) {
      setSelectedService(preSelectedServiceId);
      setStep(2); // Skip to date/time selection
    }
  }, [preSelectedServiceId, services]);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const rating = parseFloat(barber.rating || '0');

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  // Generate next 14 days
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (selectedServiceData?.duration || 60));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: barbershop.id,
          barberId: barber.id,
          serviceId: selectedService,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          totalPrice: selectedServiceData?.price,
          status: 'pending',
        }),
      });

      if (response.ok) {
        router.push(`/${locale}/my-space?booking=success`);
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href={`/${locale}/barbers/${barber.id}`}
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            {barber.profileImage ? (
              <Image
                src={barber.profileImage}
                alt={barber.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <Scissors className="w-10 h-10 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Book with {barber.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{barbershop.name}, {barbershop.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
            {[
              { num: 1, label: 'Service' },
              { num: 2, label: 'Date & Time' },
              { num: 3, label: 'Confirm' },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className="text-xs mt-2 text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-display font-bold mb-4">Select a Service</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service.id);
                    setStep(2);
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedService === service.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-bold text-primary-600">€{service.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-display font-bold mb-4">Select Date & Time</h2>
            
            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Choose a Date</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {generateAvailableDates().map((date) => {
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = dateObj.getDate();
                  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedDate === date
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="text-xs text-gray-600">{dayName}</div>
                      <div className="text-lg font-bold text-gray-900">{dayNum}</div>
                      <div className="text-xs text-gray-600">{monthName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Choose a Time</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {generateTimeSlots().map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedTime === time
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedServiceData && selectedDate && selectedTime && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-display font-bold mb-4">Confirm Your Booking</h2>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Barber</h3>
                <p className="text-gray-900">{barber.name}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                <p className="text-gray-900">{barbershop.name}</p>
                <p className="text-sm text-gray-600">{barbershop.address}, {barbershop.city}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Service</h3>
                <p className="text-gray-900">{selectedServiceData.name}</p>
                <p className="text-sm text-gray-600">{selectedServiceData.duration} minutes</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Date & Time</h3>
                <p className="text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600">{selectedTime}</p>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">€{selectedServiceData.price}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
