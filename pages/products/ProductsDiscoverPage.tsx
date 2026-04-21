import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Leaf } from 'lucide-react';
import { API_BASE_URL, ProductService } from '../../services/api';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductsDiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await ProductService.getAll({
          page: 1,
          pageSize: 12,
          sortBy: 'newest',
          sortOrder: 'desc',
          enforceDeliveryLimit: false,
        });

        if (response.success && response.data) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const title = useMemo(() => {
    if (loading) return t('discover.loadingProducts', 'Loading Products');
    return products.length > 0 ? t('discover.freshProducts', 'Fresh Products') : t('discover.noProductsYet', 'No Products Yet');
  }, [loading, products.length, t]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-lg font-serif font-bold text-gray-900 tracking-tight hover:text-primary-600 transition-colors"
          >
            GAUHATT
          </button>

          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            {t('landing.getStarted', 'Get Started')}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-600 font-semibold">Gauhatt</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">{title}</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            {t('discover.description', 'This is a dedicated product preview page from the landing navigation. Browse quickly, then open the full products page for filters and location-based delivery details.')}
          </p>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-600">{t('discover.noProductsAvailable', 'No products are available right now.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const imageUrl = product.imageUrl
                ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`)
                : 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600';

              return (
                <button
                  key={product.id}
                  onClick={() => navigate('/login')}
                  className="text-left border border-gray-100 rounded-2xl overflow-hidden hover:border-primary-200 hover:shadow-md transition-all"
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600';
                    }}
                  />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                      {product.isOrganic && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          <Leaf className="w-3 h-3" />
                          {t('products.organic', 'Organic')}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {product.farmName || product.farmerName}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-primary-600 font-bold">
                        Rs. {product.price.toFixed(0)}
                        <span className="text-gray-400 text-xs ml-1">/{product.unit}</span>
                      </p>

                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                        {t('discover.buyNow', 'Buy Now')}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsDiscoverPage;
