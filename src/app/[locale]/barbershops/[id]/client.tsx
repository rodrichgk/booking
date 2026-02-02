'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/routing';
import Image from 'next/image';
import { Star, MapPin, Clock, Phone, Calendar, Heart, Share2, Mail, Globe, Store, Scissors, MessageSquare, Send } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';

interface Barbershop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  images: string[] | null;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean;
}

interface Barber {
  id: string;
  name: string | null;
  email: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
  isActive: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customerName: string;
  customerImage: string | null;
}

interface BarbershopDetailClientProps {
  shop: Barbershop;
  barbers: Barber[];
  locale: string;
  isAuthenticated?: boolean;
}

export function BarbershopDetailClient({ shop, barbers, locale, isAuthenticated = false }: BarbershopDetailClientProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?barbershopId=${shop.id}&limit=10`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [shop.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        variant: 'error',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour laisser un avis',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: shop.id,
          rating: reviewRating,
          comment: reviewComment || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          variant: 'success',
          title: 'Merci !',
          description: 'Votre avis a été ajouté avec succès',
        });
        setShowReviewForm(false);
        setReviewComment('');
        setReviewRating(5);
        // Refresh reviews
        const refreshRes = await fetch(`/api/reviews?barbershopId=${shop.id}&limit=10`);
        const refreshData = await refreshRes.json();
        setReviews(refreshData.reviews || []);
      } else {
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-primary-600 to-primary-800">
        {shop.images && shop.images.length > 0 ? (
          <Image
            src={shop.images[0]}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="w-32 h-32 text-white opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-sans font-bold text-white mb-2 drop-shadow-lg">{shop.name}</h1>
              <div className="flex items-center space-x-4 text-white">
                {shop.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-body font-semibold">{shop.rating}</span>
                    <span className="font-body">({shop.reviewCount} avis)</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-body text-sm">{shop.address}, {shop.city}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                }`}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-sans font-bold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-600 font-body leading-relaxed">
                {shop.description || 'Salon de coiffure professionnel spécialisé dans les soins capillaires.'}
              </p>
            </div>

            {/* Photo Gallery */}
            {shop.images && shop.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-sans font-bold text-gray-900 mb-4">Photos du Salon</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {shop.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={image}
                        alt={`${shop.name} - Photo ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team */}
            {barbers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-sans font-bold text-gray-900 mb-6">Notre Équipe</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {barbers.map((barber) => (
                    <div key={barber.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-sans font-bold text-xl">
                          {barber.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body font-semibold text-gray-900 truncate">{barber.name || 'Coiffeur'}</h3>
                        {barber.specialties && barber.specialties.length > 0 && (
                          <p className="text-sm text-gray-600 font-body truncate">
                            {barber.specialties.join(', ')}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 mt-1">
                          {barber.experience && (
                            <div className="flex items-center space-x-1">
                              <Scissors className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">{barber.experience} ans</span>
                            </div>
                          )}
                          {barber.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-body">{barber.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {barbers.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
                <p className="text-gray-500 font-body">
                  Aucun coiffeur n'est actuellement disponible dans ce salon.
                </p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-sans font-bold text-gray-900">Avis clients</h2>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {showReviewForm ? 'Annuler' : 'Laisser un avis'}
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire (optionnel)</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Partagez votre expérience..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingReview ? 'Envoi...' : 'Envoyer mon avis'}</span>
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des avis...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun avis pour le moment</p>
                  <p className="text-sm text-gray-400 mt-1">Soyez le premier à laisser un avis !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {review.customerImage ? (
                            <Image
                              src={review.customerImage}
                              alt={review.customerName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {review.customerName?.charAt(0).toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 my-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 border border-gray-200">
              <h3 className="text-xl font-sans font-bold text-gray-900 mb-4">Réserver un rendez-vous</h3>
              <Link
                href={`/barbershops/${shop.id}/booking`}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-body font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Choisir un créneau</span>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-sans font-bold text-gray-900 mb-4">Informations de contact</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body text-gray-900">{shop.address}</p>
                    <p className="font-body text-gray-600 text-sm">{shop.city}</p>
                  </div>
                </div>
                {shop.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${shop.phone}`} className="font-body text-gray-900 hover:text-primary-600">
                      {shop.phone}
                    </a>
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${shop.email}`} className="font-body text-gray-900 hover:text-primary-600 truncate">
                      {shop.email}
                    </a>
                  </div>
                )}
                {shop.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a 
                      href={shop.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-body text-gray-900 hover:text-primary-600 truncate"
                    >
                      Site web
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
