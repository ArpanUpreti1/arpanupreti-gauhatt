import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, ShoppingCart, Star, UserRound } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { API_BASE_URL, ProductService } from '../../services/api';
import { Product, ProductRating, ProductRatingSummary } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [ratings, setRatings] = useState<ProductRating[]>([]);
  const [ratingSummary, setRatingSummary] = useState<ProductRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        setError(t('productDetails.invalidId', 'Invalid product id.'));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [productResponse, summaryResponse, ratingsResponse] = await Promise.all([
          ProductService.getById(id),
          ProductService.getProductRatingSummary(id),
          ProductService.getProductRatings(id, 1, 20),
        ]);

        if (!productResponse.success || !productResponse.data) {
          setError(productResponse.message || t('productDetails.notFound', 'Product not found.'));
          setLoading(false);
          return;
        }

        setProduct(productResponse.data);

        if (summaryResponse.success && summaryResponse.data) {
          setRatingSummary(summaryResponse.data);
        } else {
          setRatingSummary({
            averageRating: productResponse.data.averageRating || 0,
            totalRatings: productResponse.data.totalRatings || 0,
            ratingDistribution: [0, 0, 0, 0, 0],
          });
        }

        if (ratingsResponse.success && ratingsResponse.data) {
          setRatings(ratingsResponse.data.ratings || []);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || t('productDetails.loadFailed', 'Failed to load product details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const imageUrl = useMemo(() => {
    if (!product?.imageUrl) {
      return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=1000';
    }

    return product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${API_BASE_URL}${product.imageUrl}`;
  }, [product?.imageUrl]);

  const renderStars = (value: number, className: string) => {
    const roundedValue = Math.round(value);
    return Array.from({ length: 5 }).map((_, index) => {
      const active = index < roundedValue;
      return (
        <Star
          key={index}
          className={`${className} ${active ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      );
    });
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    setAddingToCart(true);

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

    setTimeout(() => setAddingToCart(false), 250);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('productDetails.unableOpen', 'Unable to open product')}</h2>
          <p className="text-gray-600 mb-6">{error || t('productDetails.unavailable', 'This product is unavailable.')}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            {t('productDetails.backToProducts', 'Back to products')}
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back', 'Back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full max-h-[520px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=1000';
              }}
            />
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-primary-600 font-semibold uppercase tracking-wide mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.description || t('productDetails.noDescription', 'No description available yet for this product.')}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(ratingSummary?.averageRating || product.averageRating || 0, 'w-5 h-5')}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {(ratingSummary?.averageRating || product.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({ratingSummary?.totalRatings || product.totalRatings || 0} {t('productDetails.reviews', 'reviews')})
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-3xl font-bold text-primary-600">
                Rs. {product.price.toFixed(2)}
                <span className="text-base text-gray-500 ml-1">/{product.unit}</span>
              </p>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                  {t('productDetails.farmer', 'Farmer')}: {product.farmerName}
                </span>
                {product.farmName && (
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                    {t('productDetails.farm', 'Farm')}: {product.farmName}
                  </span>
                )}
                {product.isOrganic && (
                  <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
                    {t('products.organic', 'Organic')}
                  </span>
                )}
                {typeof product.distanceKm === 'number' && (
                  <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {product.distanceKm.toFixed(1)} {t('productDetails.kmAway', 'km away')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              {t('productDetails.addToCart', 'Add to cart')}
            </button>
          </div>
        </div>

        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('productDetails.customerReviews', 'Customer Reviews')}</h2>

          {ratings.length === 0 ? (
            <p className="text-gray-500">{t('productDetails.noReviews', 'No reviews yet. Be the first to rate this product.')}</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <UserRound className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{rating.username}</p>
                        <p className="text-xs text-gray-500">{new Date(rating.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(rating.rating, 'w-4 h-4')}
                    </div>
                  </div>

                  {rating.review && <p className="text-gray-700 text-sm">{rating.review}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default ProductDetailsPage;
