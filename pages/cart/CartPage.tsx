import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag,
  Leaf,
  MapPin,
  Truck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import LocationPicker from '../../components/LocationPicker';
import { API_BASE_URL, DeliveryService, LocationUtils } from '../../services/api';
import { UserLocation, DeliveryFeeResponse, FarmerDeliveryInfo } from '../../types';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  farmName?: string;
  farmerId?: string;
  farmerLatitude?: number;
  farmerLongitude?: number;
  isOrganic?: boolean;
  distanceKm?: number;
  deliveryFee?: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryFeeResponse | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  useEffect(() => {
    loadCart();
    // Load saved location
    const saved = LocationUtils.getSavedLocation();
    if (saved) {
      setUserLocation(saved);
    }
  }, []);

  // Calculate delivery fees when cart or location changes
  useEffect(() => {
    if (userLocation && cartItems.length > 0) {
      calculateDeliveryFees();
    }
  }, [userLocation, cartItems.length]);

  const calculateDeliveryFees = async () => {
    if (!userLocation || cartItems.length === 0) return;
    
    setLoadingDelivery(true);
    try {
      const response = await DeliveryService.calculateFee({
        consumerLatitude: userLocation.latitude,
        consumerLongitude: userLocation.longitude,
        cartItems: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      });
      
      if (response.success && response.data) {
        setDeliveryInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to calculate delivery fees:', error);
      // Fallback to client-side calculation
      calculateDeliveryFeesClientSide();
    } finally {
      setLoadingDelivery(false);
    }
  };

  const calculateDeliveryFeesClientSide = () => {
    if (!userLocation) return;
    
    // Group by farmer and calculate delivery for each
    const farmerMap = new Map<string, { items: CartItem[], distance: number }>();
    
    cartItems.forEach(item => {
      const farmerId = item.farmerId || 'unknown';
      if (!farmerMap.has(farmerId)) {
        let distance = 0;
        if (item.farmerLatitude && item.farmerLongitude) {
          distance = LocationUtils.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.farmerLatitude,
            item.farmerLongitude
          );
        }
        farmerMap.set(farmerId, { items: [], distance });
      }
      farmerMap.get(farmerId)!.items.push(item);
    });

    const farmerDeliveries: FarmerDeliveryInfo[] = [];
    let totalFee = 0;
    let canDeliver = true;

    farmerMap.forEach((data, farmerId) => {
      const fee = LocationUtils.calculateDeliveryFee(data.distance);
      if (fee < 0) {
        canDeliver = false;
      } else {
        totalFee += fee;
        farmerDeliveries.push({
          farmerId,
          farmerName: data.items[0].farmName || 'Farm',
          distanceKm: Math.ceil(data.distance),
          deliveryFee: fee,
          productNames: data.items.map(i => i.name)
        });
      }
    });

    setDeliveryInfo({
      canDeliver,
      totalDeliveryFee: totalFee,
      farmerDeliveries,
      undeliverableProducts: [],
      message: canDeliver ? 'Delivery available' : 'Some items cannot be delivered'
    });
  };

  const handleLocationChange = (location: UserLocation | null) => {
    setUserLocation(location);
    if (!location) {
      setDeliveryInfo(null);
    }
  };

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
    // Dispatch custom event for navbar to update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = async (id: string, delta: number) => {
    setIsUpdating(id);
    
    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    saveCart(updatedCart);
    setIsUpdating(null);
  };

  const removeItem = async (id: string) => {
    setIsUpdating(id);
    
    // Animation delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const updatedCart = cartItems.filter(item => item.id !== id);
    saveCart(updatedCart);
    setIsUpdating(null);
  };

  const clearCart = () => {
    saveCart([]);
    setDeliveryInfo(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryInfo?.totalDeliveryFee ?? 0;
  const total = subtotal + deliveryFee;
  const canProceed = deliveryInfo?.canDeliver !== false;

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=200';
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </span>
              Your Cart
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 font-medium
                       flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50
                       transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center
                          animate-bounce-subtle">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Looks like you haven't added any products yet. Start exploring!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white 
                       rounded-xl font-semibold shadow-lg shadow-primary-500/30
                       hover:bg-primary-600 hover:shadow-primary-500/50 
                       transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                            transition-all duration-500 hover:shadow-lg hover:shadow-primary-500/5
                            hover:border-primary-100 group
                            ${isUpdating === item.id ? 'opacity-60 scale-[0.98]' : ''}`}
                  style={{ animationDelay: `${index * 80}ms`, animation: 'fadeInUp 0.5s ease-out backwards' }}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100
                                  ring-2 ring-transparent group-hover:ring-primary-100 transition-all duration-300">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {item.isOrganic && (
                        <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-green-500 rounded-full 
                                      flex items-center justify-center shadow-lg">
                          <Leaf className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 
                                       transition-colors duration-300">{item.name}</h3>
                          {item.farmName && (
                            <p className="text-sm text-gray-500 mt-0.5">{item.farmName}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                                   rounded-xl transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                                     text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-all duration-300 active:scale-90"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-gray-900 text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                                     text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600
                                     transition-all duration-300 active:scale-90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-600">₹{(item.price * item.quantity).toFixed(0)}</p>
                          <p className="text-xs text-gray-400">₹{item.price}/{item.unit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24
                            transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5">
                <h3 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h3>

                {/* Location Picker */}
                {!userLocation && (
                  <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Set your delivery location</p>
                        <p className="text-xs text-amber-600 mt-1">Required to calculate delivery fees</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <LocationPicker 
                        onLocationChange={handleLocationChange}
                        compact={true}
                        showSaveButton={false}
                      />
                    </div>
                  </div>
                )}

                {userLocation && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-700">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Location Set</span>
                      </div>
                      <LocationPicker 
                        onLocationChange={handleLocationChange}
                        compact={true}
                        showSaveButton={false}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium text-gray-900">NPR {subtotal.toFixed(0)}</span>
                  </div>

                  {/* Delivery Fee Breakdown */}
                  {loadingDelivery ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Calculating delivery...</span>
                    </div>
                  ) : deliveryInfo ? (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          <span>Delivery Fee</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          NPR {deliveryInfo.totalDeliveryFee.toFixed(0)}
                        </span>
                      </div>

                      {/* Delivery breakdown by farmer */}
                      {deliveryInfo.farmerDeliveries.length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-medium text-gray-500">Delivery by farm:</p>
                          {deliveryInfo.farmerDeliveries.map((farmer, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {farmer.farmName || farmer.farmerName} ({farmer.distanceKm}km)
                              </span>
                              <span className="text-gray-900">NPR {farmer.deliveryFee}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Undeliverable warning */}
                      {!deliveryInfo.canDeliver && deliveryInfo.undeliverableProducts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Cannot Deliver</p>
                              <p className="text-xs text-red-600 mt-1">
                                Some items are beyond 100km delivery limit:
                              </p>
                              <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                                {deliveryInfo.undeliverableProducts.map((p, idx) => (
                                  <li key={idx}>{p.productName} ({p.distanceKm}km)</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="text-gray-400 text-xs">Set location first</span>
                    </div>
                  )}

                  {/* Pricing info */}
                  <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl p-3 text-xs text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">📦 Delivery Pricing</p>
                    <p>NPR 50 per 10km (rounded up)</p>
                    <p className="text-gray-500">Max delivery: 100km</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span className="text-base">Total</span>
                      <span className="text-xl text-primary-600">NPR {total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={!canProceed || !userLocation}
                  className="w-full mt-6 py-3.5 bg-primary-500 text-white rounded-xl font-semibold
                           flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30
                           hover:bg-primary-600 hover:shadow-primary-500/50 hover:-translate-y-0.5
                           transition-all duration-300 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                {(!canProceed || !userLocation) && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {!userLocation 
                      ? 'Please set your delivery location first' 
                      : 'Remove items beyond 100km to proceed'}
                  </p>
                )}

                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-3 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                           hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
