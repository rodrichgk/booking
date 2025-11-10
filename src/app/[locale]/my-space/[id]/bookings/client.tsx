'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { 
  ArrowLeft, CalendarCheck, User, Mail, Phone, Clock, Euro,
  Calendar, CheckCircle, XCircle, AlertCircle, X
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface Barbershop {
  id: string;
  name: string;
  city: string;
  address: string;
}

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string | null;
  notes: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt: Date;
  serviceName: string | null;
  servicePrice: string | null;
  serviceDuration: number | null;
  barberName: string | null;
}

interface BookingsManagementClientProps {
  shop: Barbershop;
  bookings: Booking[];
  locale: string;
}

export function BookingsManagementClient({ 
  shop, 
  bookings,
  locale 
}: BookingsManagementClientProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    setProcessingId(bookingId);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Reload the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setProcessingId(null);
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    setProcessingId(bookingId);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      // Reload the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setProcessingId(null);
    }
  };
  
  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    
    if (filter === 'upcoming') {
      return bookingDate >= now && booking.status !== 'cancelled';
    } else if (filter === 'past') {
      return bookingDate < now;
    } else if (filter === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true; // 'all'
  });

  // Count bookings by status
  const upcomingCount = bookings.filter(b => new Date(b.startTime) >= now && b.status !== 'cancelled').length;
  const pastCount = bookings.filter(b => new Date(b.startTime) < now).length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/my-space/${shop.id}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-sans font-bold text-gray-900">Réservations</h1>
                <p className="text-gray-600 mt-1">{shop.name} - {shop.city}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {bookings.length} réservation{bookings.length > 1 ? 's' : ''} au total
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'upcoming'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              À venir ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'past'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Passées ({pastCount})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'cancelled'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Annulées ({cancelledCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Erreur</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune réservation
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' && "Les réservations de vos clients apparaîtront ici"}
              {filter === 'upcoming' && "Aucune réservation à venir"}
              {filter === 'past' && "Aucune réservation passée"}
              {filter === 'cancelled' && "Aucune réservation annulée"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coiffeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => {
                    const bookingDate = new Date(booking.startTime);
                    const isPast = bookingDate < now;
                    
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{booking.customerName}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-500">{booking.customerEmail}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-500">{booking.customerPhone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{booking.serviceName || 'N/A'}</div>
                            {booking.servicePrice && (
                              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Euro className="w-3 h-3 mr-1" />
                                  <span>{booking.servicePrice}€</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{booking.serviceDuration} min</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{booking.barberName || 'Non assigné'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {bookingDate.toLocaleDateString('fr-FR', { 
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {bookingDate.toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {booking.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                            {booking.status === 'confirmed' ? 'Confirmé' : 
                             booking.status === 'cancelled' ? 'Annulé' :
                             booking.status === 'completed' ? 'Terminé' :
                             booking.status || 'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {!isPast && booking.status === 'confirmed' && (
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={processingId === booking.id}
                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === booking.id ? 'En cours...' : 'Annuler'}
                              </button>
                            )}
                            {isPast && booking.status === 'confirmed' && (
                              <button 
                                onClick={() => handleMarkCompleted(booking.id)}
                                disabled={processingId === booking.id}
                                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === booking.id ? 'En cours...' : 'Marquer terminé'}
                              </button>
                            )}
                            {booking.notes && (
                              <button 
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title={booking.notes}
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
