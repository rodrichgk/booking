'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { Calendar, Clock, User, ArrowLeft, Check, AlertCircle, Scissors, Euro, Loader2 } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';

interface Barbershop {
  id: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
}

interface Barber {
  id: string;
  name: string | null;
  specialties: string[] | null;
  isActive: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: string | null;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface BookingClientProps {
  shop: Barbershop;
  barbers: Barber[];
  services: Service[];
  locale: string;
  userInfo: UserInfo | null;
}

// Generate available dates for the next 7 days
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

// Generate time slots from 9am to 7pm, filtering past times if it's today
const generateTimeSlots = (selectedDate: Date | null) => {
  const slots = [];
  const now = new Date();
  const isToday = selectedDate && 
    selectedDate.getDate() === now.getDate() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear();
  
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  for (let hour = 9; hour <= 19; hour++) {
    // Add :00 slot
    if (!isToday || hour > currentHour || (hour === currentHour && currentMinutes < 0)) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    // Add :30 slot
    if (hour < 19) {
      if (!isToday || hour > currentHour || (hour === currentHour && currentMinutes < 30)) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
  }
  return slots;
};

export function BookingClient({ shop, barbers, services, locale, userInfo }: BookingClientProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'service' | 'barber' | 'date' | 'time' | 'confirm'>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState(userInfo?.name || '');
  const [customerEmail, setCustomerEmail] = useState(userInfo?.email || '');
  const [customerPhone, setCustomerPhone] = useState(userInfo?.phone || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableDates = generateAvailableDates();
  const availableTimeSlots = generateTimeSlots(selectedDate);
  const activeBarbers = barbers.filter(b => b.isActive);

  const formatDate = (date: Date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const canProceed = () => {
    if (step === 'service') return selectedService !== null;
    if (step === 'barber' && activeBarbers.length > 0) return selectedBarber !== null;
    if (step === 'date') return selectedDate !== null;
    if (step === 'time') return selectedTime !== null;
    if (step === 'confirm') return customerName && customerEmail && customerPhone;
    return false;
  };

  const handleNext = async () => {
    if (step === 'service') {
      if (activeBarbers.length > 0) {
        setStep('barber');
      } else {
        setStep('date');
      }
    }
    else if (step === 'barber') setStep('date');
    else if (step === 'date') setStep('time');
    else if (step === 'time') setStep('confirm');
    else if (step === 'confirm') {
      setIsSubmitting(true);
      setError(null);

      try {
        // Create appointment date-time
        const appointmentDateTime = new Date(selectedDate!);
        const [hours, minutes] = selectedTime!.split(':');
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            barbershopId: shop.id,
            barberId: selectedBarber,
            serviceId: selectedService,
            appointmentDate: appointmentDateTime.toISOString(),
            customerName,
            customerEmail,
            customerPhone,
            notes,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create booking');
        }

        setSuccess(true);
        toast({
          title: "✅ Réservation confirmée!",
          description: `Votre rendez-vous a été confirmé pour le ${formatDate(selectedDate!)} à ${selectedTime}`,
          variant: "success",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(errorMessage);
        toast({
          title: "❌ Erreur de réservation",
          description: errorMessage,
          variant: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'barber') setStep('service');
    else if (step === 'date' && activeBarbers.length > 0) setStep('barber');
    else if (step === 'date') setStep('service');
    else if (step === 'time') setStep('date');
    else if (step === 'confirm') setStep('time');
  };

  const selectedBarberData = activeBarbers.find(b => b.id === selectedBarber);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/barbershops/${shop.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-sans font-bold text-gray-900">Réserver un rendez-vous</h1>
              <p className="text-gray-600 mt-1">{shop.name} - {shop.city}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-6 overflow-x-auto pb-2">
            {/* Service Step */}
            <div className={`flex items-center flex-shrink-0 ${step === 'service' ? 'text-primary-600' : 'text-green-600'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 'service' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'}`}>
                {step === 'service' ? '1' : <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden xs:inline">Service</span>
            </div>
            <div className="w-4 sm:w-12 h-0.5 bg-gray-300 flex-shrink-0" />

            {/* Barber Step (conditional) */}
            {activeBarbers.length > 0 && (
              <>
                <div className={`flex items-center flex-shrink-0 ${step === 'barber' ? 'text-primary-600' : (step === 'date' || step === 'time' || step === 'confirm') ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 'barber' ? 'bg-primary-600 text-white' : (step === 'date' || step === 'time' || step === 'confirm') ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                    {(step === 'date' || step === 'time' || step === 'confirm') ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : '2'}
                  </div>
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline">Coiffeur</span>
                </div>
                <div className="w-4 sm:w-12 h-0.5 bg-gray-300 flex-shrink-0" />
              </>
            )}
            
            {/* Date Step */}
            <div className={`flex items-center flex-shrink-0 ${step === 'date' ? 'text-primary-600' : (step === 'time' || step === 'confirm') ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 'date' ? 'bg-primary-600 text-white' : (step === 'time' || step === 'confirm') ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                {(step === 'time' || step === 'confirm') ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : activeBarbers.length > 0 ? '3' : '2'}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden xs:inline">Date</span>
            </div>
            <div className="w-4 sm:w-12 h-0.5 bg-gray-300 flex-shrink-0" />
            
            {/* Time Step */}
            <div className={`flex items-center flex-shrink-0 ${step === 'time' ? 'text-primary-600' : step === 'confirm' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 'time' ? 'bg-primary-600 text-white' : step === 'confirm' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                {step === 'confirm' ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : activeBarbers.length > 0 ? '4' : '3'}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden xs:inline">Heure</span>
            </div>
            <div className="w-4 sm:w-12 h-0.5 bg-gray-300 flex-shrink-0" />
            
            {/* Confirm Step */}
            <div className={`flex items-center flex-shrink-0 ${step === 'confirm' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 'confirm' ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>
                {activeBarbers.length > 0 ? '5' : '4'}
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline">Confirmer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success State */}
        {success ? (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée!</h2>
            <p className="text-gray-600 mb-6">
              Un email de confirmation a été envoyé à <strong>{customerEmail}</strong>
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Détails de votre rendez-vous</h3>
              <div className="space-y-2 text-sm">
                {selectedBarberData && (
                  <div className="flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    <span>{selectedBarberData.name}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{selectedDate && formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{selectedTime}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/barbershops/${shop.id}`}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Retour au salon
              </Link>
              <Link
                href="/barbershops"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Explorer d'autres salons
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Erreur</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Select Service Step */}
            {step === 'service' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Choisissez un service</h2>
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Aucun service disponible pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group services by category */}
                    {['haircut', 'beard', 'styling', 'coloring', 'treatment', 'combo'].map((category) => {
                      const categoryServices = services.filter(s => s.category === category);
                      if (categoryServices.length === 0) return null;

                      const categoryLabels: Record<string, string> = {
                        'haircut': '💇 Coupes',
                        'beard': '🧔 Barbe',
                        'styling': '✨ Coiffure',
                        'coloring': '🎨 Coloration',
                        'treatment': '💆 Soins',
                        'combo': '🎁 Forfaits',
                      };

                      return (
                        <div key={category} className="space-y-2">
                          <h3 className="font-semibold text-gray-700 text-sm">{categoryLabels[category]}</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {categoryServices.map((service) => (
                              <button
                                key={service.id}
                                onClick={() => setSelectedService(service.id)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  selectedService === service.id
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                    {service.description && (
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center text-primary-600 font-semibold">
                                    <Euro className="w-4 h-4 mr-1" />
                                    <span>{service.price}€</span>
                                  </div>
                                  <div className="flex items-center text-gray-500 text-sm">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{service.duration} min</span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Select Barber Step */}
            {step === 'barber' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choisissez votre coiffeur</h2>
              {activeBarbers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Aucun coiffeur disponible pour le moment</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {activeBarbers.map((barber) => (
                    <button
                      key={barber.id}
                      onClick={() => setSelectedBarber(barber.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedBarber === barber.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">
                            {barber.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{barber.name}</h3>
                          {barber.specialties && barber.specialties.length > 0 && (
                            <p className="text-sm text-gray-600">{barber.specialties[0]}</p>
                          )}
                        </div>
                        {selectedBarber === barber.id && (
                          <Check className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Select Date Step */}
          {step === 'date' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choisissez une date</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableDates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-600">{formatDate(date)}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{date.getDate()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Select Time Step */}
          {step === 'time' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choisissez une heure</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTime === time
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <p className="text-center font-semibold">{time}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmez votre réservation</h2>
              
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Résumé</h3>
                <div className="space-y-2 text-sm">
                  {selectedBarberData && (
                    <div className="flex items-center text-gray-700">
                      <User className="w-4 h-4 mr-2" />
                      <span>{selectedBarberData.name}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{selectedDate && formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre nom"
                    disabled={!!userInfo?.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="votre@email.com"
                    disabled={!!userInfo?.email}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+33 6 12 34 56 78"
                    disabled={!!userInfo?.phone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Des demandes particulières?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
            {step !== 'service' && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Retour
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className={`sm:ml-auto px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 ${
                canProceed() && !isSubmitting
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'En cours...' : step === 'confirm' ? 'Confirmer' : 'Suivant'}
            </button>
          </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
