import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, ShoppingCart, Heart, Leaf, X,
  Home, Compass, ShoppingBag, BellRing, LogOut, Check, MapPin, PackageOpen, Trash2, Star
} from 'lucide-react';
import { ProductService, OrderService, NotificationService, API_BASE_URL, clearAuthData } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import './ConsumerHome.css';

const MOCK_CATEGORIES = [
  { id: 'all', label: 'All', icon: <Compass size={18} /> },
  { id: 'veg', label: 'Vegetables', icon: <Leaf size={18} /> },
  { id: 'fruits', label: 'Fruits', icon: <Leaf size={18} /> },
  { id: 'dairy', label: 'Dairy & Eggs', icon: <Leaf size={18} /> },
  { id: 'baked', label: 'Baked Goods', icon: <BreadIcon size={18} /> },
  { id: 'pantry', label: 'Pantry', icon: <ShoppingBag size={18} /> },
  { id: 'crafts', label: 'Handmade Crafts', icon: <Heart size={18} /> },
  { id: 'floral', label: 'Floral & Plants', icon: <Leaf size={18} /> }
];

function BreadIcon({size}: {size: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h12M6 14h12M6 10h12M12 2v2M4 7c0-2.8 2.2-5 5-5h6c2.8 0 5 2.2 5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/></svg>;
}

export default function HomePage() {
  const navigate = useNavigate();
   const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('home');
  const [activeCat, setActiveCat] = useState('all');
  const [radius, setRadius] = useState(5);
  
  // Real App States
  const [products, setProducts] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [bumpCart, setBounceCart] = useState(false);
  const [search, setSearch] = useState('');
   const [exploreCategory, setExploreCategory] = useState('all');
   const [exploreOrganicOnly, setExploreOrganicOnly] = useState(false);
   const [exploreMinPrice, setExploreMinPrice] = useState('');
   const [exploreMaxPrice, setExploreMaxPrice] = useState('');
   const [exploreSortBy, setExploreSortBy] = useState('nearest');

  // 1. Fetch Products
  useEffect(() => {
    setLoading(true);
    ProductService.getAll()
      .then(res => {
         if (res.data && res.data.products) {
            const mapped = res.data.products.map(p => {
               let finalImg = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80';
               if (p.imageUrl) {
                 finalImg = p.imageUrl.startsWith('http') ? p.imageUrl : `${API_BASE_URL}${p.imageUrl.startsWith('/') ? '' : '/'}${p.imageUrl}`;
               }
               return {
                 ...p, // keep original keys for cart
                 id: p.id,
                 name: p.name,
                 farm: p.farmName || p.farmerName || 'Local Farm',
                 priceStr: `Rs. ${p.price.toFixed(2)}/${p.unit || 'ea'}`,
                 dist: typeof p.distanceKm === 'number' ? `${p.distanceKm.toFixed(1)}km` : 'Distance N/A',
                 isOrganic: p.isOrganic,
                 img: finalImg,
                 cat: p.category ? p.category.toLowerCase() : 'veg', rating: p.averageRating || 0, reviewCount: p.totalRatings || 0
               };
            });
            setProducts(mapped);
         }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. Fetch / Sync Cart
  const loadCart = () => {
    const raw = localStorage.getItem('cart');
    setCartItems(raw ? JSON.parse(raw) : []);
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  // 3. Fetch Orders & Notifications on Tab Change
  useEffect(() => {
    if (activeNav === 'orders') {
       OrderService.getMyOrders().then(res => {
         if (res.data) setOrders(res.data);
       }).catch(console.error);
    }
    if (activeNav === 'notifications') {
       NotificationService.getNotifications().then(res => {
         if (res.data && res.data.notifications) setNotifications(res.data.notifications);
       }).catch(console.error);
    }
  }, [activeNav]);

  const handleAddToCart = (product: any) => {
    const currentCart = [...cartItems];
    const existingIndex = currentCart.findIndex(i => i.id === product.id);
    
    if (existingIndex >= 0) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || 'ea',
        quantity: 1,
        imageUrl: product.img,
        farmerId: product.farmerId || '',
        farmName: product.farm,
          isOrganic: product.isOrganic,
          dist: product.dist
        });
      }

      localStorage.setItem('cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('cartUpdated'));

      setBounceCart(true);
      setTimeout(() => setBounceCart(false), 300);
    };

  const handleRemoveFromCart = (id: string) => {
     const newCart = cartItems.filter(i => i.id !== id);
     localStorage.setItem('cart', JSON.stringify(newCart));
     window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleLogout = () => {
     clearAuthData();
     navigate('/login');
  };

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
   const localizedCategories = MOCK_CATEGORIES.map((category) => {
      const labelsById: Record<string, string> = {
         all: language === 'ne' ? 'सबै' : 'All',
         veg: t('category.vegetables', 'Vegetables'),
         fruits: t('category.fruits', 'Fruits'),
         dairy: t('category.dairyEggs', 'Dairy & Eggs'),
         baked: t('category.bakedGoods', 'Baked Goods'),
         pantry: t('category.pantry', 'Pantry'),
         crafts: t('category.handmadeCrafts', 'Handmade Crafts'),
         floral: t('category.floralPlants', 'Floral & Plants'),
      };

      return {
         ...category,
         label: labelsById[category.id] || category.label,
      };
   });

  const filteredProducts = products.filter(p => (activeCat === 'all' || p.cat === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));
  const exploreRadiusKm = Math.min(5, radius);
  const parseDistanceKm = (distanceValue: unknown): number | null => {
    if (typeof distanceValue === 'number' && Number.isFinite(distanceValue)) {
      return distanceValue;
    }

    return null;
  };
  const nearbyProducts = products.filter((p) => {
    const distanceKm = parseDistanceKm(p.distanceKm);
    return distanceKm !== null && distanceKm <= exploreRadiusKm;
  });

   const exploreCategorySet = new Set<string>(
      nearbyProducts.map((p) => String(p.cat || '').trim().toLowerCase()).filter(Boolean)
   );
   const exploreCategoryOptions = Array.from(exploreCategorySet).sort();
   const minPriceValue = exploreMinPrice === '' ? null : Number(exploreMinPrice);
   const maxPriceValue = exploreMaxPrice === '' ? null : Number(exploreMaxPrice);

   const exploreFilteredProducts = nearbyProducts
      .filter((p) => {
         if (exploreCategory !== 'all' && p.cat !== exploreCategory) return false;
         if (exploreOrganicOnly && !p.isOrganic) return false;
         if (minPriceValue !== null && Number.isFinite(minPriceValue) && p.price < minPriceValue) return false;
         if (maxPriceValue !== null && Number.isFinite(maxPriceValue) && p.price > maxPriceValue) return false;
         if (search && !String(p.name || '').toLowerCase().includes(search.toLowerCase())) return false;
         return true;
      })
      .sort((a, b) => {
         const distA = parseDistanceKm(a.distanceKm) ?? Number.MAX_SAFE_INTEGER;
         const distB = parseDistanceKm(b.distanceKm) ?? Number.MAX_SAFE_INTEGER;

         if (exploreSortBy === 'priceAsc') return a.price - b.price;
         if (exploreSortBy === 'priceDesc') return b.price - a.price;
         if (exploreSortBy === 'ratingDesc') return (b.rating || 0) - (a.rating || 0);
         return distA - distB;
      });

   const resetExploreFilters = () => {
      setExploreCategory('all');
      setExploreOrganicOnly(false);
      setExploreMinPrice('');
      setExploreMaxPrice('');
      setExploreSortBy('nearest');
   };

  return (
    <div className="gh-home">
      <aside className="gh-sidebar">
        <div className="gh-logo">
          <Leaf color="var(--color-primary)" />
          GAUHATT
        </div>
        
        {loading ? (
          <div style={{paddingTop: 16}}>
             {[1,2,3,4,5].map(i => <div key={i} className="gh-skel gh-skel-sidebar-item"></div>)}
          </div>
        ) : (
          <ul className="gh-nav-list">
            <li className={`gh-nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => setActiveNav('home')}>
                     <Home size={20} /> {t('nav.home', 'Home')}
            </li>
            <li className={`gh-nav-item ${activeNav === 'explore' ? 'active' : ''}`} onClick={() => setActiveNav('explore')}>
                     <Compass size={20} /> {t('nav.explore', 'Explore')}
            </li>
            <li className={`gh-nav-item ${activeNav === 'orders' ? 'active' : ''}`} onClick={() => setActiveNav('orders')}>
                     <ShoppingBag size={20} /> {t('nav.orders', 'My Orders')}
            </li>
            <li className={`gh-nav-item ${activeNav === 'cart' ? 'active' : ''}`} onClick={() => setActiveNav('cart')}>
                     <ShoppingCart size={20} /> {t('nav.cart', 'Cart')}
              <span className={`gh-nav-badge ${bumpCart ? 'bounce' : ''}`}>{cartCount}</span>
            </li>
            <li className={`gh-nav-item ${activeNav === 'notifications' ? 'active' : ''}`} onClick={() => setActiveNav('notifications')}>
                     <BellRing size={20} /> {t('nav.notifications', 'Notifications')}
            </li>
          </ul>
        )}
        
        {!loading && (
          <div className="gh-slider-box">
             <div className="gh-slider-label">
                <span>{t('sidebar.deliveryRadius', 'Delivery Radius')}</span>
                <span style={{color: 'var(--color-primary)'}}>{radius} km</span>
             </div>
             <input type="range" min="1" max="5" value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))} className="gh-slider" />
          </div>
        )}
        
        <div className="gh-logout gh-nav-item" onClick={handleLogout}>
           <LogOut size={20}/> {t('auth.logout', 'Logout')}
        </div>
      </aside>

      <main className="gh-main">
        <header className="gh-header">
           <div className="gh-search">
              <Search className="gh-search-icon" size={18} />
              <input 
                type="text" 
                        placeholder={t('home.searchFarmsProducts', 'Search farms, products...')} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <X className="gh-search-icon" style={{left: 'auto', right: 12, cursor:'pointer'}} size={18} onClick={() => setSearch('')}/>}
           </div>
           
           <div className="gh-header-actions">
              <button className={`gh-icon-btn ${activeNav === 'notifications' ? 'active-icon' : ''}`} onClick={() => setActiveNav('notifications')}>
                 <Bell size={20} />
                 <div className="gh-dot"></div>
              </button>
              <button className={`gh-icon-btn ${activeNav === 'cart' ? 'active-icon' : ''}`} style={{position:'relative'}} onClick={() => setActiveNav('cart')}>
                 <ShoppingCart size={20} />
                 <span className={`gh-nav-badge ${bumpCart ? 'bounce' : ''}`} style={{position:'absolute', top:-4, right:-8}}>{cartCount}</span>
              </button>
              <div className="gh-user-avatar">ME</div>
           </div>
        </header>

        <div className="gh-content">
           {activeNav === 'home' && (
             <>
               {loading ? (
                 <div className="gh-skel gh-skel-hero"></div>
               ) : (
                 <section className="gh-hero">
                    <div className="gh-hero-text">
                       <div className="gh-hero-chip">✦ {t('home.freshFromLocalFarms', 'Fresh from Local Farms')}</div>
                       <h1>{language === 'ne' ? 'फार्मको ताजा उत्पादन,' : 'Farm Fresh,'}<br/>{language === 'ne' ? 'दैनिक डेलिभरी' : 'Delivered Daily'}</h1>
                       <p>{t('home.heroDescription', 'Experience the finest organic produce, dairy, and artisanal goods, sourced directly from farmers within your community.')}</p>
                    </div>
                    <div className="gh-hero-graphics">
                       <div className="gh-orb gh-orb-1"></div>
                       <div className="gh-orb gh-orb-2"></div>
                    </div>
                 </section>
               )}

               {loading ? (
                 <div style={{display:'flex', gap:16, marginBottom: 40, overflow:'hidden'}}>
                    {[1,2,3,4,5,6].map(i => <div key={i} className="gh-skel" style={{minWidth:120, height:42, borderRadius:20}}></div>)}
                 </div>
               ) : (
                 <div className="gh-cat-strip">
                              {localizedCategories.map(c => (
                      <div 
                        key={c.id} 
                        className={`gh-cat-chip ${activeCat === c.id ? 'active' : ''}`}
                        onClick={() => setActiveCat(c.id)}
                      >
                         {c.icon} {c.label}
                      </div>
                    ))}
                 </div>
               )}

               <div className="gh-section-header">
                  <div>
                     <h2>{t('home.featuredProducts', 'Featured Products')}</h2>
                     <p>{t('home.handpickedForYou', 'Handpicked selections tailored for you')}</p>
                  </div>
               </div>

               <div className="gh-grid">
                  {loading ? (
                     [1,2,3,4,5,6].map(i => (
                       <div key={i} className="gh-skel gh-skel-card">
                          <div className="gh-skel-card-img"></div>
                          <div className="gh-skel-card-body">
                             <div className="gh-skel-line w-3-4"></div>
                             <div className="gh-skel-line w-1-2"></div>
                             <div className="gh-skel-line price"></div>
                          </div>
                       </div>
                     ))
                  ) : filteredProducts.length > 0 ? (
                     filteredProducts.map((p, idx) => (
                        <ProductCard key={p.id} p={p} index={idx} onAdd={() => handleAddToCart(p)} onOpenDetails={() => navigate(`/products/${p.id}`)} />
                     ))
                  ) : (
                     <div style={{gridColumn: '1 / -1', textAlign:'center', padding:40, color:'var(--color-gray)'}}>
                        {t('home.noProductsMatch', 'No products match your filters.')}
                     </div>
                  )}
               </div>
             </>
           )}

           {activeNav === 'explore' && (
              <>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
                       <h2 style={{fontFamily:'var(--font-serif)', color:'var(--color-primary)', fontSize:'2rem', margin:0}}>{t('home.exploreNearby', 'Explore Nearby')}</h2>
                 </div>

                         <div className="gh-explore-filters">
                              <div className="gh-explore-filter-item">
                                 <label>{t('home.category', 'Category')}</label>
                                 <select value={exploreCategory} onChange={(e) => setExploreCategory(e.target.value)}>
                                    <option value="all">All</option>
                                    {exploreCategoryOptions.map((category) => (
                                       <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                                    ))}
                                 </select>
                              </div>

                              <div className="gh-explore-filter-item">
                                 <label>{t('home.minPriceRs', 'Min Price (Rs)')}</label>
                                 <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={exploreMinPrice}
                                    onChange={(e) => setExploreMinPrice(e.target.value)}
                                 />
                              </div>

                              <div className="gh-explore-filter-item">
                                 <label>{t('home.maxPriceRs', 'Max Price (Rs)')}</label>
                                 <input
                                    type="number"
                                    min="0"
                                    placeholder="Any"
                                    value={exploreMaxPrice}
                                    onChange={(e) => setExploreMaxPrice(e.target.value)}
                                 />
                              </div>

                              <div className="gh-explore-filter-item">
                                 <label>{t('home.sortBy', 'Sort By')}</label>
                                 <select value={exploreSortBy} onChange={(e) => setExploreSortBy(e.target.value)}>
                                    <option value="nearest">Nearest</option>
                                    <option value="priceAsc">Price: Low to High</option>
                                    <option value="priceDesc">Price: High to Low</option>
                                    <option value="ratingDesc">Top Rated</option>
                                 </select>
                              </div>

                              <div className="gh-explore-filter-toggle">
                                 <input
                                    id="organic-only"
                                    type="checkbox"
                                    checked={exploreOrganicOnly}
                                    onChange={(e) => setExploreOrganicOnly(e.target.checked)}
                                 />
                                 <label htmlFor="organic-only">{t('home.organicOnly', 'Organic only')}</label>
                              </div>

                              <button type="button" className="gh-explore-reset" onClick={resetExploreFilters}>
                                 {t('home.reset', 'Reset')}
                              </button>
                         </div>

                 <div className="gh-grid">
                              {exploreFilteredProducts.length > 0 ? (
                                   exploreFilteredProducts.map((p, idx) => (
                                <ProductCard key={p.id} p={p} index={idx} onAdd={() => handleAddToCart(p)} onOpenDetails={() => navigate(`/products/${p.id}`)} />
                       ))
                    ) : (
                       <div style={{gridColumn: '1 / -1', textAlign:'center', padding:40, color:'var(--color-gray)'}}>
                          <Compass size={48} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: 16 }} />
                                       <h3>{t('home.noExploreResults', 'No products match your explore filters.')}</h3>
                                       <p>{t('home.tryAdjustFilters', 'Try changing category, price, or organic filter.')}</p>
                       </div>
                    )}
                 </div>
              </>
           )}

           {activeNav === 'orders' && (
              <div className="gh-list-view">
                 <h2 style={{fontFamily:'var(--font-serif)', color:'var(--color-primary)', fontSize:'2rem', marginBottom: 24}}>{t('nav.orders', 'My Orders')}</h2>
                 {orders.length === 0 ? (
                    <div className="gh-placeholder-view" style={{minHeight:'40vh', padding:0, boxShadow:'none'}}>
                       <PackageOpen size={48} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: 16 }} />
                       <h3>{t('home.noActiveOrders', 'No active orders')}</h3>
                       <p>{t('home.noRecentOrders', "You haven't ordered anything recently.")}</p>
                       <button className="gh-hero-btn" onClick={() => setActiveNav('home')} style={{ marginTop: 24 }}>{t('home.startShopping', 'Start Shopping')}</button>
                    </div>
                 ) : (
                    orders.map((o: any) => (
                       <div key={o.id} className="gh-list-item">
                           <div style={{flex:1}}>
                              <h4>Order #{o.orderNumber || o.id.substring(0,8)}</h4>
                              <p style={{fontSize:'0.9rem', color:'var(--color-gray)', marginTop:4}}>{new Date(o.orderDate).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-IN')}</p>
                           </div>
                           <div style={{fontWeight:'bold', color:'var(--color-primary)'}}>Rs. {o.totalAmount?.toFixed(2) || '0.00'}</div>
                           <div className={`gh-badge-org`} style={{marginLeft: 16}}>{o.status}</div>
                       </div>
                    ))
                 )}
              </div>
           )}

           {activeNav === 'cart' && (
              <div className="gh-list-view">
                 <h2 style={{fontFamily:'var(--font-serif)', color:'var(--color-primary)', fontSize:'2rem', marginBottom: 24}}>{t('home.shoppingCart', 'Shopping Cart')}</h2>
                 {cartItems.length === 0 ? (
                    <div className="gh-placeholder-view" style={{minHeight:'40vh', padding:0, boxShadow:'none'}}>
                       <ShoppingCart size={48} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: 16 }} />
                       <h3>{t('home.cartIsEmpty', 'Cart is empty')}</h3>
                       <button className="gh-hero-btn" onClick={() => setActiveNav('home')} style={{ marginTop: 24 }}>{t('home.startShopping', 'Start Shopping')}</button>
                    </div>
                 ) : (
                    <div style={{display:'flex', gap:24, alignItems:'flex-start'}}>
                       <div style={{flex:2}}>
                          {cartItems.map((item: any) => (
                             <div key={item.id} className="gh-list-item">
                                <img src={item.imageUrl} alt={item.name} style={{width: 60, height: 60, borderRadius: 8, objectFit:'cover', marginRight: 16}} />
                                <div style={{flex: 1}}>
                                   <h4 style={{fontWeight:600}}>{item.name}</h4>
                                     <div style={{color:'var(--color-gray)', fontSize:'0.9rem'}}>
                                        {item.farmName}
                                        {item.dist && (
                                           <span style={{marginLeft: 8, fontSize: '0.8rem', background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 4}}>
                                              <MapPin size={10} style={{display:'inline', marginRight:2}}/>
                                              {item.dist}
                                           </span>
                                        )}
                                     </div>
                                </div>
                                <div style={{marginRight: 24, fontWeight: 'bold'}}>Rs. {item.price.toFixed(2)} x {item.quantity}</div>
                                <button className="gh-icon-btn" onClick={() => handleRemoveFromCart(item.id)}>
                                   <Trash2 size={16} color="red"/>
                                </button>
                             </div>
                          ))}
                       </div>
                       <div style={{flex:1, background:'white', padding:24, borderRadius:16, boxShadow:'0 4px 12px rgba(0,0,0,0.03)'}}>
                          <h3 style={{marginBottom:16}}>{t('home.summary', 'Summary')}</h3>
                          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12, color:'var(--color-gray)'}}>
                             <span>{t('home.subtotal', 'Subtotal')}</span>
                             <span>Rs. {cartTotal.toFixed(2)}</span>
                          </div>
                          <div style={{display:'flex', justifyContent:'space-between', marginBottom:16, color:'var(--color-gray)'}}>
                             <span>{t('home.delivery', 'Delivery')}</span>
                             <span>{t('home.calculatedAtCheckout', 'Calculated at checkout')}</span>
                          </div>
                          <hr style={{border:'none', borderTop:'1px solid var(--color-bg)', margin:'16px 0'}}/>
                          <div style={{display:'flex', justifyContent:'space-between', marginBottom:24, fontWeight:'bold', fontSize:'1.2rem', color:'var(--color-primary)'}}>
                             <span>{t('home.total', 'Total')}</span>
                             <span>Rs. {cartTotal.toFixed(2)}</span>
                          </div>
                          <button className="gh-hero-btn" style={{width:'100%'}} onClick={() => navigate('/checkout')}>{t('home.proceedToCheckout', 'Proceed to Checkout')}</button>
                       </div>
                    </div>
                 )}
              </div>
           )}
           
           {activeNav === 'notifications' && (
              <div className="gh-list-view">
                 <h2 style={{fontFamily:'var(--font-serif)', color:'var(--color-primary)', fontSize:'2rem', marginBottom: 24}}>{t('nav.notifications', 'Notifications')}</h2>
                 {notifications.length === 0 ? (
                    <div className="gh-placeholder-view" style={{minHeight:'40vh', padding:0, boxShadow:'none'}}>
                       <BellRing size={48} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: 16 }} />
                       <h3>{t('home.allCaughtUp', "You're all caught up!")}</h3>
                       <p>{t('home.noNotifications', 'No new notifications right now.')}</p>
                    </div>
                 ) : (
                    notifications.map((n: any) => (
                       <div key={n.id} className="gh-list-item" style={{alignItems:'flex-start'}}>
                          <div style={{width:8, height:8, borderRadius:'50%', background:'var(--color-primary)', marginTop:8, marginRight:16}}></div>
                          <div>
                             <h4 style={{fontWeight:600}}>{n.title}</h4>
                             <p style={{color:'var(--color-gray)', fontSize:'0.9rem', marginTop:4}}>{n.message}</p>
                             <small style={{color:'var(--color-gray)', fontSize:'0.8rem', marginTop:8, display:'block'}}>{new Date(n.createdAt).toLocaleString(language === 'ne' ? 'ne-NP' : 'en-IN')}</small>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           )}
        </div>
      </main>
    </div>
  );
}

function ProductCard({ p, index, onAdd, onOpenDetails }: { key?: React.Key, p: any, index: number, onAdd: () => void, onOpenDetails: () => void }) {
  const [fav, setFav] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
   const [showRatingModal, setShowRatingModal] = useState(false);
   const [selectedRating, setSelectedRating] = useState<number>(p.userRating || 0);
   const [hoverRating, setHoverRating] = useState(0);
   const [reviewText, setReviewText] = useState('');
   const [ratingLoading, setRatingLoading] = useState(false);
   const [ratingError, setRatingError] = useState('');
   const [ratingSuccess, setRatingSuccess] = useState('');
   const [displayRating, setDisplayRating] = useState<number>(p.rating || 0);
   const [displayReviewCount, setDisplayReviewCount] = useState<number>(p.reviewCount || 0);
   const [hasUserRated, setHasUserRated] = useState<boolean>(Boolean(p.userRating));

   useEffect(() => {
      setDisplayRating(p.rating || 0);
      setDisplayReviewCount(p.reviewCount || 0);
      setHasUserRated(Boolean(p.userRating));
      setSelectedRating(p.userRating || 0);
   }, [p.rating, p.reviewCount, p.userRating]);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      onAdd();
      setTimeout(() => setAdded(false), 1500);
    }, 600);
  };

   const openRatingModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedRating(p.userRating || Math.max(1, Math.round(displayRating)));
      setHoverRating(0);
      setReviewText('');
      setRatingError('');
      setRatingSuccess('');
      setShowRatingModal(true);
   };

   const submitRating = async () => {
      if (selectedRating < 1 || selectedRating > 5) {
         setRatingError('Please choose a rating between 1 and 5 stars.');
         return;
      }

      setRatingLoading(true);
      setRatingError('');

      try {
         const response = await ProductService.rateProduct(p.id, selectedRating, reviewText.trim() || undefined);
         if (!response.success) {
            setRatingError(response.message || 'Unable to submit rating right now.');
            return;
         }

         setHasUserRated(true);
         const summaryResponse = await ProductService.getProductRatingSummary(p.id);

         if (summaryResponse.success && summaryResponse.data) {
            setDisplayRating(summaryResponse.data.averageRating);
            setDisplayReviewCount(summaryResponse.data.totalRatings);
         } else {
            const nextReviewCount = hasUserRated ? displayReviewCount : displayReviewCount + 1;
            const nextAverage = hasUserRated
               ? selectedRating
               : ((displayRating * displayReviewCount) + selectedRating) / Math.max(nextReviewCount, 1);
            setDisplayReviewCount(nextReviewCount);
            setDisplayRating(nextAverage);
         }

         setRatingSuccess('Thanks for rating this product!');
         setTimeout(() => {
            setShowRatingModal(false);
            setRatingSuccess('');
         }, 700);
      } catch (error: any) {
         const apiError = error?.response?.data?.message;
         setRatingError(apiError || 'Could not submit your rating. Please try again.');
      } finally {
         setRatingLoading(false);
      }
   };

  return (
      <>
      <div className="gh-card" style={{ animationDelay: `${index * 60}ms` }} onClick={onOpenDetails}>
       <div className="gh-card-img-wrap">
          <img src={p.img} alt={p.name} className="gh-card-img" loading="lazy" />
          <div className="gh-badges">
             <span className="gh-badge-dist"><MapPin size={10} style={{display:'inline', marginRight:2, marginTop:-2}}/> {p.dist}</span>
             {p.isOrganic && <span className="gh-badge-org">Organic</span>}
          </div>
          <button 
             className={`gh-fav-btn ${fav ? 'active' : ''}`} 
             onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
          >
             <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
          </button>
       </div>
       <div className="gh-card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <h3 className="gh-card-title" style={{ flex: 1, paddingRight: 8, margin: 0, lineHeight: 1.2 }}>{p.name}</h3>
             <div style={{ display: 'flex', alignItems: 'center', color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>
                <Star size={14} fill="currentColor" stroke="none" style={{marginRight: 4}}/> 
                {(displayRating || 0).toFixed(1)} <span style={{color:'var(--color-text-muted)', marginLeft: 4, fontWeight: 500, fontSize: '12px'}}>({displayReviewCount || 0})</span>
                <button 
                   onClick={openRatingModal}
                   style={{background:'none', border:'none', color:'var(--color-primary)', fontSize:'12px', cursor:'pointer', marginLeft: 6, textDecoration:'underline', padding: 0}}
                >{hasUserRated ? t('home.update', 'Update') : t('home.rate', 'Rate')}</button>
             </div>
          </div>
          <p className="gh-card-farm" style={{ margin: '4px 0 0 0' }}>{p.farm}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
             <div className="gh-card-price">{p.priceStr}</div>
             <button 
                className={`gh-add-btn ${added ? 'success' : ''}`} 
                onClick={handleAddClick}
                disabled={adding || added}
                style={{ flex: 'none', width: 'auto', padding: '8px 16px' }}
             >
                {adding ? <div className="gh-spinner"></div> : added ? <Check size={16}/> : '+ Add'}
             </button>
          </div>
       </div>
    </div>
      {showRatingModal && (
         <div className="gh-rating-modal-backdrop" onClick={() => setShowRatingModal(false)}>
            <div className="gh-rating-modal" onClick={(e) => e.stopPropagation()}>
               <div className="gh-rating-modal-header">
                  <h3>Rate {p.name}</h3>
                  <button className="gh-rating-close" onClick={() => setShowRatingModal(false)} aria-label="Close rating modal">
                     <X size={16} />
                  </button>
               </div>

               <p className="gh-rating-helper">Tell others how this product was for you.</p>

               <div className="gh-rating-stars">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                     <button
                        key={starValue}
                        type="button"
                        className={`gh-rating-star ${starValue <= (hoverRating || selectedRating) ? 'active' : ''}`}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setSelectedRating(starValue)}
                        aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                     >
                        <Star size={24} fill="currentColor" stroke="none" />
                     </button>
                  ))}
               </div>

               <textarea
                  className="gh-rating-review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                  placeholder="Optional: share your quick review"
                  rows={4}
               />

               <div className="gh-rating-footer-row">
                  <span className="gh-rating-char-count">{reviewText.length}/500</span>
                  {ratingError && <span className="gh-rating-error">{ratingError}</span>}
                  {ratingSuccess && <span className="gh-rating-success">{ratingSuccess}</span>}
               </div>

               <div className="gh-rating-actions">
                  <button type="button" className="gh-rating-cancel" onClick={() => setShowRatingModal(false)}>
                     Cancel
                  </button>
                  <button type="button" className="gh-rating-submit" disabled={ratingLoading} onClick={submitRating}>
                     {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                  </button>
               </div>
            </div>
         </div>
      )}
      </>
  );
}

