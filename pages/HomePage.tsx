import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  Star,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { ProductService, API_BASE_URL } from '../services/api';
import { Product } from '../types';
import MainLayout from '../components/MainLayout';

// ============ PRODUCT CARD SKELETON ============
const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden animate-pulse shadow-sm">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-3/5" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded w-8" />
      </div>
    </div>
  </div>
);

// ============ FEATURED PRODUCT CARD ============
const FeaturedProductCard: React.FC<{ product: Product; index: number }> = ({ product, index }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`)
    : 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group
                 transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/10 
                 hover:-translate-y-2 animate-fade-in border border-gray-100"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/products`)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700
                     ${isHovered ? 'scale-110' : 'scale-100'}
                     ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400';
            setImageLoaded(true);
          }}
        />
        
        {/* Distance badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-primary-500 text-white 
                         text-xs font-bold rounded-full shadow-lg
                         transition-transform duration-300 group-hover:scale-110">
            {product.distanceKm || Math.floor(Math.random() * 15) + 5} km
          </span>
        </div>

        {/* Organic badge */}
        {product.isOrganic && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white 
                           text-xs font-bold rounded-full shadow-lg animate-pulse-soft">
              <Sparkles className="w-3 h-3" />
              Organic
            </span>
          </div>
        )}

        {/* Quick add overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                       transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-3 bg-white rounded-full shadow-lg
                     text-primary-600 hover:bg-primary-500 hover:text-white
                     transition-all duration-300 hover:scale-110 active:scale-95
                     translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 
                     transition-colors duration-300 text-base">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
          {product.farmName || product.farmerName}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-lg font-bold text-primary-600">
            ₹{product.price.toFixed(0)}<span className="text-xs text-gray-400 font-normal">/{product.unit}</span>
          </p>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-semibold text-gray-600">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ CATEGORY CARD ============
const CategoryCard: React.FC<{ 
  name: string; 
  image: string;
  count: number;
  index: number;
}> = ({ name, image, count, index }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onClick={() => navigate(`/products?category=${encodeURIComponent(name)}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group animate-fade-in
                bg-gradient-to-br from-gray-100 to-gray-50 aspect-[4/3]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <img
        src={image}
        alt={name}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700
                  ${isHovered ? 'scale-110' : 'scale-100'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-lg group-hover:translate-x-1 transition-transform duration-300">
          {name}
        </h3>
        <p className="text-white/70 text-sm">{count} products</p>
      </div>
      
      {/* Hover arrow */}
      <div className={`absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full
                     flex items-center justify-center transition-all duration-300
                     ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

// ============ MAIN HOME PAGE ============
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAll({ page: 1, pageSize: 8 });
      if (response.success && response.data) {
        setFeaturedProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  // Categories with real images
  const categories = [
    { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', count: 45 },
    { name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', count: 28 },
    { name: 'Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', count: 36 },
    { name: 'Baked Goods', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', count: 19 },
  ];

  return (
    <MainLayout>
      {/* ============ HERO BANNER ============ */}
      <div className="relative rounded-3xl overflow-hidden mb-10 animate-fade-in group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/95 via-primary-500/90 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200"
          alt="Fresh vegetables"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
        />
        
        <div className="relative z-20 p-8 lg:p-12 min-h-[280px] lg:min-h-[340px] flex flex-col justify-center">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm 
                          rounded-full text-white text-sm mb-4 animate-bounce-subtle">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Fresh from Local Farms</span>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Farm Fresh
              <br />
              <span className="text-yellow-300">Delivered Daily</span>
            </h1>
            
            <p className="text-white/90 text-base lg:text-lg mb-6 max-w-md">
              Connect directly with local farmers. Get the freshest produce delivered to your doorstep.
            </p>
            
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-600 
                       rounded-xl font-bold shadow-xl shadow-black/20
                       hover:bg-yellow-300 hover:text-primary-700 hover:shadow-yellow-500/30
                       transition-all duration-300 hover:-translate-y-1 active:scale-95 group/btn"
            >
              <span>Explore Products</span>
              <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl z-0" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0" />
      </div>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Featured Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked fresh produce from local farms</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold 
                     hover:text-primary-700 transition-all duration-300 group"
          >
            View All
            <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <FeaturedProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/products')}
          className="sm:hidden mt-6 w-full py-3 border-2 border-primary-500 text-primary-600 
                   rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300 active:scale-98"
        >
          View All Products
        </button>
      </section>

      {/* ============ SHOP BY CATEGORY ============ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Find exactly what you're looking for</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              image={category.image}
              count={category.count}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="bg-gradient-to-br from-primary-50 to-green-50 rounded-3xl p-8 lg:p-10 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Why Choose <span className="text-primary-600">GAUHATT</span>?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              emoji: '🌱', 
              title: 'Farm Fresh', 
              desc: 'Direct from local farms to your table. No middlemen, no delays.' 
            },
            { 
              emoji: '🚚', 
              title: 'Fast Delivery', 
              desc: 'Same-day delivery available for orders before 2 PM.' 
            },
            { 
              emoji: '💚', 
              title: 'Support Local', 
              desc: 'Every purchase supports local farmers and sustainable farming.' 
            },
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 text-center transition-all duration-300 
                       hover:shadow-lg hover:-translate-y-1 animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-4xl block mb-4 transition-transform duration-300 group-hover:scale-125">
                {item.emoji}
              </span>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
