'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, DollarSign, Star, Users, Camera, Loader2, MapPin, Phone, Scissors, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUploadThing } from '@/lib/uploadthing';

interface BarberProfile {
  id: string;
  barbershopId: string | null;
  profileImage: string | null;
  galleryImages: string[] | null;
  youtubeLinks: string[] | null;
  bio: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
}

interface BarberBooking {
  id: string;
  customerName: string;
  customerPhone: string | null;
  serviceName: string;
  servicePrice: string | null;
  startTime: Date;
  endTime: Date;
  status: string;
  totalPrice: string | null;
}

interface BarbershopInfo {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
}

interface BarberStats {
  bookingsToday: number;
  bookingsWeek: number;
  monthlyEarnings: string;
  rating: string;
}

interface BarberSpaceClientProps {
  profile: BarberProfile | null;
  barbershop: BarbershopInfo | null;
  bookings: BarberBooking[];
  stats: BarberStats;
  locale: string;
  userName: string;
}

export function BarberSpaceClient({ profile, barbershop, bookings, stats, locale, userName }: BarberSpaceClientProps) {
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState(profile?.profileImage || null);
  const [bio, setBio] = useState(profile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [bookingsList, setBookingsList] = useState(bookings);

  const { startUpload } = useUploadThing('barberImage', {
    onUploadError: (error) => {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Erreur lors du téléchargement' });
      setIsUploadingImage(false);
    },
  });

  const statsDisplay = [
    { label: "Rendez-vous aujourd'hui", value: stats.bookingsToday.toString(), icon: Calendar, color: 'bg-slate-100 text-slate-700' },
    { label: 'Cette semaine', value: stats.bookingsWeek.toString(), icon: Clock, color: 'bg-slate-100 text-slate-700' },
    { label: 'Gains du mois', value: `€${stats.monthlyEarnings}`, icon: DollarSign, color: 'bg-slate-100 text-slate-700' },
    { label: 'Note moyenne', value: stats.rating, icon: Star, color: 'bg-amber-50 text-amber-600' },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'error', title: 'Erreur', description: 'Veuillez sélectionner une image' });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast({ variant: 'error', title: 'Erreur', description: 'Image trop volumineuse (max 4MB)' });
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadResult = await startUpload([file]);

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('Échec du téléchargement');
      }

      const uploadedUrl = uploadResult[0].url;

      const updateRes = await fetch(`/api/barbers/${profile.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: uploadedUrl }),
      });

      if (!updateRes.ok) throw new Error('Erreur lors de la mise à jour');

      setProfileImage(uploadedUrl);
      toast({ variant: 'success', title: 'Succès', description: 'Photo de profil mise à jour' });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Une erreur est survenue' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveBio = async () => {
    if (!profile) return;

    setIsSavingBio(true);
    try {
      const res = await fetch(`/api/barbers/${profile.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');

      setIsEditingBio(false);
      toast({ variant: 'success', title: 'Succès', description: 'Biographie mise à jour' });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Une erreur est survenue' });
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    setCancellingBookingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'annulation');

      setBookingsList(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      toast({ variant: 'success', title: 'Succès', description: 'Rendez-vous annulé' });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Une erreur est survenue' });
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getBookingPrice = (booking: BarberBooking) => {
    const price = booking.totalPrice || booking.servicePrice || '0';
    return parseFloat(price).toFixed(2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profil non configuré</h2>
        <p className="text-gray-600">
          Vous n'êtes pas encore associé à un salon. Contactez l'administrateur de votre salon pour être ajouté.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mon Profil</h3>

            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={userName}
                    width={120}
                    height={120}
                    className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                    <span className="text-3xl font-semibold text-white">
                      {userName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Cliquez pour changer</p>
            </div>

            {/* Barbershop Info */}
            {barbershop && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">Mon salon</p>
                <p className="font-semibold text-gray-900">{barbershop.name}</p>
                {barbershop.address && (
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {barbershop.address}, {barbershop.city}
                  </p>
                )}
              </div>
            )}

            {/* Bio */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Biographie</p>
                <button
                  onClick={() => setIsEditingBio(!isEditingBio)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  {isEditingBio ? 'Annuler' : 'Modifier'}
                </button>
              </div>
              {isEditingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm text-gray-900"
                    rows={4}
                    placeholder="Décrivez votre expérience, vos spécialités..."
                  />
                  <button
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    {isSavingBio ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  {bio || 'Aucune biographie ajoutée'}
                </p>
              )}
            </div>

            {/* Experience & Rating */}
            <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Expérience</p>
                <p className="font-semibold text-gray-900">
                  {profile.experience ? `${profile.experience} ans` : 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Note</p>
                <p className="font-semibold text-gray-900 flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  {profile.rating || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes Rendez-vous</h3>

            {bookingsList.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun rendez-vous à venir</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsList.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.serviceName}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(booking.startTime)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">€{getBookingPrice(booking)}</p>
                      </div>
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingBookingId === booking.id}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Annuler le rendez-vous"
                        >
                          {cancellingBookingId === booking.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
