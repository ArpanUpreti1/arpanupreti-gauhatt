import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, MapPin, Star, ShieldCheck, Sun, Leaf, Truck, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { API_BASE_URL, ProductService } from '../../services/api';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/Button';

export default function ProductDetailPreAuth() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await ProductService.getById(id);
        if (response.success && response.data) {
          setProductData(response.data);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <Loader2 className="w-8 h-8 text-[#8B9D83] animate-spin" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <p>Product not found.</p>
      </div>
    );
  }

  const imageUrl = productData.imageUrl
    ? (productData.imageUrl.startsWith('http') ? productData.imageUrl : `${API_BASE_URL}${productData.imageUrl}`)
    : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80';

  const product = {
    name: productData.name,
    variety: productData.category || 'Fresh Harvest',
    description: productData.description || 'A hand-selected crate of our most sought-after varieties. Grown in mineral-rich soil using regenerative practices.',
    originStory: 'Our heritage seeds have been saved and replanted on our farm. The unique microclimate of our valley gives these products their distinctive deep color and intense sweetness.',
    harvestDate: 'Morning of delivery',
    availability: 'Seasonal',
    deliveryTimeline: 'Within 12 hours of harvest',
    stock: productData.stockQuantity > 0 ? `${productData.stockQuantity} ${productData.unit}s available` : 'Sold out today',
    unitSize: `1 ${productData.unit}`,
    tags: [productData.isOrganic ? 'Certified Organic' : 'Locally Grown', 'Sun-ripened'],
    images: [imageUrl],
    price: productData.price
  };

  const farmer = {
    name: productData.farmName || productData.farmerName,
    farmerName: productData.farmerName,
    location: 'Verdant Valley',
    distance: `${productData.distanceKm?.toFixed(1) || '--'} km away`,
    rating: productData.averageRating?.toFixed(1) || '4.9',
    fulfillments: productData.totalRatings || 0,
    avatar: 'https://images.unsplash.com/photo-1595856758652-3d8b52f10d0f?w=400&q=80'
  };

  return (
    <div className="font-sans bg-[#F9F8F6] text-[#2C2B29] min-h-screen pt-14">
      
      {/* Global App Navigation */}
      <nav className="fixed top-0 z-[60] w-full border-b border-gray-100 bg-white/85 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex h-8 w-8 items-center justify-center bg-primary-500 text-white">
                <Leaf size={20} fill="currentColor" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-gray-900">GAUHATT</span>
            </div>
            
            <div className="hidden items-center space-x-5 md:flex">
              <button
                onClick={() => navigate('/discover-products')}
                className="group relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                <span>{t('landing.products', 'Products')}</span>
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary-500
                           transition-transform duration-300 ease-out group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </button>
              <Button size="md" onClick={() => navigate('/register')} className="px-4 py-2 text-sm font-semibold shadow-none hover:shadow-none">
                {t('landing.getStarted', 'Get Started')}
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => navigate('/discover-products')}
                className="group relative rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span>{t('landing.products', 'Products')}</span>
                <span
                  className="absolute -bottom-0.5 left-2.5 right-2.5 h-0.5 origin-left scale-x-0 bg-primary-500
                           transition-transform duration-300 ease-out group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-12 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#E8E6E1]">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600';
              }}
            />
          </div>

          <div className="pt-8 space-y-12">
            <section>
              <h3 className="text-sm tracking-widest uppercase text-[#7A756D] mb-4">The Origin</h3>
              <p className="text-lg leading-relaxed font-light">{product.originStory}</p>
            </section>
            
            <section className="border-t border-[#E8E6E1] pt-12">
              <h3 className="text-sm tracking-widest uppercase text-[#7A756D] mb-6">Farming Practices</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-lg border border-[#E8E6E1] flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-[#8B9D83]" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-sm font-medium">{productData.isOrganic ? "Certified Organic" : "Natural Quality"}</h4>
                    <p className="text-xs text-[#7A756D] mt-1">{productData.isOrganic ? "No synthetic pesticides or fertilizers used." : "Grown safely."}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-[#E8E6E1] flex gap-4">
                  <Leaf className="w-6 h-6 text-[#8B9D83]" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-sm font-medium">Regenerative Soil</h4>
                    <p className="text-xs text-[#7A756D] mt-1">Compost-fed beds that capture carbon.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right: Details & Gate Card */}
        <div className="lg:col-span-5 space-y-10">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs font-medium px-3 py-1 bg-[#E8E6E1] text-[#2C2B29] rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-2">{product.name}</h1>
            <p className="text-lg text-[#7A756D] mb-6">{product.variety}</p>
            <p className="leading-relaxed font-light">{product.description}</p>
          </div>

          <div className="space-y-4 text-sm bg-white p-6 rounded-xl border border-[#E8E6E1]">
            <div className="flex justify-between py-2 border-b border-[#E8E6E1]/50 last:border-0">
              <span className="text-[#7A756D]">Harvest</span>
              <span className="font-medium">{product.harvestDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E8E6E1]/50 last:border-0">
              <span className="text-[#7A756D]">Availability</span>
              <span className="font-medium">{product.availability}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E8E6E1]/50 last:border-0">
              <span className="text-[#7A756D]">Unit Size</span>
              <span className="font-medium">{product.unitSize}</span>
            </div>
          </div>

          {/* Pricing & Gate Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 sm:p-10 shadow-lg">
            <div className="absolute -top-4 -right-4 p-8 opacity-[0.03]">
              <Lock className="w-48 h-48 text-primary-500" strokeWidth={1} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest">Direct from Farm</p>
                {/* Blurred Price */}
                <div className="flex items-end gap-3 filter blur-md opacity-60 select-none pointer-events-none">
                  <span className="text-5xl font-bold text-gray-900">Rs. {product.price.toFixed(0)}</span>
                  <span className="text-lg text-gray-500 mb-1">/ {product.unitSize}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Sign in to unlock</h3>
                <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-sm">
                  Join our local food network to see farm-direct pricing, order fresh harvests, and support growers in your community.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="md" onClick={() => navigate('/register')} className="flex-1 shadow-none transition-transform hover:scale-[1.02]">
                  Create Account
                </Button>
                <Button size="md" onClick={() => navigate('/login')} variant="outline" className="flex-1 shadow-none transition-transform hover:scale-[1.02]">
                  Sign In
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
