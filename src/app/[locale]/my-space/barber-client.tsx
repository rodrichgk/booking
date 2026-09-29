'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, Euro, Star, Camera, MapPin, Phone, Scissors, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUploadThing } from '@/lib/uploadthing';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import {
  Panel, PanelHeader, StatGrid, Stat, Badge, Field, EmptyState, Spinner,
  btn, inputClass, formatEuro, type BadgeTone,
} from '@/components/dashboard/ui';

// Confirmed upcoming appointments are the normal case and carry no badge.
const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: 'En attente', tone: 'warning' },
  completed: { label: 'Terminé', tone: 'neutral' },
};

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
  const confirm = useConfirm();
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
    const ok = await confirm({
      title: 'Annuler ce rendez-vous ?',
      description: 'Le client sera prévenu de l’annulation.',
      confirmLabel: 'Annuler le rendez-vous',
      cancelLabel: 'Garder',
      tone: 'danger',
    });
    if (!ok) return;

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
    return booking.totalPrice || booking.servicePrice || '0';
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

  if (!profile) {
    return (
      <Panel>
        <EmptyState
          icon={Scissors}
          title="Profil non configuré"
          description="Vous n'êtes pas encore associé à un salon. Demandez au responsable de votre salon de vous ajouter à l'équipe."
        />
      </Panel>
    );
  }

  const now = new Date();
  const upcoming = bookingsList.filter(b => b.status !== 'cancelled');
  const cancelled = bookingsList.filter(b => b.status === 'cancelled');
  const nextBooking = upcoming.find(b => new Date(b.startTime) >= now);

  return (
    <div className="space-y-8">
      <StatGrid>
        <Stat label="Aujourd'hui" icon={Calendar} value={stats.bookingsToday} hint="rendez-vous" />
        <Stat label="Cette semaine" icon={Clock} value={stats.bookingsWeek} hint="rendez-vous" />
        <Stat label="Gains du mois" icon={Euro} value={formatEuro(stats.monthlyEarnings)} hint="rendez-vous terminés" />
        <Stat label="Note" icon={Star} value={parseFloat(stats.rating) > 0 ? stats.rating : '-'} hint={parseFloat(stats.rating) > 0 ? 'sur 5' : 'Pas encore d’avis'} />
      </StatGrid>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Mes rendez-vous"
            description={nextBooking ? `Prochain : ${formatDate(nextBooking.startTime)} à ${formatTime(nextBooking.startTime)}` : undefined}
          />
          {upcoming.length === 0 ? (
            <EmptyState icon={Calendar} title="Aucun rendez-vous à venir" description="Vos prochaines réservations apparaîtront ici." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((booking) => {
                const status = STATUS[booking.status];
                return (
                  <li key={booking.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <div className="w-20 flex-shrink-0">
                      <p className="text-xs font-medium capitalize text-gray-500">{formatDate(booking.startTime)}</p>
                      <p className="font-display text-base font-semibold tabular-nums text-gray-900">{formatTime(booking.startTime)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-gray-900">{booking.customerName || 'Client'}</p>
                        {status && <Badge tone={status.tone}>{status.label}</Badge>}
                      </div>
                      <p className="truncate text-sm text-gray-500">
                        {booking.serviceName || 'Service non précisé'}, jusqu&apos;à {formatTime(booking.endTime)}
                      </p>
                      {booking.customerPhone && (
                        <a href={`tel:${booking.customerPhone}`} className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-700">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {booking.customerPhone}
                        </a>
                      )}
                    </div>
                    <p className="hidden text-sm font-medium tabular-nums text-gray-900 sm:block">{formatEuro(getBookingPrice(booking))}</p>
                    {booking.status !== 'completed' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingBookingId === booking.id}
                        className={btn.iconDanger}
                        aria-label={`Annuler le rendez-vous de ${booking.customerName || 'ce client'}`}
                      >
                        {cancellingBookingId === booking.id ? <Spinner /> : <X className="h-4 w-4" />}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {cancelled.length > 0 && (
            <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:px-6">
              {cancelled.length} rendez-vous annulé{cancelled.length > 1 ? 's' : ''} masqué{cancelled.length > 1 ? 's' : ''}.
            </p>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Mon profil" />
          <div className="flex flex-col items-center gap-3 border-b border-gray-100 px-5 py-6">
            <label className="group relative cursor-pointer" title="Changer la photo">
              {profileImage ? (
                <Image src={profileImage} alt="" width={96} height={96} className="h-24 w-24 rounded-full object-cover ring-1 ring-gray-200" />
              ) : (
                <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 font-display text-3xl font-semibold text-primary-700 ring-1 ring-primary-100">
                  {userName?.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                {isUploadingImage ? <Spinner className="h-5 w-5 text-white" /> : <Camera className="h-5 w-5 text-white" />}
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" disabled={isUploadingImage} />
            </label>
            <div className="text-center">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">Cliquez sur la photo pour la changer</p>
            </div>
          </div>
          <dl className="space-y-5 px-5 py-5 sm:px-6">
            {barbershop && (
              <Field label="Salon" icon={MapPin}>
                <span className="font-medium">{barbershop.name}</span>
                {barbershop.address && <span className="block text-gray-500">{barbershop.address}, {barbershop.city}</span>}
              </Field>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expérience">{profile.experience ? `${profile.experience} ans` : <span className="text-gray-400">Non renseignée</span>}</Field>
              <Field label="Note">{profile.rating || <span className="text-gray-400">Aucune</span>}</Field>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Biographie</dt>
                {!isEditingBio && (
                  <button onClick={() => setIsEditingBio(true)} className={`${btn.ghost} ${btn.sm} -mr-3`}>
                    Modifier
                  </button>
                )}
              </div>
              <dd className="mt-1">
                {isEditingBio ? (
                  <div className="space-y-2">
                    <label htmlFor="barber-bio" className="sr-only">Biographie</label>
                    <textarea
                      id="barber-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={`${inputClass} resize-none`}
                      rows={4}
                      placeholder="Votre expérience, vos spécialités, votre style..."
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveBio} disabled={isSavingBio} className={`${btn.primary} ${btn.sm}`}>
                        {isSavingBio && <Spinner className="h-3 w-3" />}
                        Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setBio(profile.bio || '');
                          setIsEditingBio(false);
                        }}
                        className={`${btn.secondary} ${btn.sm}`}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{bio || <span className="text-gray-400">Aucune biographie. Présentez-vous aux clients en quelques lignes.</span>}</p>
                )}
              </dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
