'use client';

import { useState, useCallback, useEffect } from 'react';
import { Link, useRouter } from '@/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Store, MapPin, Phone, Mail, Globe, Star, Calendar, Users,
  Settings, CreditCard, Plus, Edit2, Trash2, X, Eye, EyeOff, Upload, UserPlus,
  AlertCircle, TrendingUp, Clock, ArrowLeft, Scissors, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { useUploadThing } from '@/lib/uploadthing';
import {
  PageHeader, PageShell, Tabs, Panel, PanelHeader, PanelBody, SectionHeading,
  StatGrid, Stat, Badge, Field, Avatar, EmptyState, Notice, Spinner,
  btn, inputClass, labelClass, backLinkClass, formatEuro, type BadgeTone,
} from '@/components/dashboard/ui';
import { Modal } from '@/components/dashboard/modal';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import { useSettings } from '@/contexts/settings-context';

const MAX_SERVICE_IMAGE_MB = 4;

const SUBSCRIPTION_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Abonnement actif', tone: 'success' },
  past_due: { label: 'Paiement en retard', tone: 'warning' },
  expired: { label: 'Abonnement expiré', tone: 'danger' },
  canceled: { label: 'Abonnement annulé', tone: 'neutral' },
  inactive: { label: 'Sans abonnement', tone: 'neutral' },
};

const SERVICE_CATEGORIES = [
  { id: 'haircut', label: 'Coupes' },
  { id: 'beard', label: 'Barbe' },
  { id: 'styling', label: 'Coiffure' },
  { id: 'coloring', label: 'Coloration' },
  { id: 'treatment', label: 'Soins' },
  { id: 'combo', label: 'Forfaits' },
];

const BARBER_TYPES = ['Coiffeur', 'Coiffeuse', 'Tresses / Braids', 'Barbier', 'Coloriste', 'Mixte'];

const checkboxClass = 'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500';
const timeInputClass =
  'rounded-md border border-gray-300 bg-white px-2 py-1 text-xs tabular-nums text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

interface Barbershop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  images: string[] | null;
  website: string | null;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean;
  ownerId: string;
  coOwnerId: string | null;
  coOwnerName: string | null;
  coOwnerEmail: string | null;
  createdAt: Date;
  openingHours: OpeningHours | null;
}

interface Barber {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  barberType: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
  bio: string | null;
  isActive: boolean;
  openingHours: OpeningHours | null;
  createdAt: Date;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: string;
  duration: number;
  category: string | null;
  isActive: boolean | null;
  createdAt: Date;
}

interface Booking {
  startTime: Date;
  status: string | null;
}

interface ManageBarbershopClientProps {
  shop: Barbershop;
  barbers: Barber[];
  services: Service[];
  bookings: Booking[];
  subscriptionStatus: 'active' | 'expired' | 'inactive' | 'past_due' | 'canceled';
  locale: string;
  subscriptionPrice: number;
  closures: { date: string; reason: string | null }[];
}

export function ManageBarbershopClient({
  shop,
  barbers,
  services,
  bookings,
  subscriptionStatus,
  locale,
  subscriptionPrice,
  closures: initialClosures,
}: ManageBarbershopClientProps) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const { passwordMinLength } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  type TabId = 'overview' | 'barbers' | 'services' | 'gallery' | 'schedule' | 'settings';
  const validTabs: TabId[] = ['overview', 'barbers', 'services', 'gallery', 'schedule', 'settings'];
  const initialTab = (validTabs.includes(searchParams.get('tab') as TabId) ? searchParams.get('tab') : 'overview') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const setTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  }, []);
  // Sync tab state with browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as TabId;
      if (tab && validTabs.includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab('overview');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const t = useTranslations('barbershopManagement');
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shopActive, setShopActive] = useState(shop.isActive);
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, boolean>>(
    services.reduce((acc, s) => ({ ...acc, [s.id]: s.isActive ?? true }), {})
  );

  // Service form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceCategory, setServiceCategory] = useState('haircut');
  const [serviceImage, setServiceImage] = useState('');
  const [isUploadingServiceImage, setIsUploadingServiceImage] = useState(false);

  // Barber form states
  const [isAddingBarber, setIsAddingBarber] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [barberName, setBarberName] = useState('');
  const [barberEmail, setBarberEmail] = useState('');
  const [barberPhone, setBarberPhone] = useState('');
  const [barberPassword, setBarberPassword] = useState('');
  const [barberBio, setBarberBio] = useState('');
  const [barberType, setBarberType] = useState('');
  const [barberUsername, setBarberUsername] = useState('');

  // Co-owner states
  const [coOwnerEmail, setCoOwnerEmail] = useState('');
  const [isAddingCoOwner, setIsAddingCoOwner] = useState(false);
  const [isRemovingCoOwner, setIsRemovingCoOwner] = useState(false);

  // Shop edit states
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [isUpdatingShop, setIsUpdatingShop] = useState(false);
  const [shopName, setShopName] = useState(shop.name);
  const [shopAddress, setShopAddress] = useState(shop.address);
  const [shopCity, setShopCity] = useState(shop.city);
  const [shopPhone, setShopPhone] = useState(shop.phone || '');
  const [shopEmail, setShopEmail] = useState(shop.email || '');
  const [shopWebsite, setShopWebsite] = useState(shop.website || '');
  const [shopDescription, setShopDescription] = useState(shop.description || '');

  // Opening hours state
  const defaultOpeningHours: OpeningHours = {
    monday: { open: '09:00', close: '19:00', closed: false },
    tuesday: { open: '09:00', close: '19:00', closed: false },
    wednesday: { open: '09:00', close: '19:00', closed: false },
    thursday: { open: '09:00', close: '19:00', closed: false },
    friday: { open: '09:00', close: '19:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: false },
    sunday: { open: '09:00', close: '18:00', closed: true },
  };
  const [openingHours, setOpeningHours] = useState<OpeningHours>(shop.openingHours || defaultOpeningHours);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [closures, setClosures] = useState(initialClosures);
  const [newClosedDate, setNewClosedDate] = useState('');
  const [newClosedReason, setNewClosedReason] = useState('');
  const [savingClosure, setSavingClosure] = useState<string | null>(null);

  // Per-barber opening hours states
  const [editingBarberHoursId, setEditingBarberHoursId] = useState<string | null>(null);
  const [barberHours, setBarberHours] = useState<OpeningHours>(defaultOpeningHours);
  const [isSavingBarberHours, setIsSavingBarberHours] = useState(false);

  const handleOpenBarberHoursEditor = (barber: Barber) => {
    setEditingBarberHoursId(barber.id);
    setBarberHours(barber.openingHours || defaultOpeningHours);
  };

  const handleBarberHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setBarberHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveBarberHours = async (barberId: string) => {
    setIsSavingBarberHours(true);
    try {
      const res = await fetch(`/api/barbers/${barberId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingHours: barberHours }),
      });
      if (res.ok) {
        toast({ variant: 'success', title: 'Succès', description: 'Horaires du coiffeur mis à jour' });
        setEditingBarberHoursId(null);
        setTimeout(() => router.refresh(), 1000);
      } else {
        const data = await res.json();
        toast({ variant: 'error', title: 'Erreur', description: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      toast({ variant: 'error', title: 'Erreur', description: 'Une erreur est survenue' });
    } finally {
      setIsSavingBarberHours(false);
    }
  };

  const handleClearBarberHours = async (barberId: string) => {
    const ok = await confirm({
      title: 'Supprimer les horaires personnalisés ?',
      description: 'Le coiffeur utilisera à nouveau les horaires du salon.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    });
    if (!ok) return;
    setIsSavingBarberHours(true);
    try {
      const res = await fetch(`/api/barbers/${barberId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingHours: null }),
      });
      if (res.ok) {
        toast({ variant: 'success', title: 'Succès', description: 'Horaires personnalisés supprimés' });
        setEditingBarberHoursId(null);
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({ variant: 'error', title: 'Erreur', description: 'Une erreur est survenue' });
      }
    } catch (error) {
      toast({ variant: 'error', title: 'Erreur', description: 'Une erreur est survenue' });
    } finally {
      setIsSavingBarberHours(false);
    }
  };

  // UploadThing hook for service images
  const { startUpload: startServiceImageUpload } = useUploadThing('serviceImage', {
    onUploadError: (error) => {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Erreur lors du téléchargement' });
      setIsUploadingServiceImage(false);
    },
  });

  // UploadThing hook for barber profile images
  const { startUpload: startBarberImageUpload } = useUploadThing('barberImage', {
    onUploadError: (error) => {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Erreur lors du téléchargement' });
    },
  });

  // Shop gallery state and uploader
  const [shopImages, setShopImages] = useState<string[]>(shop.images || []);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isDeletingGalleryImage, setIsDeletingGalleryImage] = useState<string | null>(null);

  const { startUpload: startGalleryUpload } = useUploadThing('shopGallery', {
    onUploadError: (error) => {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Erreur lors du téléchargement' });
      setIsUploadingGallery(false);
    },
  });

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (shopImages.length + files.length > 10) {
      toast({ variant: 'warning', title: 'Limite atteinte', description: 'Vous ne pouvez avoir que 10 images maximum dans votre galerie.' });
      return;
    }

    setIsUploadingGallery(true);
    try {
      const uploadResult = await startGalleryUpload(Array.from(files));

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('Échec du téléchargement');
      }

      const newImageUrls = uploadResult.map(res => res.url);
      const updatedImages = [...shopImages, ...newImageUrls];

      // Update shop images in database
      const res = await fetch(`/api/barbershops/${shop.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedImages }),
      });

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde des images');

      setShopImages(updatedImages);
      toast({
        variant: 'success',
        title: 'Succès',
        description: `${newImageUrls.length} image(s) ajoutée(s) à la galerie`
      });
    } catch (error: any) {
      console.error('Gallery upload error:', error);
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Une erreur est survenue' });
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleDeleteGalleryImage = async (urlToDelete: string) => {
    const ok = await confirm({ title: 'Supprimer cette image ?', confirmLabel: 'Supprimer', tone: 'danger' });
    if (!ok) return;

    setIsDeletingGalleryImage(urlToDelete);
    try {
      const updatedImages = shopImages.filter(url => url !== urlToDelete);

      const res = await fetch(`/api/barbershops/${shop.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedImages }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      setShopImages(updatedImages);
      toast({ variant: 'success', title: 'Succès', description: 'Image supprimée de la galerie' });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Erreur', description: error.message || 'Une erreur est survenue' });
    } finally {
      setIsDeletingGalleryImage(null);
    }
  };

  // Calculate stats
  const totalBarbers = barbers.length;
  // Fallback when the shop has no reviews yet: average of the barbers that do have a rating.
  const ratedBarbers = barbers.filter(b => b.rating);
  const avgRating = ratedBarbers.length > 0
    ? (ratedBarbers.reduce((sum, b) => sum + parseFloat(b.rating!), 0) / ratedBarbers.length).toFixed(1)
    : null;

  // Calculate monthly bookings
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthlyBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate >= firstDayOfMonth &&
      bookingDate <= lastDayOfMonth &&
      booking.status !== 'cancelled';
  }).length;

  const handleToggleShopStatus = async () => {
    if (isToggling) return;

    const ok = await confirm(
      shopActive
        ? {
            title: 'Masquer ce salon ?',
            description: 'Il ne sera plus visible sur la plateforme et les clients ne pourront plus réserver.',
            confirmLabel: 'Masquer le salon',
            tone: 'danger',
          }
        : { title: 'Rendre ce salon visible ?', confirmLabel: 'Rendre visible' }
    );
    if (!ok) return;

    setIsToggling(true);
    try {
      const res = await fetch(`/api/barbershops/${shop.id}/toggle-status`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setShopActive(data.isActive);
        toast({
          variant: 'success',
          title: 'Succès',
          description: data.message,
        });
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error toggling shop status:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancelSubscription = async () => {
    const ok = await confirm({
      title: 'Annuler l’abonnement ?',
      description: 'Votre salon reste visible jusqu’à la fin de la période de facturation en cours.',
      confirmLabel: 'Annuler l’abonnement',
      cancelLabel: 'Garder',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ variant: 'success', title: 'Succès', description: 'Votre abonnement sera annulé à la fin de la période en cours.' });
        setTimeout(() => router.refresh(), 2000);
      } else {
        toast({ variant: 'error', title: 'Erreur', description: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast({ variant: 'error', title: 'Erreur', description: 'Une erreur est survenue' });
    }
  };

  const handleAddCoOwner = async () => {
    if (!coOwnerEmail.trim()) {
      toast({ variant: 'warning', title: 'Attention', description: 'Veuillez saisir un email' });
      return;
    }
    setIsAddingCoOwner(true);
    try {
      const res = await fetch(`/api/barbershops/${shop.id}/co-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: coOwnerEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ variant: 'success', title: 'Succès', description: data.message });
        setCoOwnerEmail('');
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({ variant: 'error', title: 'Erreur', description: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('Add co-owner error:', error);
      toast({ variant: 'error', title: 'Erreur', description: 'Une erreur est survenue' });
    } finally {
      setIsAddingCoOwner(false);
    }
  };

  const handleRemoveCoOwner = async () => {
    const ok = await confirm({
      title: 'Retirer le co-propriétaire ?',
      description: 'Cette personne ne pourra plus gérer le salon.',
      confirmLabel: 'Retirer',
      tone: 'danger',
    });
    if (!ok) return;
    setIsRemovingCoOwner(true);
    try {
      const res = await fetch(`/api/barbershops/${shop.id}/co-owner`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast({ variant: 'success', title: 'Succès', description: data.message });
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({ variant: 'error', title: 'Erreur', description: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('Remove co-owner error:', error);
      toast({ variant: 'error', title: 'Erreur', description: 'Une erreur est survenue' });
    } finally {
      setIsRemovingCoOwner(false);
    }
  };

  const handleDeleteShop = async () => {
    const ok = await confirm({
      title: `Supprimer ${shop.name} ?`,
      description: 'Le salon, ses services, son équipe, ses réservations et ses avis seront définitivement supprimés. Cette action est irréversible.',
      confirmLabel: 'Supprimer définitivement',
      tone: 'danger',
      requireText: 'SUPPRIMER',
    });
    if (!ok) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/barbershops/${shop.id}/delete`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: data.message,
        });
        setTimeout(() => window.location.href = `/${locale}/my-space`, 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingShop) return;

    setIsUpdatingShop(true);
    try {
      const res = await fetch(`/api/barbershops/${shop.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shopName,
          address: shopAddress,
          city: shopCity,
          phone: shopPhone || null,
          email: shopEmail || null,
          website: shopWebsite || null,
          description: shopDescription || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Informations mises à jour avec succès',
        });
        setIsEditingShop(false);
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setIsUpdatingShop(false);
    }
  };

  const handleToggleServiceStatus = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/toggle-status`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setServiceStatuses(prev => ({ ...prev, [serviceId]: data.isActive }));
        toast({
          variant: 'success',
          title: 'Succès',
          description: data.message,
        });
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    }
  };

  const handleDeleteBarber = async (barberId: string, barberName: string) => {
    const ok = await confirm({
      title: `Retirer ${barberName} de l'équipe ?`,
      description: 'Son profil ne sera plus visible et il ne pourra plus recevoir de réservations. Son historique de rendez-vous est conservé.',
      confirmLabel: 'Retirer',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/barbershop/barbers/${barberId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Coiffeur retiré avec succès',
        });
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error deleting barber:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    }
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberName.trim() || !barberEmail.trim() || !barberPassword.trim()) {
      toast({
        variant: 'warning',
        title: 'Attention',
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/barbershop/barbers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: barberName,
          email: barberEmail,
          phone: barberPhone || null,
          password: barberPassword,
          barbershopId: shop.id,
          barberType: barberType || undefined,
          username: barberUsername || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Coiffeur ajouté avec succès!',
        });
        setBarberName('');
        setBarberEmail('');
        setBarberPhone('');
        setBarberPassword('');
        setBarberType('');
        setBarberUsername('');
        setIsAddingBarber(false);
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error adding barber:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditBarberModal = (barber: Barber) => {
    setEditingBarber(barber);
    setBarberName(barber.name || '');
    setBarberBio(barber.bio || '');
    setBarberType(barber.barberType || '');
  };

  const closeBarberModal = () => {
    setIsAddingBarber(false);
    setEditingBarber(null);
    setBarberName('');
    setBarberEmail('');
    setBarberPhone('');
    setBarberPassword('');
    setBarberBio('');
    setBarberType('');
    setBarberUsername('');
  };

  const handleEditBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarber || !barberName.trim()) {
      toast({
        variant: 'warning',
        title: 'Attention',
        description: 'Le nom est obligatoire',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/barbers/${editingBarber.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: barberName,
          bio: barberBio || null,
          barberType: barberType || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Coiffeur modifié avec succès!',
        });
        closeBarberModal();
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error editing barber:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SERVICE_IMAGE_MB * 1024 * 1024) {
      toast({ variant: 'error', title: 'Erreur', description: `Image trop volumineuse (max ${MAX_SERVICE_IMAGE_MB} Mo)` });
      return;
    }

    setIsUploadingServiceImage(true);
    try {
      const uploadResult = await startServiceImageUpload([file]);

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('Échec du téléchargement');
      }

      setServiceImage(uploadResult[0].url);
      toast({
        variant: 'success',
        title: 'Image téléchargée',
        description: 'L\'image a été ajoutée avec succès',
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors du téléchargement',
      });
    } finally {
      setIsUploadingServiceImage(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice || !serviceDuration) {
      toast({
        variant: 'warning',
        title: 'Attention',
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: shop.id,
          name: serviceName,
          description: serviceDescription || null,
          image: serviceImage || null,
          price: parseFloat(servicePrice),
          duration: parseInt(serviceDuration),
          category: serviceCategory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Service ajouté avec succès!',
        });
        setServiceName('');
        setServiceDescription('');
        setServicePrice('');
        setServiceDuration('');
        setServiceCategory('haircut');
        setServiceImage('');
        setIsAddingService(false);
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !serviceName.trim() || !servicePrice || !serviceDuration) {
      toast({
        variant: 'warning',
        title: 'Attention',
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceName,
          description: serviceDescription || null,
          image: serviceImage || null,
          price: parseFloat(servicePrice),
          duration: parseInt(serviceDuration),
          category: serviceCategory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Service modifié avec succès!',
        });
        setEditingService(null);
        setServiceName('');
        setServiceDescription('');
        setServicePrice('');
        setServiceDuration('');
        setServiceCategory('haircut');
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error editing service:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditServiceModal = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description || '');
    setServicePrice(service.price);
    setServiceDuration(service.duration.toString());
    setServiceCategory(service.category || 'haircut');
    setServiceImage(service.image || '');
  };

  const closeServiceModal = () => {
    setIsAddingService(false);
    setEditingService(null);
    setServiceName('');
    setServiceDescription('');
    setServicePrice('');
    setServiceDuration('');
    setServiceCategory('haircut');
    setServiceImage('');
  };

  // Opening hours handlers
  const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveOpeningHours = async () => {
    setIsSavingHours(true);
    try {
      const response = await fetch(`/api/barbershops/${shop.id}/opening-hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingHours }),
      });

      if (!response.ok) throw new Error('Failed to save opening hours');

      toast({ variant: 'success', title: 'Succès', description: 'Horaires mis à jour avec succès' });
    } catch (error) {
      toast({ variant: 'error', title: 'Erreur', description: 'Erreur lors de la mise à jour des horaires' });
    } finally {
      setIsSavingHours(false);
    }
  };

  // Closures are saved immediately; the API returns the updated upcoming list.
  const updateClosures = async (key: string, request: () => Promise<Response>, success: string) => {
    setSavingClosure(key);
    try {
      const res = await request();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      setClosures(data.closures || []);
      toast({ variant: 'success', title: success });
      return true;
    } catch (error) {
      toast({ variant: 'error', title: 'Erreur', description: error instanceof Error && error.message ? error.message : 'Une erreur est survenue' });
      return false;
    } finally {
      setSavingClosure(null);
    }
  };

  const handleAddClosedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClosedDate) return;
    const ok = await updateClosures(
      'new',
      () => fetch(`/api/barbershops/${shop.id}/closures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newClosedDate, reason: newClosedReason }),
      }),
      'Fermeture enregistrée'
    );
    if (ok) {
      setNewClosedDate('');
      setNewClosedReason('');
    }
  };

  const handleRemoveClosedDate = (date: string) =>
    updateClosures(
      date,
      () => fetch(`/api/barbershops/${shop.id}/closures?date=${date}`, { method: 'DELETE' }),
      'Fermeture supprimée'
    );

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const dayNames: { [key: string]: string } = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };

  const tabs = [
    { id: 'overview' as const, label: t('tabs.overview'), icon: TrendingUp },
    { id: 'barbers' as const, label: t('tabs.team'), icon: Users, count: barbers.length },
    { id: 'services' as const, label: t('tabs.services'), icon: Scissors, count: services.length },
    { id: 'gallery' as const, label: t('tabs.gallery'), icon: ImageIcon },
    { id: 'schedule' as const, label: 'Horaires', icon: Clock },
    { id: 'settings' as const, label: t('tabs.settings'), icon: Settings },
  ];

  const subscription = SUBSCRIPTION_STATUS[subscriptionStatus] ?? SUBSCRIPTION_STATUS.inactive;
  const activeServiceCount = services.filter(s => serviceStatuses[s.id]).length;
  const uncategorised = services.filter(s => !SERVICE_CATEGORIES.some(c => c.id === s.category));

  const renderServiceRow = (service: Service) => {
    const isOn = serviceStatuses[service.id];
    return (
      <li key={service.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.image} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200" />
        ) : (
          <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Scissors className="h-5 w-5 text-gray-400" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`font-medium ${isOn ? 'text-gray-900' : 'text-gray-500'}`}>{service.name}</h4>
            {!isOn && <Badge>Désactivé</Badge>}
          </div>
          {service.description && <p className="mt-0.5 truncate text-sm text-gray-500">{service.description}</p>}
          <p className="mt-1 text-sm tabular-nums text-gray-600">
            <span className="font-medium text-gray-900">{formatEuro(service.price)}</span>
            <span className="mx-2 text-gray-300">|</span>
            {service.duration} min
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button onClick={() => handleToggleServiceStatus(service.id)} className={`${btn.ghost} ${btn.sm}`}>
            {isOn ? 'Désactiver' : 'Activer'}
          </button>
          <button onClick={() => openEditServiceModal(service)} className={btn.icon} aria-label={`Modifier ${service.name}`}>
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader
        title={shop.name}
        back={
          <Link href="/my-space" className={backLinkClass} aria-label="Retour à mon espace">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              {shop.city}
            </span>
            {shop.rating && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Star className="h-4 w-4 fill-primary-500 text-primary-500" />
                {shop.rating}
                <span className="text-gray-400">({shop.reviewCount} avis)</span>
              </span>
            )}
          </>
        }
        actions={
          <>
            <Badge tone={shopActive ? 'success' : 'warning'} icon={shopActive ? Eye : EyeOff}>
              {shopActive ? 'Visible' : 'Masqué'}
            </Badge>
            <Badge tone={subscription.tone} icon={CreditCard}>
              {subscription.label}
            </Badge>
            <Link href={`/my-space/${shop.id}/bookings`} className={btn.primary}>
              <Calendar className="h-4 w-4" />
              Réservations
            </Link>
          </>
        }
      >
        <Tabs tabs={tabs} active={activeTab} onChange={setTab} />
      </PageHeader>

      <PageShell>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!shopActive && (
              <Notice
                tone="warning"
                icon={EyeOff}
                title="Votre salon est masqué"
                action={
                  <button onClick={() => setTab('settings')} className={`${btn.secondary} ${btn.sm}`}>
                    Paramètres
                  </button>
                }
              >
                Les clients ne peuvent ni le voir ni réserver.
              </Notice>
            )}
            {subscriptionStatus !== 'active' && (
              <Notice
                tone="danger"
                icon={AlertCircle}
                title={subscription.label}
                action={
                  <Link href={`/subscription?shopId=${shop.id}`} className={`${btn.primary} ${btn.sm}`}>
                    Renouveler
                  </Link>
                }
              >
                Sans abonnement actif, votre salon n&apos;apparaît plus sur la plateforme.
              </Notice>
            )}

            <StatGrid>
              <Stat label="Réservations" icon={Calendar} value={monthlyBookings} hint="ce mois-ci" />
              <Stat label="Coiffeurs" icon={Users} value={totalBarbers} hint="dans l’équipe" />
              <Stat label="Services actifs" icon={Scissors} value={activeServiceCount} hint={`${services.length} au total`} />
              <Stat
                label="Note du salon"
                icon={Star}
                value={shop.rating ? parseFloat(shop.rating).toFixed(1) : avgRating ?? '-'}
                hint={shop.rating ? `${shop.reviewCount ?? 0} avis clients` : 'Pas encore d’avis'}
              />
            </StatGrid>

            <div className="grid items-start gap-6 lg:grid-cols-3">
              <Panel className="lg:col-span-2">
                <PanelHeader
                  title="Informations du salon"
                  actions={
                    <button onClick={() => setIsEditingShop(true)} className={`${btn.secondary} ${btn.sm}`}>
                      <Edit2 className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                  }
                />
                <PanelBody>
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <Field label="Adresse" icon={MapPin}>{shop.address}, {shop.city}</Field>
                    <Field label="Téléphone" icon={Phone}>{shop.phone || <span className="text-gray-400">Non renseigné</span>}</Field>
                    <Field label="Email" icon={Mail}>{shop.email || <span className="text-gray-400">Non renseigné</span>}</Field>
                    <Field label="Site web" icon={Globe}>
                      {shop.website ? (
                        <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-primary-700 underline-offset-2 hover:underline">
                          {shop.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-gray-400">Non renseigné</span>
                      )}
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Description">
                        {shop.description || <span className="text-gray-400">Aucune description. Ajoutez-en une pour présenter votre salon.</span>}
                      </Field>
                    </div>
                  </dl>
                </PanelBody>
              </Panel>

              <Panel>
                <PanelHeader title="Accès rapide" />
                <ul className="divide-y divide-gray-100">
                  {[
                    { href: `/my-space/${shop.id}/bookings`, icon: Calendar, label: 'Réservations', hint: 'Consulter et gérer les rendez-vous' },
                    { tab: 'barbers' as const, icon: Users, label: 'Équipe', hint: 'Ajouter ou modifier un coiffeur' },
                    { tab: 'services' as const, icon: Scissors, label: 'Services', hint: 'Tarifs, durées et catégories' },
                    { href: `/barbershops/${shop.id}`, icon: Store, label: 'Page publique', hint: 'Voir le salon comme un client' },
                  ].map((item) => {
                    const inner = (
                      <>
                        <item.icon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-primary-600" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-900">{item.label}</span>
                          <span className="block truncate text-xs text-gray-500">{item.hint}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                      </>
                    );
                    const cls = 'group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 sm:px-6';
                    return (
                      <li key={item.label}>
                        {item.href ? (
                          <Link href={item.href} className={cls}>{inner}</Link>
                        ) : (
                          <button onClick={() => setTab(item.tab!)} className={cls}>{inner}</button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </div>
          </div>
        )}

        {activeTab === 'barbers' && (
          <div className="space-y-6">
            <SectionHeading
              title="Équipe"
              description="Les coiffeurs qui reçoivent des réservations dans votre salon."
              actions={
                <button onClick={() => setIsAddingBarber(true)} className={btn.primary}>
                  <Plus className="h-4 w-4" />
                  Ajouter un coiffeur
                </button>
              }
            />

            {barbers.length === 0 ? (
              <Panel>
                <EmptyState
                  icon={Users}
                  title="Aucun coiffeur pour l’instant"
                  description="Ajoutez votre premier coiffeur pour que les clients puissent réserver avec lui."
                  action={
                    <button onClick={() => setIsAddingBarber(true)} className={btn.primary}>
                      <Plus className="h-4 w-4" />
                      Ajouter un coiffeur
                    </button>
                  }
                />
              </Panel>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {barbers.map((barber) => (
                  <Panel key={barber.id} className="flex flex-col">
                    <div className="flex items-start gap-4 p-5">
                      <label className="group relative cursor-pointer" title="Changer la photo">
                        <Avatar name={barber.name} src={barber.profileImage} size="lg" />
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-900/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <ImageIcon className="h-4 w-4 text-white" />
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const uploadResult = await startBarberImageUpload([file]);
                              if (!uploadResult || uploadResult.length === 0) {
                                throw new Error('Échec du téléchargement');
                              }
                              await fetch(`/api/barbers/${barber.id}/update`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ profileImage: uploadResult[0].url }),
                              });
                              toast({ variant: 'success', title: 'Photo mise à jour' });
                              setTimeout(() => router.refresh(), 1000);
                            } catch (error) {
                              toast({ variant: 'error', title: 'Erreur', description: 'Échec du téléchargement' });
                            }
                          }}
                        />
                      </label>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-gray-900">{barber.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          {barber.barberType && <Badge>{barber.barberType}</Badge>}
                          {barber.rating && (
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
                              {barber.rating}
                            </span>
                          )}
                          {barber.experience ? <span>{barber.experience} ans d&apos;expérience</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 px-5 pb-4 text-sm text-gray-600">
                      {barber.email && (
                        <p className="flex items-center gap-2 truncate">
                          <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{barber.email}</span>
                        </p>
                      )}
                      {barber.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          {barber.phone}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        {barber.openingHours ? 'Horaires personnalisés' : 'Horaires du salon'}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center gap-1 border-t border-gray-100 px-3 py-2">
                      <button onClick={() => openEditBarberModal(barber)} className={`${btn.ghost} ${btn.sm}`}>
                        <Edit2 className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                      <button
                        onClick={() => (editingBarberHoursId === barber.id ? setEditingBarberHoursId(null) : handleOpenBarberHoursEditor(barber))}
                        className={`${btn.ghost} ${btn.sm}`}
                        aria-expanded={editingBarberHoursId === barber.id}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Horaires
                      </button>
                      <button
                        onClick={() => handleDeleteBarber(barber.id, barber.name || 'ce coiffeur')}
                        className={`${btn.dangerGhost} ${btn.sm} ml-auto`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Retirer
                      </button>
                    </div>

                    {editingBarberHoursId === barber.id && (
                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                        <h4 className="text-sm font-medium text-gray-900">Horaires de {barber.name}</h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Permet de recevoir des réservations même les jours où le salon est fermé.
                        </p>
                        <div className="mt-3 space-y-2">
                          {Object.entries(dayNames).map(([dayKey, dayLabel]) => (
                            <div key={dayKey} className="flex items-center gap-2">
                              <label className="flex w-24 flex-shrink-0 items-center gap-2 text-xs text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={!barberHours[dayKey]?.closed}
                                  onChange={(e) => handleBarberHoursChange(dayKey, 'closed', !e.target.checked)}
                                  className={checkboxClass}
                                />
                                {dayLabel}
                              </label>
                              {barberHours[dayKey]?.closed ? (
                                <span className="text-xs text-gray-400">Fermé</span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="time"
                                    value={barberHours[dayKey]?.open || '09:00'}
                                    onChange={(e) => handleBarberHoursChange(dayKey, 'open', e.target.value)}
                                    className={timeInputClass}
                                    aria-label={`${dayLabel}, ouverture`}
                                  />
                                  <span className="text-xs text-gray-400">à</span>
                                  <input
                                    type="time"
                                    value={barberHours[dayKey]?.close || '19:00'}
                                    onChange={(e) => handleBarberHoursChange(dayKey, 'close', e.target.value)}
                                    className={timeInputClass}
                                    aria-label={`${dayLabel}, fermeture`}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleSaveBarberHours(barber.id)}
                            disabled={isSavingBarberHours}
                            className={`${btn.primary} ${btn.sm}`}
                          >
                            {isSavingBarberHours && <Spinner className="h-3 w-3" />}
                            Enregistrer
                          </button>
                          <button onClick={() => setEditingBarberHoursId(null)} className={`${btn.secondary} ${btn.sm}`}>
                            Annuler
                          </button>
                          {barber.openingHours && (
                            <button
                              onClick={() => handleClearBarberHours(barber.id)}
                              disabled={isSavingBarberHours}
                              className={`${btn.dangerGhost} ${btn.sm} ml-auto`}
                            >
                              Revenir aux horaires du salon
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Panel>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <SectionHeading
              title="Services"
              description="Ce que les clients peuvent réserver, avec les tarifs et durées."
              actions={
                <button onClick={() => setIsAddingService(true)} className={btn.primary}>
                  <Plus className="h-4 w-4" />
                  Ajouter un service
                </button>
              }
            />

            {services.length === 0 ? (
              <Panel>
                <EmptyState
                  icon={Scissors}
                  title="Aucun service pour l’instant"
                  description="Ajoutez vos prestations pour que les clients puissent réserver en ligne."
                  action={
                    <button onClick={() => setIsAddingService(true)} className={btn.primary}>
                      <Plus className="h-4 w-4" />
                      Ajouter un service
                    </button>
                  }
                />
              </Panel>
            ) : (
              <div className="space-y-4">
                {SERVICE_CATEGORIES.map((category) => {
                  const categoryServices = services.filter(s => s.category === category.id);
                  if (categoryServices.length === 0) return null;
                  return (
                    <Panel key={category.id}>
                      <PanelHeader title={category.label} description={`${categoryServices.length} service${categoryServices.length > 1 ? 's' : ''}`} />
                      <ul className="divide-y divide-gray-100">{categoryServices.map(renderServiceRow)}</ul>
                    </Panel>
                  );
                })}
                {uncategorised.length > 0 && (
                  <Panel>
                    <PanelHeader title="Autres" description="Services sans catégorie. Modifiez-les pour les classer." />
                    <ul className="divide-y divide-gray-100">{uncategorised.map(renderServiceRow)}</ul>
                  </Panel>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <SectionHeading title={t('gallery.title')} description={t('gallery.subtitle')} />

            <Panel>
              <PanelHeader
                title={t('gallery.photosTitle')}
                description={t('gallery.photosSubtitle')}
                actions={<span className="text-sm tabular-nums text-gray-500">{shopImages.length}/10</span>}
              />
              <PanelBody className="space-y-5">
                {shopImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {shopImages.map((url, index) => (
                      <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Photo ${index + 1} du salon`} className="h-full w-full object-cover" />
                        <button
                          onClick={() => handleDeleteGalleryImage(url)}
                          disabled={isDeletingGalleryImage === url}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 opacity-0 shadow-sm transition-opacity hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                          aria-label={`Supprimer la photo ${index + 1}`}
                        >
                          {isDeletingGalleryImage === url ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{t('gallery.noImages')}</p>
                )}

                {shopImages.length < 10 && (
                  <label
                    className={`flex flex-col items-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 text-center transition-colors ${
                      isUploadingGallery ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary-400 hover:bg-primary-50/40'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="sr-only"
                      disabled={isUploadingGallery}
                    />
                    {isUploadingGallery ? (
                      <>
                        <Spinner className="h-6 w-6 text-primary-600" />
                        <p className="mt-3 text-sm font-medium text-gray-700">Téléchargement en cours...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400" />
                        <p className="mt-3 text-sm font-medium text-gray-900">{t('gallery.uploadTitle')}</p>
                        <p className="mt-1 text-xs text-gray-500">{t('gallery.uploadFormats')}</p>
                        <p className="mt-1 text-xs text-gray-500">{t('gallery.uploadNote')}</p>
                      </>
                    )}
                  </label>
                )}
              </PanelBody>
            </Panel>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <SectionHeading title="Horaires d’ouverture" description="Les créneaux proposés aux clients suivent ces horaires." />

            <Panel>
              <PanelHeader
                title="Semaine type"
                actions={
                  <button onClick={handleSaveOpeningHours} disabled={isSavingHours} className={`${btn.primary} ${btn.sm}`}>
                    {isSavingHours && <Spinner className="h-3 w-3" />}
                    Enregistrer
                  </button>
                }
              />
              <ul className="divide-y divide-gray-100">
                {Object.entries(dayNames).map(([dayKey, dayLabel]) => {
                  const isClosed = openingHours[dayKey]?.closed;
                  return (
                    <li key={dayKey} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 sm:px-6">
                      <span className="w-24 text-sm font-medium text-gray-900">{dayLabel}</span>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={!isClosed}
                          onChange={(e) => handleOpeningHoursChange(dayKey, 'closed', !e.target.checked)}
                          className={checkboxClass}
                        />
                        Ouvert
                      </label>
                      {isClosed ? (
                        <span className="text-sm text-gray-400">Fermé</span>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <input
                            type="time"
                            value={openingHours[dayKey]?.open || '09:00'}
                            onChange={(e) => handleOpeningHoursChange(dayKey, 'open', e.target.value)}
                            className={`${inputClass} w-auto`}
                            aria-label={`${dayLabel}, ouverture`}
                          />
                          à
                          <input
                            type="time"
                            value={openingHours[dayKey]?.close || '19:00'}
                            onChange={(e) => handleOpeningHoursChange(dayKey, 'close', e.target.value)}
                            className={`${inputClass} w-auto`}
                            aria-label={`${dayLabel}, fermeture`}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel>
              <PanelHeader
                title="Fermetures exceptionnelles"
                description="Vacances, jours fériés ou toute date où le salon sera fermé."
              />
              <PanelBody className="space-y-4">
                <form onSubmit={handleAddClosedDate} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div>
                    <label htmlFor="closed-date" className={labelClass}>Date</label>
                    <input
                      id="closed-date"
                      type="date"
                      required
                      value={newClosedDate}
                      onChange={(e) => setNewClosedDate(e.target.value)}
                      min={todayKey}
                      className={`${inputClass} sm:w-44`}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="closed-reason" className={labelClass}>Motif <span className="font-normal text-gray-500">(facultatif)</span></label>
                    <input
                      id="closed-reason"
                      type="text"
                      value={newClosedReason}
                      onChange={(e) => setNewClosedReason(e.target.value)}
                      placeholder="Ex : congés d’été"
                      maxLength={255}
                      className={inputClass}
                    />
                  </div>
                  <button type="submit" disabled={!newClosedDate || savingClosure === 'new'} className={btn.secondary}>
                    {savingClosure === 'new' ? <Spinner className="h-3.5 w-3.5" /> : <Plus className="h-4 w-4" />}
                    Ajouter
                  </button>
                </form>
                {closures.length > 0 ? (
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                    {closures.map((closure) => (
                      <li key={closure.date} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium capitalize text-gray-900">
                            {new Date(`${closure.date}T00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          {closure.reason && <p className="truncate text-sm text-gray-500">{closure.reason}</p>}
                        </div>
                        <button
                          onClick={() => handleRemoveClosedDate(closure.date)}
                          disabled={savingClosure === closure.date}
                          className={btn.icon}
                          aria-label="Retirer cette fermeture"
                        >
                          {savingClosure === closure.date ? <Spinner /> : <X className="h-4 w-4" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Aucune fermeture prévue. Les clients ne pourront pas réserver les jours ajoutés ici.</p>
                )}
              </PanelBody>
            </Panel>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <SectionHeading title={t('settings.title')} description={t('settings.subtitle')} />

            <Panel>
              <PanelHeader
                icon={CreditCard}
                title="Abonnement"
                description={`${formatEuro(subscriptionPrice)} par mois`}
                actions={<Badge tone={subscription.tone}>{subscription.label}</Badge>}
              />
              <PanelBody className="space-y-4">
                {subscriptionStatus !== 'active' && (
                  <Notice tone="danger" icon={AlertCircle}>
                    Votre salon n&apos;est plus visible sur la plateforme. Renouvelez votre abonnement pour continuer à recevoir des réservations.
                  </Notice>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/subscription?shopId=${shop.id}`} className={btn.primary}>
                    {subscriptionStatus === 'active' ? 'Gérer l’abonnement' : 'Renouveler l’abonnement'}
                  </Link>
                  {subscriptionStatus === 'active' && (
                    <button onClick={handleCancelSubscription} className={btn.dangerGhost}>
                      Annuler l&apos;abonnement
                    </button>
                  )}
                </div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader icon={UserPlus} title="Co-propriétaire" description="Une personne qui peut gérer ce salon avec vous." />
              <PanelBody>
                {shop.coOwnerId ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={shop.coOwnerName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{shop.coOwnerName || 'Co-propriétaire'}</p>
                      <p className="truncate text-sm text-gray-500">{shop.coOwnerEmail}</p>
                    </div>
                    <button onClick={handleRemoveCoOwner} disabled={isRemovingCoOwner} className={`${btn.dangerGhost} ${btn.sm}`}>
                      {isRemovingCoOwner && <Spinner className="h-3 w-3" />}
                      Retirer
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddCoOwner();
                    }}
                    className="space-y-2"
                  >
                    <label htmlFor="co-owner-email" className={labelClass}>Email du co-propriétaire</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        id="co-owner-email"
                        type="email"
                        value={coOwnerEmail}
                        onChange={(e) => setCoOwnerEmail(e.target.value)}
                        placeholder="email@exemple.com"
                        className={inputClass}
                      />
                      <button type="submit" disabled={isAddingCoOwner} className={btn.primary}>
                        {isAddingCoOwner && <Spinner className="h-3.5 w-3.5" />}
                        Ajouter
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">La personne doit déjà avoir un compte Orphelia.</p>
                  </form>
                )}
              </PanelBody>
            </Panel>

            <Panel className="border-red-200">
              <PanelHeader title="Zone sensible" description="Ces actions affectent la visibilité ou l’existence du salon." />
              <ul className="divide-y divide-gray-100">
                <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{shopActive ? 'Masquer le salon' : 'Rendre le salon visible'}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {shopActive
                        ? 'Le salon disparaît de la plateforme. Vous pourrez le réactiver à tout moment.'
                        : 'Le salon est actuellement masqué. Les clients ne peuvent ni le voir ni réserver.'}
                    </p>
                  </div>
                  <button onClick={handleToggleShopStatus} disabled={isToggling} className={shopActive ? btn.secondary : btn.primary}>
                    {isToggling && <Spinner className="h-3.5 w-3.5" />}
                    {shopActive ? 'Masquer' : 'Rendre visible'}
                  </button>
                </li>
                <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Supprimer le salon</p>
                    <p className="mt-0.5 text-sm text-gray-500">Suppression définitive du salon et de toutes ses données.</p>
                  </div>
                  <button onClick={handleDeleteShop} disabled={isDeleting} className={btn.danger}>
                    {isDeleting && <Spinner className="h-3.5 w-3.5" />}
                    Supprimer
                  </button>
                </li>
              </ul>
            </Panel>
          </div>
        )}
      </PageShell>

      <Footer />

      {/* Edit shop */}
      <Modal
        open={isEditingShop}
        onClose={() => setIsEditingShop(false)}
        title="Informations du salon"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setIsEditingShop(false)} className={btn.secondary}>
              Annuler
            </button>
            <button type="submit" form="edit-shop-form" disabled={isUpdatingShop} className={btn.primary}>
              {isUpdatingShop && <Spinner className="h-3.5 w-3.5" />}
              Enregistrer
            </button>
          </>
        }
      >
        <form id="edit-shop-form" onSubmit={handleUpdateShop} className="space-y-4">
          <div>
            <label htmlFor="shop-name" className={labelClass}>Nom du salon <Required /></label>
            <input id="shop-name" type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shop-address" className={labelClass}>Adresse <Required /></label>
              <input id="shop-address" type="text" value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="shop-city" className={labelClass}>Ville <Required /></label>
              <input id="shop-city" type="text" value={shopCity} onChange={(e) => setShopCity(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shop-phone" className={labelClass}>Téléphone</label>
              <input id="shop-phone" type="tel" value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} placeholder="06 12 34 56 78" className={inputClass} />
            </div>
            <div>
              <label htmlFor="shop-email" className={labelClass}>Email</label>
              <input id="shop-email" type="email" value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} placeholder="contact@salon.fr" className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="shop-website" className={labelClass}>Site web</label>
            <input id="shop-website" type="url" value={shopWebsite} onChange={(e) => setShopWebsite(e.target.value)} placeholder="https://www.monsalon.fr" className={inputClass} />
          </div>
          <div>
            <label htmlFor="shop-description" className={labelClass}>Description</label>
            <textarea
              id="shop-description"
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={4}
              placeholder="Présentez votre salon, votre style, vos spécialités..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </form>
      </Modal>

      {/* Add barber */}
      <Modal
        open={isAddingBarber}
        onClose={closeBarberModal}
        title="Ajouter un coiffeur"
        description="Un compte coiffeur est créé avec ces identifiants."
        footer={
          <>
            <button type="button" onClick={closeBarberModal} className={btn.secondary}>
              Annuler
            </button>
            <button type="submit" form="add-barber-form" disabled={isSubmitting} className={btn.primary}>
              {isSubmitting && <Spinner className="h-3.5 w-3.5" />}
              Ajouter
            </button>
          </>
        }
      >
        <form id="add-barber-form" onSubmit={handleAddBarber} className="space-y-4">
          <div>
            <label htmlFor="barber-name" className={labelClass}>Nom complet <Required /></label>
            <input id="barber-name" type="text" value={barberName} onChange={(e) => setBarberName(e.target.value)} placeholder="Ex : Moussa Diallo" required className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="barber-email" className={labelClass}>Email <Required /></label>
              <input id="barber-email" type="email" value={barberEmail} onChange={(e) => setBarberEmail(e.target.value)} placeholder="moussa@exemple.fr" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="barber-phone" className={labelClass}>Téléphone</label>
              <input id="barber-phone" type="tel" value={barberPhone} onChange={(e) => setBarberPhone(e.target.value)} placeholder="06 12 34 56 78" className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="barber-password" className={labelClass}>Mot de passe <Required /></label>
            <input
              id="barber-password"
              type="password"
              value={barberPassword}
              onChange={(e) => setBarberPassword(e.target.value)}
              required
              minLength={passwordMinLength}
              className={inputClass}
              aria-describedby="barber-password-help"
            />
            <p id="barber-password-help" className="mt-1.5 text-xs text-gray-500">{passwordMinLength} caractères minimum. Le coiffeur se connecte avec son email et ce mot de passe.</p>
          </div>
          <div>
            <label htmlFor="barber-username" className={labelClass}>Identifiant</label>
            <input
              id="barber-username"
              type="text"
              value={barberUsername}
              onChange={(e) => setBarberUsername(e.target.value)}
              placeholder="Ex : moussa.d"
              className={inputClass}
              aria-describedby="barber-username-help"
            />
            <p id="barber-username-help" className="mt-1.5 text-xs text-gray-500">Facultatif. Utile si plusieurs coiffeurs partagent la même adresse email.</p>
          </div>
          <div>
            <label htmlFor="barber-type" className={labelClass}>Type de coiffeur</label>
            <BarberTypeSelect id="barber-type" value={barberType} onChange={setBarberType} />
          </div>
        </form>
      </Modal>

      {/* Edit barber */}
      <Modal
        open={!!editingBarber}
        onClose={closeBarberModal}
        title="Modifier le coiffeur"
        footer={
          <>
            <button type="button" onClick={closeBarberModal} className={btn.secondary}>
              Annuler
            </button>
            <button type="submit" form="edit-barber-form" disabled={isSubmitting} className={btn.primary}>
              {isSubmitting && <Spinner className="h-3.5 w-3.5" />}
              Enregistrer
            </button>
          </>
        }
      >
        <form id="edit-barber-form" onSubmit={handleEditBarber} className="space-y-4">
          <div>
            <label htmlFor="edit-barber-name" className={labelClass}>Nom complet <Required /></label>
            <input id="edit-barber-name" type="text" value={barberName} onChange={(e) => setBarberName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-barber-type" className={labelClass}>Type de coiffeur</label>
            <BarberTypeSelect id="edit-barber-type" value={barberType} onChange={setBarberType} />
          </div>
          <div>
            <label htmlFor="edit-barber-bio" className={labelClass}>Biographie</label>
            <textarea
              id="edit-barber-bio"
              value={barberBio}
              onChange={(e) => setBarberBio(e.target.value)}
              placeholder="Expérience, spécialités, style..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </form>
      </Modal>

      {/* Add / edit service */}
      <Modal
        open={isAddingService || !!editingService}
        onClose={closeServiceModal}
        title={editingService ? 'Modifier le service' : 'Ajouter un service'}
        footer={
          <>
            <button type="button" onClick={closeServiceModal} className={btn.secondary}>
              Annuler
            </button>
            <button type="submit" form="service-form" disabled={isSubmitting || isUploadingServiceImage} className={btn.primary}>
              {isSubmitting && <Spinner className="h-3.5 w-3.5" />}
              {editingService ? 'Enregistrer' : 'Ajouter'}
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={editingService ? handleEditService : handleAddService} className="space-y-4">
          <div>
            <label htmlFor="service-name" className={labelClass}>Nom du service <Required /></label>
            <input id="service-name" type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Ex : Coupe homme" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="service-description" className={labelClass}>Description</label>
            <textarea
              id="service-description"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="service-price" className={labelClass}>Prix (€) <Required /></label>
              <input id="service-price" type="number" step="0.01" min="0" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="25" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="service-duration" className={labelClass}>Durée (min) <Required /></label>
              <input id="service-duration" type="number" min="5" step="5" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="30" required className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="service-category" className={labelClass}>Catégorie <Required /></label>
            <select id="service-category" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} required className={inputClass}>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={labelClass}>Image</span>
            <div className="flex items-center gap-4">
              {serviceImage ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-lg ring-1 ring-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={serviceImage} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setServiceImage('')}
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm hover:text-red-600"
                    aria-label="Retirer l'image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600">
                  <input type="file" accept="image/*" onChange={handleServiceImageChange} className="sr-only" disabled={isUploadingServiceImage} />
                  {isUploadingServiceImage ? (
                    <Spinner className="h-5 w-5" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="mt-1 text-xs">Ajouter</span>
                    </>
                  )}
                </label>
              )}
              <p className="text-xs text-gray-500">JPG, PNG ou WebP. {MAX_SERVICE_IMAGE_MB} Mo maximum.</p>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Required() {
  return <span className="text-red-600" aria-hidden="true">*</span>;
}

function BarberTypeSelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">Non précisé</option>
      {BARBER_TYPES.map((type) => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
  );
}
