'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/routing';
import { Calendar, Clock, User, ArrowLeft, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Demo data - will be replaced with database calls later
const demoShops = {
  '1': {
    id: '1',
    name: 'Salon Afro Élégance',
    services: [
      { id: '1', name: 'Coupe Afro', price: 35, duration: 45 },
      { id: '2', name: 'Tresses Africaines', price: 80, duration: 180 },
      { id: '3', name: 'Défrisage', price: 65, duration: 120 },
      { id: '4', name: 'Soins Hydratants', price: 45, duration: 60 },
      { id: '5', name: 'Locks/Dreadlocks', price: 120, duration: 240 }
    ],
    barbers: [
      { id: '1', name: 'Aminata Diallo', specialty: 'Tresses & Nattes' },
      { id: '2', name: 'Marcus Johnson', specialty: 'Coupes Modernes' },
      { id: '3', name: 'Fatou Keita', specialty: 'Soins Naturels' }
    ]
  },
  '2': {
    id: '2',
    name: 'Natural Hair Studio',
    services: [
      { id: '1', name: 'Wash & Go', price: 25, duration: 30 },
      { id: '2', name: 'Twist Out', price: 40, duration: 90 },
      { id: '3', name: 'Protective Styles', price: 95, duration: 200 },
      { id: '4', name: 'Deep Conditioning', price: 35, duration: 45 }
    ],
    barbers: [
      { id: '1', name: 'Sarah Williams', specialty: 'Cheveux Naturels' },
      { id: '2', name: 'Khadija Mbaye', specialty: 'Styles Protecteurs' }
    ]
  }
};

// Generate demo time slots
const generateTimeSlots = () => {
  const slots = [];
  const today = new Date();
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    const daySlots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break; // Don't go past 18:00
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = Math.random() > 0.3; // 70% chance of being available
        
        daySlots.push({
          time,
          available: isAvailable
        });
      }
    }
    
    slots.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      }),
      slots: daySlots
    });
  }
  
  return slots;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const shop = demoShops[shopId as keyof typeof demoShops];
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  const timeSlots = generateTimeSlots();
  const t = useTranslations('booking');

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-sans font-bold text-gray-900 mb-4">Salon non trouvé</h1>
          <Link href="/barbershops" className="btn-primary">
            Retour aux salons
          </Link>
        </div>
      </div>
    );
  }

  const selectedServiceData = shop.services.find(s => s.id === selectedService);
  const selectedBarberData = shop.barbers.find(b => b.id === selectedBarber);
  const selectedDateData = timeSlots.find(d => d.date === selectedDate);

  const handleBooking = () => {
    // Demo booking confirmation - will integrate with backend later
    alert('Réservation confirmée ! Vous recevrez un email de confirmation.');
    router.push(`/barbershops/${shopId}`);
  };

  const canProceedToStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 2: return selectedService !== '';
      case 3: return selectedBarber !== '';
      case 4: return selectedDate !== '' && selectedTime !== '';
      case 5: return customerInfo.name !== '' && customerInfo.email !== '' && customerInfo.phone !== '';
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/barbershops/${shopId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-sans font-bold text-gray-900">Réserver un rendez-vous</h1>
              <p className="text-gray-600 font-body">{shop.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { number: 1, title: 'Service' },
              { number: 2, title: 'Coiffeur' },
              { number: 3, title: 'Date & Heure' },
              { number: 4, title: 'Informations' },
              { number: 5, title: 'Confirmation' }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-body font-semibold text-sm ${
                  step >= stepItem.number 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepItem.number ? <Check className="w-4 h-4" /> : stepItem.number}
                </div>
                <span className={`ml-2 text-sm font-body ${
                  step >= stepItem.number ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </span>
                {index < 4 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    step > stepItem.number ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-6">Choisissez un service</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {shop.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`text-left border-2 rounded-lg p-4 transition-colors ${
                    selectedService === service.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-body font-semibold text-gray-900">{service.name}</h3>
                    <span className="text-primary-600 font-sans font-bold">{service.price}€</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-body">{service.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Barber Selection */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-6">Choisissez votre coiffeur</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {shop.barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber.id)}
                  className={`text-left border-2 rounded-lg p-4 transition-colors ${
                    selectedBarber === barber.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-sans font-bold">
                        {barber.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-body font-semibold text-gray-900">{barber.name}</h3>
                      <p className="text-sm text-gray-600 font-body">{barber.specialty}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Selection */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-6">Choisissez une date et heure</h2>
            
            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="font-body font-semibold text-gray-900 mb-3">Date</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {timeSlots.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedTime(''); // Reset time when date changes
                    }}
                    className={`p-3 text-center border-2 rounded-lg transition-colors ${
                      selectedDate === day.date
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-body font-semibold text-sm text-gray-900">
                      {day.displayDate.split(' ')[0]}
                    </div>
                    <div className="font-body text-xs text-gray-600">
                      {day.displayDate.split(' ')[1]} {day.displayDate.split(' ')[2]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && selectedDateData && (
              <div>
                <h3 className="font-body font-semibold text-gray-900 mb-3">Heure</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {selectedDateData.slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-2 text-center border-2 rounded-lg transition-colors font-body text-sm ${
                        !slot.available
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedTime === slot.time
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 text-gray-900'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Customer Information */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-6">Vos informations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                  placeholder="Demandes spéciales, allergies, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-6">Confirmation de votre réservation</h2>
            
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-body font-semibold text-gray-900 mb-3">Récapitulatif</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-body text-gray-600">Service:</span>
                    <span className="font-body font-semibold">{selectedServiceData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-gray-600">Coiffeur:</span>
                    <span className="font-body font-semibold">{selectedBarberData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-gray-600">Date:</span>
                    <span className="font-body font-semibold">{selectedDateData?.displayDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-gray-600">Heure:</span>
                    <span className="font-body font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-gray-600">Durée:</span>
                    <span className="font-body font-semibold">{selectedServiceData?.duration} min</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-body font-semibold text-gray-900">Total:</span>
                      <span className="font-sans font-bold text-primary-600 text-lg">{selectedServiceData?.price}€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-body font-semibold text-gray-900 mb-3">Vos informations</h3>
                <div className="space-y-1">
                  <p className="font-body text-gray-900">{customerInfo.name}</p>
                  <p className="font-body text-gray-600">{customerInfo.email}</p>
                  <p className="font-body text-gray-600">{customerInfo.phone}</p>
                  {customerInfo.notes && (
                    <p className="font-body text-gray-600 text-sm mt-2">
                      <span className="font-semibold">Notes:</span> {customerInfo.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-body font-semibold transition-colors ${
              step === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Précédent
          </button>
          
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceedToStep(step + 1)}
              className={`px-6 py-3 rounded-lg font-body font-semibold transition-colors ${
                canProceedToStep(step + 1)
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleBooking}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-body font-semibold hover:bg-primary-700 transition-colors"
            >
              Confirmer la réservation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
