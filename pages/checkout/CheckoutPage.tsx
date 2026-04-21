import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  CheckCircle, 
  ArrowLeft,
  Banknote,
  Package,
  Leaf,
  Loader2,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { API_BASE_URL, DeliveryService, LocationUtils, OrderService, getAuthToken, getCurrentUser, clearAuthData } from '../../services/api';
import { UserLocation, DeliveryFeeResponse, FarmerDeliveryInfo, CreateOrderRequest, CreateOrderItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
}

interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  landmark: string;
  notes: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryFeeResponse | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    landmark: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  useEffect(() => {
    // Check if user is logged in
    const token = getAuthToken();
    const user = getCurrentUser();
    
    if (!token || !user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }
    
    // Check if user is a Consumer
    if (user.role !== 'Consumer') {
      setOrderError(t('checkout.error.consumerOnly', 'Only consumers can place orders. Please log in with a consumer account.'));
      return;
    }
    
    if (!orderPlaced) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length === 0) {
        navigate('/cart');
        return;
      }
      setCartItems(cart);
    }
    
    // Load saved location
    const saved = LocationUtils.getSavedLocation();
    if (saved) {
      setUserLocation(saved);
    }

    // Pre-fill from user data if available
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: user.username || '',
        phone: user.phoneNumber || '',
      }));
    }
  }, [navigate, orderPlaced]);

  // Calculate delivery fees
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = t('checkout.error.fullNameRequired', 'Full name is required');
    }
    if (!form.phone.trim()) {
      newErrors.phone = t('checkout.error.phoneRequired', 'Phone number is required');
    } else if (!/^[0-9]{10}$/.test(form.phone.replace(/[- ]/g, ''))) {
      newErrors.phone = t('checkout.error.phoneInvalid', 'Enter a valid 10-digit phone number');
    }
    if (!form.address.trim()) {
      newErrors.address = t('checkout.error.addressRequired', 'Delivery address is required');
    }
    if (!form.city.trim()) {
      newErrors.city = t('checkout.error.cityRequired', 'City/District is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Prepare order items
      const orderItems: CreateOrderItem[] = cartItems.map(item => ({
        productId: item.id,
        farmerId: item.farmerId || '',
        name: item.name,
        imageUrl: item.imageUrl,
        farmName: item.farmName,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        distanceKm: item.distanceKm,
        deliveryFee: item.distanceKm ? Math.ceil(item.distanceKm / 10) * 50 : 0,
      }));

      const orderSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderDeliveryFee = deliveryInfo?.totalDeliveryFee ?? 0;

      const orderRequest: CreateOrderRequest = {
        items: orderItems,
        subtotal: orderSubtotal,
        deliveryFee: orderDeliveryFee,
        total: orderSubtotal + orderDeliveryFee,
        deliveryAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          landmark: form.landmark || undefined,
          notes: form.notes || undefined,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
        },
        paymentMethod: 'Cash on Delivery',
        deliveryDetails: deliveryInfo?.farmerDeliveries,
      };

      // Call the API to create order
      const response = await OrderService.create(orderRequest);

      if (response.success && response.data) {
        setOrderId(response.data.orderNumber);

        // Also save to localStorage for offline access
        const order = {
          orderId: response.data.orderNumber,
          date: new Date().toISOString(),
          status: 'pending',
          items: cartItems,
          subtotal: orderSubtotal,
          deliveryFee: orderDeliveryFee,
          total: orderSubtotal + orderDeliveryFee,
          deliveryDetails: deliveryInfo?.farmerDeliveries || [],
          deliveryAddress: {
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
            landmark: form.landmark,
            notes: form.notes,
            latitude: userLocation?.latitude,
            longitude: userLocation?.longitude,
          },
          paymentMethod: 'Cash on Delivery',
        };
        const currentUser = getCurrentUser();
        const ordersStorageKey = currentUser?.id ? `orders_${currentUser.id}` : 'orders';
        const existingOrders = JSON.parse(localStorage.getItem(ordersStorageKey) || '[]');
        localStorage.setItem(ordersStorageKey, JSON.stringify([order, ...existingOrders]));

        // Clear cart
        localStorage.setItem('cart', '[]');
        window.dispatchEvent(new Event('cartUpdated'));

        setOrderPlaced(true);
      } else {
        setOrderError(response.message || t('checkout.error.placeOrderFailed', 'Failed to place order. Please try again.'));
      }
    } catch (error: any) {
      console.error('Order submission error:', error);
      
      // Handle specific error codes
      if (error?.response?.status === 403) {
        // Token is invalid or role mismatch - clear auth and redirect to login
        clearAuthData();
        setOrderError(t('checkout.error.sessionExpired', 'Your session has expired. Please log in again.'));
        setTimeout(() => navigate('/login', { state: { returnTo: '/checkout' } }), 2000);
        return;
      }
      
      if (error?.response?.status === 401) {
        clearAuthData();
        setOrderError(t('checkout.error.loginRequired', 'Please log in to place an order.'));
        setTimeout(() => navigate('/login', { state: { returnTo: '/checkout' } }), 2000);
        return;
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || t('checkout.error.connectionFailed', 'Failed to place order. Please check your connection and try again.');
      setOrderError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryInfo?.totalDeliveryFee ?? 0;
  const total = subtotal + deliveryFee;
  const canProceed = deliveryInfo?.canDeliver !== false && userLocation !== null;

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=200';
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-20 pb-12">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 animate-scale-in">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center
                            animate-bounce-subtle">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout.success.title', 'Order Placed Successfully!')}</h1>
              <p className="text-gray-500 mb-6">
                {t('checkout.success.subtitle', "Thank you for your order. We'll contact you shortly to confirm.")}
              </p>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{t('checkout.success.orderId', 'Order ID')}</span>
                  <span className="font-mono font-bold text-primary-600">{orderId}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{t('checkout.success.paymentMethod', 'Payment Method')}</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <Banknote className="w-4 h-4 text-green-500" />
                    {t('checkout.cashOnDelivery', 'Cash on Delivery')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t('checkout.success.totalAmount', 'Total Amount')}</span>
                  <span className="font-bold text-lg text-gray-900">NPR {total}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">{t('checkout.success.includesDelivery', 'Includes delivery')}</span>
                    <span className="text-xs text-gray-600">NPR {deliveryFee}</span>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl mb-6">
                <Truck className="w-6 h-6 text-primary-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{t('checkout.success.estimatedDelivery', 'Estimated Delivery')}</p>
                  <p className="text-sm text-gray-500">{t('checkout.success.deliveryWindow', 'Within 24-48 hours')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/products')}
                  className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium
                           flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20
                           hover:bg-primary-600 transition-all duration-200 active:scale-[0.98]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t('checkout.success.continueShopping', 'Continue Shopping')}
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg font-medium
                           hover:bg-gray-50 transition-all duration-200"
                >
                  {t('checkout.success.goHome', 'Go to Home')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6
                      transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('checkout.backToCart', 'Back to Cart')}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  {t('checkout.deliveryDetails', 'Delivery Details')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('checkout.fullName', 'Full Name')} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleInputChange}
                        placeholder={t('checkout.fullNamePlaceholder', 'Enter your full name')}
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border bg-white
                                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                  transition-all duration-200
                                  ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('checkout.phoneNumber', 'Phone Number')} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder={t('checkout.phonePlaceholder', '10-digit phone number')}
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border bg-white
                                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                  transition-all duration-200
                                  ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('checkout.deliveryAddress', 'Delivery Address')} *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleInputChange}
                        placeholder={t('checkout.addressPlaceholder', 'House/Flat No., Street, Area')}
                        rows={3}
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border bg-white resize-none
                                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                  transition-all duration-200
                                  ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* City/District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('checkout.cityDistrict', 'City / District')} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      placeholder={t('checkout.cityPlaceholder', 'e.g., Kathmandu, Lalitpur')}
                      className={`w-full px-4 py-3 rounded-lg border bg-white
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                transition-all duration-200
                                ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('checkout.landmark', 'Landmark (Optional)')}
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={form.landmark}
                      onChange={handleInputChange}
                      placeholder={t('checkout.landmarkPlaceholder', 'Nearby landmark for easy delivery')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                transition-all duration-200"
                    />
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('checkout.deliveryNotes', 'Delivery Notes (Optional)')}
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleInputChange}
                      placeholder={t('checkout.notesPlaceholder', 'Any special instructions for delivery')}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white resize-none
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                transition-all duration-200"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-primary-500" />
                      {t('checkout.paymentMethod', 'Payment Method')}
                    </h3>
                    
                    {/* Cash on Delivery - Only Option */}
                    <div className="p-4 border-2 border-primary-500 bg-primary-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                          <div className="w-3 h-3 bg-primary-500 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">{t('checkout.cashOnDelivery', 'Cash on Delivery')}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {t('checkout.payOnDelivery', 'Pay when your order is delivered')}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-primary-500" />
                      </div>
                    </div>
                  </div>

                  {/* Order Error Display */}
                  {orderError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-700 font-medium">{t('checkout.orderFailed', 'Order Failed')}</p>
                        <p className="text-red-600 text-sm mt-1">{orderError}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button - Mobile Only */}
                  <div className="lg:hidden pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || !canProceed}
                      onClick={() => setOrderError(null)}
                      className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold
                               flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20
                               hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed
                               transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('checkout.placingOrder', 'Placing Order...')}
                        </>
                      ) : (
                        <>
                          <Package className="w-5 h-5" />
                          {t('checkout.placeOrder', 'Place Order')} - NPR {total}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">{t('checkout.orderSummary', 'Order Summary')}</h3>
                
                {/* Cart Items Preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">{t('checkout.qty', 'Qty')}: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">NPR {item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('checkout.subtotal', 'Subtotal')}</span>
                    <span>NPR {subtotal}</span>
                  </div>
                  
                  {/* Delivery Fee with breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        <span>{t('checkout.deliveryFee', 'Delivery Fee')}</span>
                      </div>
                      {loadingDelivery ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <span className="font-medium">NPR {deliveryFee}</span>
                      )}
                    </div>
                    
                    {/* Delivery breakdown by farmer */}
                    {deliveryInfo && deliveryInfo.farmerDeliveries.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-2.5 space-y-1.5">
                        <p className="text-xs font-medium text-gray-500">{t('checkout.breakdownByFarm', 'Breakdown by farm:')}</p>
                        {deliveryInfo.farmerDeliveries.map((farmer, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600 truncate max-w-[140px]">
                              {farmer.farmName || farmer.farmerName} ({farmer.distanceKm}km)
                            </span>
                            <span className="text-gray-900">NPR {farmer.deliveryFee}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cannot deliver warning */}
                    {deliveryInfo && !deliveryInfo.canDeliver && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-600">
                            {t('checkout.beyondLimit', 'Some items cannot be delivered (beyond 40km limit)')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>{t('checkout.total', 'Total')}</span>
                      <span className="text-lg">NPR {total}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('checkout.includingDelivery', 'Including delivery charges')}</p>
                  </div>
                </div>

                {/* Order Error Display - Desktop */}
                {orderError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{orderError}</p>
                  </div>
                )}

                {/* Submit Button - Desktop */}
                <button
                  type="button"
                  onClick={(e) => { setOrderError(null); handleSubmit(e); }}
                  disabled={isSubmitting || !canProceed}
                  className="hidden lg:flex w-full mt-6 py-3 bg-primary-500 text-white rounded-lg font-medium
                           items-center justify-center gap-2 shadow-lg shadow-primary-500/20
                           hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed
                           transition-all duration-200 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('checkout.placingOrder', 'Placing Order...')}
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      {t('checkout.placeOrder', 'Place Order')}
                    </>
                  )}
                </button>

                {!canProceed && (
                  <p className="text-xs text-center text-red-500 mt-2">
                    {!userLocation 
                      ? t('checkout.deliveryLocationRequired', 'Delivery location required')
                      : t('checkout.removeBeyondLimit', 'Remove items beyond 40km to proceed')}
                  </p>
                )}

                {/* Payment Info */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <Banknote className="w-4 h-4" />
                    <span className="font-medium">{t('checkout.cashOnDelivery', 'Cash on Delivery')}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {t('checkout.payOnReceive', 'Pay when you receive your order')}
                  </p>
                </div>

                {/* Delivery pricing info */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">📦 {t('checkout.deliveryPricing', 'Delivery Pricing')}</p>
                  <p className="text-xs text-gray-500">{t('checkout.deliveryPricingRule', 'NPR 50 per 10km (rounded up)')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
