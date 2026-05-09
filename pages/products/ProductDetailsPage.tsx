import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Heart, Leaf, Loader2, MapPin, MessageCircle, Minus, Play, Plus, Send, ShoppingCart, Star, Truck, User, UserRound, Check, X, ExternalLink } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { API_BASE_URL, ProductService, StoryService, getCurrentUser } from '../../services/api';
import { Comment, Product, ProductRating, ProductRatingSummary, Story } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// ============ STORY MODAL ============
const StoryModal: React.FC<{ story: Story; onClose: () => void }> = ({ story, onClose }) => {
  const user = getCurrentUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likeCount);

  useEffect(() => {
    setLoadingComments(true);
    StoryService.getComments(story.id, 1, 20)
      .then(r => { if (r.success && r.data) setComments(r.data.comments); })
      .catch(() => {})
      .finally(() => setLoadingComments(false));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [story.id]);

  const handleLike = async () => {
    try {
      const r = await StoryService.like(story.id);
      if (r.success) { setLiked(p => !p); setLikeCount(p => liked ? p - 1 : p + 1); }
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      const r = await StoryService.addComment(story.id, newComment);
      if (r.success && r.data) { setComments(p => [r.data!, ...p]); setNewComment(''); }
    } catch {}
    setSubmitting(false);
  };

  const imgUrl = story.imageUrl
    ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_BASE_URL}${story.imageUrl}`)
    : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="relative h-64 flex-shrink-0">
          <img src={imgUrl} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {story.videoUrl && (
            <a href={story.videoUrl} target="_blank" rel="noopener noreferrer"
               className="absolute inset-0 flex items-center justify-center group">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-primary-600 ml-1" />
              </div>
            </a>
          )}
          <div className="absolute bottom-4 left-5 right-12">
            <h2 className="text-2xl font-bold text-white leading-tight">{story.title}</h2>
            <p className="text-white/80 text-sm mt-1">By {story.farmerName}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <p className="text-gray-700 leading-relaxed">{story.content}</p>
          {story.videoUrl && (
            <a href={story.videoUrl} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md text-sm font-medium">
              <Play className="w-4 h-4" />
              Watch Video
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <button onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </button>
            <span className="flex items-center gap-2 text-gray-500 text-sm">
              <MessageCircle className="w-5 h-5" />{comments.length} comments
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
            {user && (
              <form onSubmit={handleComment} className="flex gap-2 mb-4">
                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button type="submit" disabled={!newComment.trim() || submitting}
                  className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 transition-colors">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            )}
            {loadingComments ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
            ) : comments.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{c.userName}</span>
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ STORY CARD ============
const StoryCard: React.FC<{ story: Story; onClick: () => void }> = ({ story, onClick }) => {
  const imgUrl = story.imageUrl
    ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_BASE_URL}${story.imageUrl}`)
    : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400';

  return (
    <button onClick={onClick}
      className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 hover:scale-[1.02] transition-all duration-300 text-left group">
      <div className="relative h-40 overflow-hidden">
        <img src={imgUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {story.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-primary-600 ml-0.5" />
            </div>
          </div>
        )}
        <p className="absolute bottom-2 left-3 text-white text-xs font-medium">{story.farmerName}</p>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-purple-600 transition-colors mb-1">{story.title}</h4>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{story.content}</p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full group-hover:bg-purple-100 transition-colors">
          <BookOpen className="w-3 h-3" /> Read Story
        </span>
      </div>
    </button>
  );
};

// ============ RATING BAR ============
const RatingBar: React.FC<{ stars: number; count: number; max: number }> = ({ stars, count, max }) => {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right font-medium text-gray-600">{stars}</span>
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-gray-400">{count}</span>
    </div>
  );
};

// ============ MAIN COMPONENT ============
const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [ratings, setRatings] = useState<ProductRating[]>([]);
  const [ratingSummary, setRatingSummary] = useState<ProductRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) { setError('Invalid product id.'); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const [pRes, sRes, rRes] = await Promise.all([
          ProductService.getById(id),
          ProductService.getProductRatingSummary(id),
          ProductService.getProductRatings(id, 1, 20),
        ]);
        if (!pRes.success || !pRes.data) { setError(pRes.message || 'Product not found.'); setLoading(false); return; }
        setProduct(pRes.data);
        setRatingSummary(sRes.success && sRes.data ? sRes.data : {
          averageRating: pRes.data.averageRating || 0,
          totalRatings: pRes.data.totalRatings || 0,
          ratingDistribution: [0, 0, 0, 0, 0],
        });
        if (rRes.success && rRes.data) setRatings(rRes.data.ratings || []);

        // Fetch stories for this product
        try {
          const stRes = await StoryService.getByProductId(id);
          if (stRes.success && stRes.data) setStories(stRes.data.stories);
        } catch { /* ignore */ }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load product details.');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const imageUrl = useMemo(() => {
    if (!product?.imageUrl) return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=1000';
    return product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`;
  }, [product?.imageUrl]);

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex((i: any) => i.id === product.id);
    if (idx >= 0) { cart[idx].quantity += qty; }
    else {
      cart.push({
        id: product.id, name: product.name, price: product.price, quantity: qty, unit: product.unit,
        imageUrl: product.imageUrl, farmName: product.farmName || product.farmerName,
        farmerId: product.farmerId, farmerLatitude: product.farmerLatitude, farmerLongitude: product.farmerLongitude,
        isOrganic: product.isOrganic, distanceKm: product.distanceKm, deliveryFee: product.deliveryFee,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => { setAddingToCart(false); setAddedSuccess(true); setTimeout(() => setAddedSuccess(false), 2000); }, 300);
  };

  // Distribution max for bar scaling
  const distMax = ratingSummary ? Math.max(...ratingSummary.ratingDistribution, 1) : 1;

  // ---------- LOADING ----------
  if (loading) return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    </MainLayout>
  );

  // ---------- ERROR ----------
  if (error || !product) return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to open product</h2>
        <p className="text-gray-600 mb-6">{error || 'This product is unavailable.'}</p>
        <button onClick={() => navigate('/products')} className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors">
          Back to products
        </button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      {/* Inline animations */}
      <style>{`
        @keyframes ghd-fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ghd-scaleIn { from { opacity:0; transform:scale(0.95); }      to { opacity:1; transform:scale(1); } }
        .ghd-fade-1 { animation: ghd-fadeUp .5s .1s cubic-bezier(.22,1,.36,1) both; }
        .ghd-fade-2 { animation: ghd-fadeUp .5s .2s cubic-bezier(.22,1,.36,1) both; }
        .ghd-fade-3 { animation: ghd-fadeUp .5s .35s cubic-bezier(.22,1,.36,1) both; }
        .ghd-fade-4 { animation: ghd-fadeUp .5s .45s cubic-bezier(.22,1,.36,1) both; }
        .ghd-scale  { animation: ghd-scaleIn .5s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 ghd-fade-1">
          <button onClick={() => navigate('/products')} className="hover:text-primary-600 transition-colors font-medium">Products</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-400 truncate max-w-[200px]">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ===== HERO SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="ghd-scale relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shadow-xl group">
            <img
              src={imageUrl} alt={product.name}
              className="w-full h-full max-h-[520px] object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=1000'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 to-transparent pointer-events-none" />

            {/* Fav */}
            <button
              onClick={() => setIsFav(!isFav)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center
                         bg-white/90 backdrop-blur-md shadow-md border border-white/50
                         transition-all duration-300 hover:scale-110 active:scale-90
                         ${isFav ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
            >
              <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
            </button>

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2">
              {product.isOrganic && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-sm">
                  <Leaf className="w-3.5 h-3.5" /> Organic
                </span>
              )}
              {typeof product.distanceKm === 'number' && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-bold rounded-lg shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" /> {product.distanceKm.toFixed(1)} km
                </span>
              )}
            </div>
          </div>

          {/* Info card */}
          <div className="space-y-6 ghd-fade-2">
            {/* Category */}
            <p className="text-xs uppercase tracking-[0.15em] text-primary-600 font-bold">{product.category}</p>

            {/* Name */}
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

            {/* Rating row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(ratingSummary?.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800">{(ratingSummary?.averageRating || 0).toFixed(1)}</span>
              <span className="text-sm text-gray-400">({ratingSummary?.totalRatings || 0} reviews)</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description || 'No description available yet for this product.'}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm text-gray-700 font-medium">
                <UserRound className="w-3.5 h-3.5 text-primary-500" /> {product.farmerName}
              </span>
              {product.farmName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm text-gray-700 font-medium">
                  <Leaf className="w-3.5 h-3.5 text-primary-500" /> {product.farmName}
                </span>
              )}
              {typeof product.deliveryFee === 'number' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm text-blue-700 font-medium">
                  <Truck className="w-3.5 h-3.5" /> Rs. {product.deliveryFee} delivery
                </span>
              )}
            </div>

            {/* Price + Qty + Cart */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">Rs. {product.price.toFixed(0)}</span>
                <span className="text-sm text-gray-400 font-medium">/ {product.unit}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Qty selector */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-gray-50 transition-colors active:scale-90">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-4 py-2.5 text-sm font-bold text-gray-900 min-w-[40px] text-center border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 hover:bg-gray-50 transition-colors active:scale-90">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold
                            transition-all duration-300 active:scale-95 disabled:opacity-60 shadow-md
                            ${addedSuccess
                              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                              : 'bg-primary-500 text-white shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40'
                            }`}
                >
                  {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" />
                    : addedSuccess ? <><Check className="w-5 h-5" /> Added!</>
                    : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FARM STORIES SECTION ===== */}
        {stories.length > 0 && (
          <section className="mb-12 ghd-fade-3">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h2 className="text-xl font-bold text-gray-900">Farm Stories</h2>
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                {stories.length} {stories.length === 1 ? 'story' : 'stories'}
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
              {stories.map(s => (
                <StoryCard key={s.id} story={s} onClick={() => { setSelectedStory(s); setShowStoryModal(true); }} />
              ))}
            </div>
          </section>
        )}

        {/* ===== REVIEWS SECTION ===== */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:p-8 mb-8 ghd-fade-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: summary */}
            <div className="space-y-4">
              <div className="text-center md:text-left">
                <p className="text-5xl font-extrabold text-gray-900">{(ratingSummary?.averageRating || 0).toFixed(1)}</p>
                <div className="flex items-center justify-center md:justify-start gap-0.5 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(ratingSummary?.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{ratingSummary?.totalRatings || 0} reviews</p>
              </div>

              {/* Distribution bars */}
              <div className="space-y-1.5">
                {[5,4,3,2,1].map(s => (
                  <RatingBar key={s} stars={s} count={ratingSummary?.ratingDistribution?.[s - 1] || 0} max={distMax} />
                ))}
              </div>
            </div>

            {/* Right: individual reviews */}
            <div className="md:col-span-2 space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {ratings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to rate this product.</p>
              ) : ratings.map((r, i) => (
                <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-100 transition-colors"
                     style={{ animation: `ghd-fadeUp .4s ${i * 0.06}s cubic-bezier(.22,1,.36,1) both` }}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0 font-bold text-sm">
                        {r.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">{r.username}</p>
                        <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {r.review && <p className="text-gray-600 text-sm leading-relaxed">{r.review}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Story modal (full with comments + likes) */}
      {selectedStory && showStoryModal && (
        <StoryModal
          story={selectedStory}
          onClose={() => { setShowStoryModal(false); setSelectedStory(null); }}
        />
      )}
    </MainLayout>
  );
};

export default ProductDetailsPage;
