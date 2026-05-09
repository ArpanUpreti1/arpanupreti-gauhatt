import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart,
  Loader2,
  ChevronDown,
  X,
  Eye,
  BookOpen,
  MessageCircle,
  Send,
  User,
  ChevronRight,
  ChevronLeft,
  Heart,
  Star,
  Filter,
  SlidersHorizontal,
  MapPin,
  Navigation,
  Truck,
  Apple,
  AlertCircle,
  Check,
  Play,
  ExternalLink
} from 'lucide-react';
import { ProductService, StoryService, API_BASE_URL, LocationUtils, DeliveryService, getAuthToken, getCurrentUser } from '../../services/api';
import { Product, ProductFilter, Story, Comment, UserLocation } from '../../types';
import MainLayout from '../../components/MainLayout';
import LocationPicker from '../../components/LocationPicker';
import { useLanguage } from '../../contexts/LanguageContext';

// ============ LOCATION PROMPT MODAL ============
const LocationPromptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLocationSet: (location: UserLocation) => void;
  productToAdd?: Product;
  mandatory?: boolean;
}> = ({ isOpen, onClose, onLocationSet, productToAdd, mandatory = false }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState({ lat: '', lng: '', address: '' });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setError(null);
      setShowManualInput(false);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await LocationUtils.getCurrentLocation();
      const newLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: 'Current Location'
      };
      
      LocationUtils.saveLocation(newLocation);
      
      // Try to save to server if user is logged in
      const token = getAuthToken();
      if (token) {
        try {
          await DeliveryService.updateLocation(newLocation);
        } catch {
          // Silently fail - location is still saved locally
        }
      }
      
      onLocationSet(newLocation);
      onClose();
    } catch (err: any) {
      console.error('Location error:', err);
      if (err.code === 1) {
        setError(t('products.location.permissionDenied', 'Location permission denied. Please enable location access or enter manually.'));
      } else if (err.code === 2) {
        setError(t('products.location.unableDetermine', 'Unable to determine your location. Please enter manually.'));
      } else if (err.code === 3) {
        setError(t('products.location.timeout', 'Location request timed out. Please try again or enter manually.'));
      } else {
        setError(t('products.location.failedGet', 'Failed to get location. Please enter manually.'));
      }
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError(t('products.location.validCoordinates', 'Please enter valid coordinates'));
      return;
    }
    
    if (lat < -90 || lat > 90) {
      setError(t('products.location.latitudeRange', 'Latitude must be between -90 and 90'));
      return;
    }
    
    if (lng < -180 || lng > 180) {
      setError(t('products.location.longitudeRange', 'Longitude must be between -180 and 180'));
      return;
    }
    
    setLoading(true);
    const newLocation: UserLocation = {
      latitude: lat,
      longitude: lng,
      address: manualInput.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
    
    LocationUtils.saveLocation(newLocation);
    
    // Try to save to server
    const token = getAuthToken();
    if (token) {
      try {
        await DeliveryService.updateLocation(newLocation);
      } catch {
        // Silently fail
      }
    }
    
    setLoading(false);
    onLocationSet(newLocation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={mandatory ? undefined : onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {!mandatory && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 
                     rounded-full text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {mandatory ? t('products.location.requiredTitle', '📍 Location Required') : t('products.location.setTitle', 'Set Your Location')}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {mandatory 
                ? t('products.location.requiredDesc', 'Please set your location to browse products. This helps us show you farms near you and calculate accurate delivery fees.')
                : t('products.location.setDesc', 'We need your location to calculate delivery fees and show products available in your area.')}
            </p>
          </div>

          {/* Mandatory badge */}
          {mandatory && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Location is required to explore products and ensure accurate delivery to your area.
              </p>
            </div>
          )}

          {/* Product preview if adding to cart */}
          {productToAdd && (
            <div className="mb-6 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              <img 
                src={productToAdd.imageUrl 
                  ? (productToAdd.imageUrl.startsWith('http') ? productToAdd.imageUrl : `${API_BASE_URL}${productToAdd.imageUrl}`)
                  : 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=100'}
                alt={productToAdd.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{productToAdd.name}</p>
                <p className="text-xs text-gray-500">{t('products.addingToCart', 'Adding to cart...')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary-600">Rs. {productToAdd.price}</p>
                <p className="text-xs text-gray-400">/{productToAdd.unit}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Location Options */}
          {!showManualInput ? (
            <div className="space-y-3">
              <button
                onClick={handleGetCurrentLocation}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 text-white 
                         rounded-xl font-semibold shadow-lg shadow-primary-500/20
                         hover:bg-primary-600 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('products.location.getting', 'Getting Location...')}
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    {t('products.location.allowAccess', 'Allow Location Access')}
                  </>
                )}
              </button>

              <button
                onClick={() => setShowManualInput(true)}
                className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium
                         hover:bg-gray-50 transition-colors"
              >
                {t('products.location.enterManually', 'Enter Location Manually')}
              </button>

              <p className="text-xs text-center text-gray-400 mt-4">
                {t('products.location.storedLocally', 'Your location is stored locally and used only for delivery calculations.')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('products.location.latitude', 'Latitude')} *
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualInput.lat}
                  onChange={e => setManualInput(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="e.g., 27.7172"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('products.location.longitude', 'Longitude')} *
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualInput.lng}
                  onChange={e => setManualInput(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="e.g., 85.3240"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('products.location.addressOptional', 'Address (Optional)')}
                </label>
                <input
                  type="text"
                  value={manualInput.address}
                  onChange={e => setManualInput(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g., Kathmandu, Nepal"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <p className="text-xs text-gray-500">
                {t('products.location.tip', 'Tip: Find coordinates on Google Maps by right-clicking and selecting "What\'s here?"')}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setError(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium
                           hover:bg-gray-50 transition-colors"
                >
                  {t('common.back', 'Back')}
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.lat || !manualInput.lng || loading}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold
                           hover:bg-primary-600 disabled:opacity-50 transition-colors
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {t('products.location.setLocation', 'Set Location')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ CUSTOM STAR FRUIT ICON ============
const StarFruit: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon 
      points="12,2 14.5,8.5 21,9.5 16,14.5 17.5,21 12,17.5 6.5,21 8,14.5 3,9.5 9.5,8.5" 
      fill="currentColor"
      stroke="currentColor"
    />
  </svg>
);

// ============ FRUIT RATING COMPONENT ============
const FruitRating: React.FC<{
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}> = ({ rating, maxRating = 5, size = 'md', interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };
  
  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = hoverRating > 0 ? index < hoverRating : index < rating;
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index + 1)}
            onMouseEnter={() => interactive && setHoverRating(index + 1)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} 
                       transition-all duration-200 ${filled ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            <StarFruit className={sizeClasses[size]} />
          </button>
        );
      })}
    </div>
  );
};

// ============ RATING MODAL COMPONENT ============
const RatingModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmit: (rating: number, review?: string) => void;
  initialRating?: number;
}> = ({ product, isOpen, onClose, onRatingSubmit, initialRating = 0 }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setReview('');
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      await onRatingSubmit(rating, review || undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 
                   rounded-full text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-50 rounded-full flex items-center justify-center">
              <StarFruit className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('products.rateProduct', 'Rate')} {product.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('products.rateQuestion', 'How would you rate this product?')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Fruit Rating */}
            <div className="flex flex-col items-center gap-3">
              <FruitRating 
                rating={rating} 
                size="lg" 
                interactive 
                onRatingChange={setRating} 
              />
              <span className="text-sm text-gray-500">
                {rating === 0 && t('products.rating.tapToRate', 'Tap a star fruit to rate')}
                {rating === 1 && t('products.rating.1', 'Not Fresh 😕')}
                {rating === 2 && t('products.rating.2', 'Okay 🙂')}
                {rating === 3 && t('products.rating.3', 'Tasty 😋')}
                {rating === 4 && t('products.rating.4', 'Delicious 😍')}
                {rating === 5 && t('products.rating.5', 'Farm Fresh! 🤤')}
              </span>
            </div>

            {/* Review textarea */}
            {user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.writeReviewOptional', 'Write a review (optional)')}
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={t('products.reviewPlaceholder', 'Share your experience with this product...')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 
                           focus:ring-2 focus:ring-primary-500/20 resize-none transition-all duration-200"
                  rows={3}
                />
              </div>
            )}

            {!user && (
              <p className="text-center text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
                {t('products.signInToRate', 'Please sign in to submit your rating')}
              </p>
            )}

            <button
              type="submit"
              disabled={rating === 0 || submitting || !user}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold
                       shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:shadow-primary-500/30
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.submitting', 'Submitting...')}
                </>
              ) : (
                <>
                  <StarFruit className="w-5 h-5" />
                  {t('products.submitRating', 'Submit Rating')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============ SKELETON COMPONENTS ============
const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="relative aspect-[4/3] bg-gray-200">
      <div className="absolute top-3 left-3 w-14 h-6 bg-gray-300 rounded-full" />
    </div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-10 bg-gray-200 rounded-xl w-10" />
      </div>
    </div>
  </div>
);

const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// ============ STORY MODAL COMPONENT ============
const StoryModal: React.FC<{
  story: Story;
  isOpen: boolean;
  onClose: () => void;
}> = ({ story, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likeCount);
  const user = getCurrentUser();

  useEffect(() => {
    if (isOpen) {
      loadComments();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const response = await StoryService.getComments(story.id, 1, 20);
      if (response.success && response.data) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setSubmitting(true);
    try {
      const response = await StoryService.addComment(story.id, newComment);
      if (response.success && response.data) {
        setComments(prev => [response.data!, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await StoryService.like(story.id);
      if (response.success) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  if (!isOpen) return null;

  const imageUrl = story.imageUrl 
    ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_BASE_URL}${story.imageUrl}`)
    : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 
                   rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col max-h-[90vh]">
          <div className="relative h-64 flex-shrink-0">
            <img 
              src={imageUrl}
              alt={story.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Video play button overlay */}
            {story.videoUrl && (
              <a 
                href={story.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl
                              group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-7 h-7 text-green-600 ml-1" />
                </div>
              </a>
            )}
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white mb-1">{story.title}</h2>
              <p className="text-white/80 text-sm">{t('products.by', 'By')} {story.farmerName}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-gray-700 leading-relaxed mb-4">{story.content}</p>

            {/* Video link button */}
            {story.videoUrl && (
              <a 
                href={story.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gradient-to-r from-red-500 to-pink-500 
                         text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-md"
              >
                <Play className="w-4 h-4" />
                <span className="font-medium">{t('products.watchVideo', 'Watch Video')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                          ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likeCount}</span>
              </button>
              <span className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length} {t('products.comments', 'comments')}</span>
              </span>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-4">{t('products.commentsTitle', 'Comments')}</h3>
              
              {user && (
                <form onSubmit={handleSubmitComment} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('products.addComment', 'Add a comment...')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              )}

              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {comments.map((comment, index) => (
                    <div 
                      key={comment.id} 
                      className="flex gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">{t('products.noComments', 'No comments yet. Be the first!')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ PRODUCT CARD COMPONENT ============
const ProductCard: React.FC<{ product: Product; index: number; onAddToCart: (product: Product) => void; onOpenDetails: (productId: string) => void }> = ({ product, index, onAddToCart, onOpenDetails }) => {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(product.averageRating || 0);
  const [totalRatings, setTotalRatings] = useState(product.totalRatings || 0);
  const [userRating, setUserRating] = useState(product.userRating || 0);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await StoryService.getByProductId(product.id);
        if (response.success && response.data) {
          setStories(response.data.stories);
        }
      } catch (error) {
        console.error('Failed to fetch stories:', error);
      }
    };
    fetchStories();
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding || addedSuccess) return;
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 350));
    onAddToCart(product);
    setIsAdding(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1800);
  };

  const handleViewStory = (story: Story, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRatingModal(true);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFav(!isFav);
  };

  const handleRatingSubmit = async (rating: number, review?: string) => {
    try {
      const response = await ProductService.rateProduct(product.id, rating, review);
      if (response.success && response.data) {
        setUserRating(rating);
        const newTotal = totalRatings + (userRating ? 0 : 1);
        const newAverage = userRating 
          ? ((currentRating * totalRatings) - userRating + rating) / totalRatings
          : ((currentRating * totalRatings) + rating) / newTotal;
        setCurrentRating(Math.round(newAverage * 10) / 10);
        setTotalRatings(newTotal);
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`)
    : 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400';

  const distance = product.distanceKm !== undefined && product.distanceKm !== null 
    ? product.distanceKm.toFixed(1) 
    : null;

  return (
    <>
      {/* -- Card animation styles -- */}
      <style>{`
        @keyframes gha-fadeInUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes gha-storyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.45); }
          50%      { box-shadow: 0 0 0 6px rgba(139, 92, 246, 0); }
        }
        @keyframes gha-cartSuccess {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes gha-heartPop {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.35); }
          60%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .gha-card-enter {
          animation: gha-fadeInUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }
        .gha-story-pulse {
          animation: gha-storyPulse 2.5s ease-in-out infinite;
        }
        .gha-cart-pop {
          animation: gha-cartSuccess 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .gha-heart-pop {
          animation: gha-heartPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div 
        className="gha-card-enter group relative bg-white rounded-2xl overflow-hidden
                   border border-gray-100/80 cursor-pointer
                   transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]
                   hover:shadow-[0_20px_40px_-12px_rgba(76,154,42,0.15)] hover:border-primary-200/60
                   hover:scale-[1.02]"
        style={{ animationDelay: `${index * 70}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onOpenDetails(product.id)}
      >
        {/* ---- IMAGE AREA ---- */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          {/* Shimmer skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          )}

          {/* Product image */}
          <img 
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform
                       ${isHovered ? 'scale-[1.08]' : 'scale-100'}
                       ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400';
              setImageLoaded(true);
            }}
          />
          
          {/* Gradient overlay — always subtle, stronger on hover */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500
                         bg-gradient-to-t from-black/50 via-black/5 to-transparent
                         ${isHovered ? 'opacity-100' : 'opacity-30'}`} />

          {/* Distance badge */}
          {distance !== null && (
            <div className="absolute top-3 left-3 z-[5]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-md
                             text-xs font-bold text-gray-800 rounded-lg shadow-sm
                             border border-white/50 transition-transform duration-300
                             group-hover:scale-105">
                <MapPin className="w-3 h-3 text-primary-500" />
                {distance} km
              </span>
            </div>
          )}

          {/* Organic badge */}
          {product.isOrganic && (
            <div className="absolute top-3 right-12 z-[5]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md
                             text-white text-xs font-bold rounded-lg shadow-sm
                             border border-emerald-400/30">
                <Apple className="w-3 h-3" />
                {t('products.organic', 'Organic')}
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavClick}
            className={`absolute top-3 right-3 z-[5] w-8 h-8 rounded-full flex items-center justify-center
                       bg-white/90 backdrop-blur-md shadow-sm border border-white/50
                       transition-all duration-300 hover:scale-110 active:scale-90
                       ${isFav ? 'text-red-500 gha-heart-pop' : 'text-gray-400 hover:text-red-400'}`}
          >
            <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
          </button>

          {/* ---- STORY BUTTON — ALWAYS VISIBLE ---- */}
          {stories.length > 0 && (
            <button
              onClick={(e) => handleViewStory(stories[0], e)}
              className="gha-story-pulse absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 
                        px-3 py-1.5 bg-white/95 backdrop-blur-md text-gray-800 text-xs font-bold 
                        rounded-full shadow-lg border border-purple-100/50
                        hover:bg-purple-50 hover:text-purple-700 hover:scale-105
                        active:scale-95 transition-all duration-300"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span>{stories.length} {stories.length === 1 ? t('products.story', 'Story') : t('products.stories', 'Stories')}</span>
            </button>
          )}

          {/* Quick-view hint on hover */}
          <div className={`absolute bottom-3 right-3 z-[5] transition-all duration-300
                         ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-md
                           text-xs font-medium text-gray-600 rounded-lg shadow-sm">
              <Eye className="w-3 h-3" />
              {t('products.quickView', 'View')}
            </span>
          </div>
        </div>

        {/* ---- CARD BODY ---- */}
        <div className="relative p-4 space-y-2.5">
          {/* Accent gradient line */}
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-primary-400 via-primary-300 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Name + Rating row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-1 
                          group-hover:text-primary-700 transition-colors duration-300">
              {product.name}
            </h3>
            <button 
              onClick={handleRatingClick}
              className="flex items-center gap-1 flex-shrink-0 px-1.5 py-0.5 rounded-md
                        hover:bg-yellow-50 hover:scale-105 active:scale-95 transition-all duration-200"
              title={t('products.rateThisProduct', 'Rate this product')}
            >
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-gray-700">
                {currentRating > 0 ? currentRating.toFixed(1) : '—'}
              </span>
              {totalRatings > 0 && (
                <span className="text-[10px] text-gray-400">({totalRatings})</span>
              )}
            </button>
          </div>

          {/* Farm name */}
          <p className="text-sm text-gray-500 line-clamp-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-2.5 h-2.5 text-primary-600" />
            </span>
            {product.farmName || product.farmerName}
          </p>

          {/* Price + Cart row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-gray-900">
                Rs. {product.price.toFixed(0)}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">/{product.unit}</span>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`relative p-2.5 rounded-xl shadow-md transition-all duration-300
                        active:scale-90 disabled:cursor-wait overflow-hidden
                        ${addedSuccess 
                          ? 'bg-emerald-500 text-white shadow-emerald-500/30 gha-cart-pop' 
                          : 'bg-primary-500 text-white shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 hover:scale-110'
                        }`}
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : addedSuccess ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedStory && (
        <StoryModal 
          story={selectedStory} 
          isOpen={showStoryModal} 
          onClose={() => {
            setShowStoryModal(false);
            setSelectedStory(null);
          }} 
        />
      )}

      <RatingModal
        product={product}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRatingSubmit={handleRatingSubmit}
        initialRating={userRating}
      />
    </>
  );
};

// ============ MAIN PRODUCT LISTING COMPONENT ============
const ProductListing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [maxDistanceFilter, setMaxDistanceFilter] = useState<number>(40);
  
  // Location prompt modal state
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [pendingCartProduct, setPendingCartProduct] = useState<Product | null>(null);
  
  const [filter, setFilter] = useState<ProductFilter>({
    page: 1,
    pageSize: 12,
    sortBy: 'newest',
    sortOrder: 'desc',
    enforceDeliveryLimit: true,
  });

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Load saved location on mount; browsing remains available without location.
  useEffect(() => {
    const saved = LocationUtils.getSavedLocation();
    if (saved) {
      setUserLocation(saved);
      setFilter(prev => ({
        ...prev,
        consumerLatitude: saved.latitude,
        consumerLongitude: saved.longitude,
      }));
    }
  }, []);

  // Handle location change
  const handleLocationChange = (location: UserLocation | null) => {
    setUserLocation(location);
    if (location) {
      setFilter(prev => ({
        ...prev,
        consumerLatitude: location.latitude,
        consumerLongitude: location.longitude,
        page: 1,
      }));
    } else {
      setFilter(prev => ({
        ...prev,
        consumerLatitude: undefined,
        consumerLongitude: undefined,
        page: 1,
      }));
    }
  };

  // Handle distance filter change
  const handleDistanceFilterChange = (value: number) => {
    setMaxDistanceFilter(value);
    setFilter(prev => ({
      ...prev,
      maxDistance: value,
      page: 1,
    }));
  };

  // Initialize from URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    
    if (categoryFromUrl) {
      setFilter(prev => ({ ...prev, category: categoryFromUrl, page: 1 }));
    }
    if (searchFromUrl) {
      setSearchInput(searchFromUrl);
      setDebouncedSearch(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setFilter(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAll(filter);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (sortBy: string) => {
    setFilter(prev => ({
      ...prev,
      sortBy: sortBy as ProductFilter['sortBy'],
      page: 1,
    }));
    setSortDropdownOpen(false);
  };

  // Add product to cart with location check
  const addProductToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit,
        imageUrl: product.imageUrl,
        farmName: product.farmName || product.farmerName,
        farmerId: product.farmerId,
        farmerLatitude: product.farmerLatitude,
        farmerLongitude: product.farmerLongitude,
        isOrganic: product.isOrganic,
        distanceKm: product.distanceKm,
        deliveryFee: product.deliveryFee,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleAddToCart = (product: Product) => {
    // Check if location is set
    const savedLocation = LocationUtils.getSavedLocation();
    
    if (!savedLocation) {
      // Show location prompt modal
      setPendingCartProduct(product);
      setShowLocationPrompt(true);
      return;
    }
    
    // Location is available, add to cart directly
    addProductToCart(product);
  };

  const handleOpenProductDetails = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Handle when location is set from the prompt modal
  const handleLocationSetFromPrompt = (location: UserLocation) => {
    setUserLocation(location);
    setFilter(prev => ({
      ...prev,
      consumerLatitude: location.latitude,
      consumerLongitude: location.longitude,
      page: 1,
    }));
    
    // Close the modal
    setShowLocationPrompt(false);
    
    // Add the pending product to cart if any
    if (pendingCartProduct) {
      addProductToCart(pendingCartProduct);
      setPendingCartProduct(null);
    }
  };

  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { label: t('products.sort.newest', 'Newest Arrivals'), value: 'newest' },
    { label: t('products.sort.priceLow', 'Price: Low to High'), value: 'price_low' },
    { label: t('products.sort.priceHigh', 'Price: High to Low'), value: 'price_high' },
    { label: t('products.sort.distance', 'Distance: Nearest'), value: 'distance' },
    { label: t('products.sort.name', 'Name: A-Z'), value: 'name' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === filter.sortBy)?.label || t('products.sort.newest', 'Newest Arrivals');

  // Distance filter options
  const distanceOptions = [5, 10, 20, 30, 40];

  return (
    <MainLayout>
      {/* Location & Distance Filter Banner */}
      <div className={`rounded-2xl p-4 mb-6 animate-fade-in ${
        userLocation 
          ? 'bg-gradient-to-r from-primary-50 to-green-50' 
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Location Picker (Compact) */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${userLocation ? 'bg-primary-100' : 'bg-amber-100'}`}>
              {userLocation ? (
                <Truck className="w-5 h-5 text-primary-600" />
              ) : (
                <MapPin className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${userLocation ? 'text-gray-900' : 'text-amber-900'}`}>
                {userLocation ? t('products.deliveryLocationSet', 'Delivery Location Set') : t('products.setLocationBetter', '📍 Set Your Location for Better Experience')}
              </p>
              <p className={`text-xs ${userLocation ? 'text-gray-500' : 'text-amber-700'}`}>
                {userLocation 
                  ? `${t('products.showingWithin', 'Showing farms within')} ${maxDistanceFilter}km`
                  : t('products.accurateDeliveryAndNearby', 'Get accurate delivery fees & see products near you')}
              </p>
            </div>
            {!userLocation ? (
              <button
                onClick={() => setShowLocationPrompt(true)}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium text-sm
                         shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all duration-200
                         flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {t('products.location.setLocation', 'Set Location')}
              </button>
            ) : (
              <LocationPicker 
                onLocationChange={handleLocationChange}
                compact={true}
                showSaveButton={false}
              />
            )}
          </div>

          {/* Distance Filter Slider */}
          {userLocation && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{t('products.maxDistance', 'Max Distance:')}</span>
              </div>
              <div className="flex items-center gap-2">
                {distanceOptions.map(dist => (
                  <button
                    key={dist}
                    onClick={() => handleDistanceFilterChange(dist)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                              ${maxDistanceFilter === dist
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
                  >
                    {dist}km
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            {filter.category ? (
              <>
                <span className="text-primary-500">{filter.category}</span>
                <button
                  onClick={() => setFilter(prev => ({ ...prev, category: undefined, page: 1 }))}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </>
            ) : (
              t('products.allProducts', 'All Products')
            )}
          </h1>
          {!loading && (
            <p className="text-gray-500 text-sm mt-1">
              {t('products.showing', 'Showing')} <strong>{products.length}</strong> {t('products.of', 'of')} <strong>{totalCount}</strong> {t('products.products', 'products')}
              {userLocation && ` within ${maxDistanceFilter}km`}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <div className="relative flex-1 sm:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('products.search', 'Search...')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white
                       text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative hidden sm:block" ref={sortDropdownRef}>
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200
                       text-sm font-medium text-gray-700 transition-all duration-300
                       hover:border-primary-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 
                         py-2 z-20 transition-all duration-300 origin-top-right
                         ${sortDropdownOpen 
                           ? 'opacity-100 scale-100 visible' 
                           : 'opacity-0 scale-95 invisible'}`}
            >
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`w-full px-4 py-3 text-left text-sm transition-all duration-200
                            ${filter.sortBy === opt.value 
                              ? 'text-primary-600 bg-primary-50 font-semibold' 
                              : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Sort Button */}
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="sm:hidden p-2.5 bg-white rounded-xl border border-gray-200 text-gray-600
                     hover:border-primary-300 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sort Dropdown */}
      {sortDropdownOpen && (
        <div className="sm:hidden mb-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 animate-fade-in">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className={`w-full px-4 py-3 text-left text-sm rounded-xl transition-all duration-200
                        ${filter.sortBy === opt.value 
                          ? 'text-primary-600 bg-primary-50 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index}
              onAddToCart={handleAddToCart}
              onOpenDetails={handleOpenProductDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {t('products.noProductsHint', "Try adjusting your filters or search terms to find what you're looking for")}
          </p>
          <button 
            onClick={() => {
              setSearchInput('');
              setFilter({
                page: 1,
                pageSize: 12,
                sortBy: 'newest',
                sortOrder: 'desc',
              });
            }}
            className="px-8 py-3.5 bg-primary-500 text-white rounded-xl font-semibold
                     shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:shadow-primary-500/50
                     transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            {t('products.clearAllFilters', 'Clear all filters')}
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center items-center gap-2 mt-12 animate-fade-in">
          <button
            onClick={() => handlePageChange(filter.page! - 1)}
            disabled={filter.page === 1}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600
                     hover:bg-gray-50 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (filter.page! <= 3) {
              pageNum = i + 1;
            } else if (filter.page! >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = filter.page! - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-11 h-11 rounded-xl font-semibold text-sm transition-all duration-300
                          ${filter.page === pageNum 
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-primary-50 hover:border-primary-200 active:scale-95'}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(filter.page! + 1)}
            disabled={filter.page === totalPages}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600
                     hover:bg-gray-50 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Location Prompt Modal */}
      <LocationPromptModal
        isOpen={showLocationPrompt}
        onClose={() => {
          setShowLocationPrompt(false);
          setPendingCartProduct(null);
        }}
        onLocationSet={handleLocationSetFromPrompt}
        productToAdd={pendingCartProduct || undefined}
      />
    </MainLayout>
  );
};

export default ProductListing;
