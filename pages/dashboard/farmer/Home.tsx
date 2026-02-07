import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  BookOpen, 
  ArrowUpRight,
  ChevronRight,
  TrendingDown,
  MapPin,
  Users,
  Sparkles,
  Crown,
  Star,
  Zap,
  ShoppingCart
} from 'lucide-react';
import { getCurrentUser, OrderService } from '../../../services/api';
import { FarmerOrder } from '../../../types';

// Animated counter hook with spring effect
const useAnimatedCounter = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Spring easing for bouncy effect
      const easeOutBack = 1 + 2.70158 * Math.pow(progress - 1, 3) + 1.70158 * Math.pow(progress - 1, 2);
      const easedProgress = Math.min(easeOutBack, 1);
      setCount(Math.floor(easedProgress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
};

// Ripple effect hook
const useRipple = () => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  
  const addRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };
  
  return { ripples, addRipple };
};

// Progress bar component with animation
const AnimatedProgress: React.FC<{ value: number; max: number; color: string; delay?: number }> = ({ value, max, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth((value / max) * 100);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, max, delay]);
  
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

// Line Chart Component - Clean Minimal Design
interface LineChartProps {
  salesData: number[];
  ordersData: number[];
  months: string[];
}

const LineChart: React.FC<LineChartProps> = ({ salesData, ordersData, months }) => {
  const [animate, setAnimate] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ type: 'sales' | 'orders'; index: number } | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxSales = Math.max(...salesData, 1);
  const maxOrders = Math.max(...ordersData, 1);
  
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = { top: 20, right: 50, bottom: 40, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  // Calculate point positions
  const getX = (index: number) => padding.left + (index / Math.max(months.length - 1, 1)) * innerWidth;
  const getSalesY = (value: number) => padding.top + innerHeight - (value / maxSales) * innerHeight;
  const getOrdersY = (value: number) => padding.top + innerHeight - (value / maxOrders) * innerHeight;
  
  // Create smooth curve path using catmull-rom
  const createPath = (data: number[], getY: (v: number) => number) => {
    if (data.length === 0) return '';
    if (data.length === 1) return `M ${getX(0)} ${getY(data[0])}`;
    
    const points = data.map((v, i) => ({ x: getX(i), y: getY(v) }));
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  // Format currency
  const formatCurrency = (val: number) => {
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${Math.round(val)}`;
  };

  const salesPath = createPath(salesData, getSalesY);
  const ordersPath = createPath(ordersData, getOrdersY);

  return (
    <div className="relative select-none">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: '240px' }}
      >
        <defs>
          <linearGradient id="salesAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ordersAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + innerHeight * (1 - ratio);
          return (
            <g key={`grid-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                style={{
                  opacity: animate ? 1 : 0,
                  transition: `opacity 0.5s ease ${i * 0.05}s`
                }}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-gray-400"
                style={{
                  opacity: animate ? 1 : 0,
                  transition: `opacity 0.5s ease ${i * 0.05}s`
                }}
              >
                {formatCurrency(maxSales * ratio)}
              </text>
              <text
                x={chartWidth - padding.right + 8}
                y={y + 4}
                textAnchor="start"
                className="text-[10px] fill-gray-400"
                style={{
                  opacity: animate ? 1 : 0,
                  transition: `opacity 0.5s ease ${i * 0.05}s`
                }}
              >
                {Math.round(maxOrders * ratio)}
              </text>
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {months.map((month, i) => (
          <text
            key={month}
            x={getX(i)}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-[11px] fill-gray-500 font-medium"
            style={{
              opacity: animate ? 1 : 0,
              transition: `opacity 0.5s ease ${0.3 + i * 0.05}s`
            }}
          >
            {month}
          </text>
        ))}
        
        {/* Sales area fill */}
        <path
          d={`${salesPath} L ${getX(salesData.length - 1)} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`}
          fill="url(#salesAreaGradient)"
          style={{
            opacity: animate ? 1 : 0,
            transition: 'opacity 0.8s ease 0.2s'
          }}
        />
        
        {/* Orders area fill */}
        <path
          d={`${ordersPath} L ${getX(ordersData.length - 1)} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`}
          fill="url(#ordersAreaGradient)"
          style={{
            opacity: animate ? 1 : 0,
            transition: 'opacity 0.8s ease 0.3s'
          }}
        />
        
        {/* Sales line */}
        <path
          d={salesPath}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: animate ? 0 : 1000,
            transition: 'stroke-dashoffset 1.5s ease-out 0.2s'
          }}
        />
        
        {/* Orders line */}
        <path
          d={ordersPath}
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: animate ? 0 : 1000,
            transition: 'stroke-dashoffset 1.5s ease-out 0.4s'
          }}
        />
        
        {/* Sales data points */}
        {salesData.map((value, i) => {
          const x = getX(i);
          const y = getSalesY(value);
          const isHovered = hoveredPoint?.type === 'sales' && hoveredPoint?.index === i;
          return (
            <g key={`sales-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3}
                fill="white"
                stroke="#22c55e"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: animate ? 1 : 0,
                  transition: `opacity 0.3s ease ${0.8 + i * 0.08}s, r 0.2s ease`
                }}
                onMouseEnter={() => setHoveredPoint({ type: 'sales', index: i })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 35}
                    y={y - 42}
                    width="70"
                    height="28"
                    rx="4"
                    fill="#1f2937"
                    className="drop-shadow-lg"
                  />
                  <polygon
                    points={`${x - 5},${y - 14} ${x + 5},${y - 14} ${x},${y - 8}`}
                    fill="#1f2937"
                  />
                  <text x={x} y={y - 28} textAnchor="middle" className="text-[9px] fill-gray-400">
                    Sales
                  </text>
                  <text x={x} y={y - 18} textAnchor="middle" className="text-[11px] fill-white font-semibold">
                    ₹{value.toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        
        {/* Orders data points */}
        {ordersData.map((value, i) => {
          const x = getX(i);
          const y = getOrdersY(value);
          const isHovered = hoveredPoint?.type === 'orders' && hoveredPoint?.index === i;
          return (
            <g key={`orders-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3}
                fill="white"
                stroke="#f97316"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: animate ? 1 : 0,
                  transition: `opacity 0.3s ease ${1.0 + i * 0.08}s, r 0.2s ease`
                }}
                onMouseEnter={() => setHoveredPoint({ type: 'orders', index: i })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 35}
                    y={y - 42}
                    width="70"
                    height="28"
                    rx="4"
                    fill="#1f2937"
                    className="drop-shadow-lg"
                  />
                  <polygon
                    points={`${x - 5},${y - 14} ${x + 5},${y - 14} ${x},${y - 8}`}
                    fill="#1f2937"
                  />
                  <text x={x} y={y - 28} textAnchor="middle" className="text-[9px] fill-gray-400">
                    Orders
                  </text>
                  <text x={x} y={y - 18} textAnchor="middle" className="text-[11px] fill-white font-semibold">
                    {value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Clean Legend */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500 rounded-full" />
          <span className="text-xs text-gray-500">Total Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-orange-500 rounded-full" />
          <span className="text-xs text-gray-500">Orders</span>
        </div>
      </div>
    </div>
  );
};

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const user = getCurrentUser();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await OrderService.getFarmerOrders();
        if (response.success && response.data) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate real statistics from orders
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get orders from this month
    const thisMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.items[0]?.orderedAt || order.items[0]?.orderDate || now);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    // Get orders from last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.items[0]?.orderedAt || order.items[0]?.orderDate || now);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });
    
    // Calculate totals
    const currentMonthSales = thisMonthOrders.reduce((sum, order) => 
      sum + order.items.reduce((s, i) => s + i.subtotal, 0), 0);
    const lastMonthSales = lastMonthOrders.reduce((sum, order) => 
      sum + order.items.reduce((s, i) => s + i.subtotal, 0), 0);
    
    // Calculate percentage change
    const percentChange = lastMonthSales > 0 
      ? Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100)
      : currentMonthSales > 0 ? 100 : 0;
    
    // Get last 6 months data for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartMonths: string[] = [];
    const chartSales: number[] = [];
    const chartOrders: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      chartMonths.push(monthNames[monthIndex]);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.items[0]?.orderedAt || order.items[0]?.orderDate || now);
        return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year;
      });
      
      const monthSales = monthOrders.reduce((sum, order) => 
        sum + order.items.reduce((s, i) => s + i.subtotal, 0), 0);
      
      chartSales.push(monthSales);
      chartOrders.push(monthOrders.length);
    }
    
    // Calculate top selling products
    const productStats: { [key: string]: { quantity: number; amount: number } } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = { quantity: 0, amount: 0 };
        }
        productStats[item.productName].quantity += item.quantity;
        productStats[item.productName].amount += item.subtotal;
      });
    });
    
    const topProducts = Object.entries(productStats)
      .map(([name, data]) => ({ name, quantity: `${data.quantity} units`, amount: data.amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    
    // Calculate top locations (cities)
    const locationStats: { [key: string]: { orders: number; amount: number } } = {};
    orders.forEach(order => {
      const city = order.deliveryAddress?.city || 'Unknown';
      if (!locationStats[city]) {
        locationStats[city] = { orders: 0, amount: 0 };
      }
      locationStats[city].orders += 1;
      locationStats[city].amount += order.items.reduce((s, i) => s + i.subtotal, 0);
    });
    
    const topLocations = Object.entries(locationStats)
      .map(([city, data]) => ({ city, orders: data.orders, amount: data.amount }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3);
    
    // Calculate top customers
    const customerStats: { [key: string]: { orders: number; amount: number } } = {};
    orders.forEach(order => {
      const name = order.consumerName || 'Unknown';
      if (!customerStats[name]) {
        customerStats[name] = { orders: 0, amount: 0 };
      }
      customerStats[name].orders += 1;
      customerStats[name].amount += order.items.reduce((s, i) => s + i.subtotal, 0);
    });
    
    const topCustomers = Object.entries(customerStats)
      .map(([name, data]) => ({ name, orders: data.orders, amount: data.amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    
    return {
      currentMonthSales,
      percentChange,
      isPositive: percentChange >= 0,
      chartMonths,
      chartSales,
      chartOrders,
      topProducts,
      topLocations,
      topCustomers
    };
  }, [orders]);
  
  // Animated values
  const totalSales = useAnimatedCounter(stats.currentMonthSales, 2000);

  // Premium card class
  const cardClass = `
    bg-gradient-to-br from-white to-gray-50/80
    rounded-2xl border border-gray-100/80
    shadow-sm hover:shadow-2xl hover:shadow-gray-200/60
    transition-all duration-700 ease-out
    hover:-translate-y-1.5
    backdrop-blur-sm
  `;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with premium styling */}
      <div className="animate-slideDown">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Farmer Dashboard
          </span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Overview of your farm's performance and quick actions.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Monthly Sales Trends - Takes 3 columns */}
        <div className={`lg:col-span-3 ${cardClass} p-6 animate-scaleIn`} style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Sales Trends
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live Data
            </div>
          </div>
          <LineChart 
            salesData={stats.chartSales} 
            ordersData={stats.chartOrders} 
            months={stats.chartMonths} 
          />
        </div>

        {/* Total Sales Card - Premium */}
        <div className={`${cardClass} p-6 flex flex-col justify-between relative overflow-hidden animate-scaleIn`} style={{ animationDelay: '0.2s', opacity: 0 }}>
          {/* Decorative background circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full opacity-60" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-green-50 to-transparent rounded-full opacity-40" />
          
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <TrendingUp size={16} className="text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">
                Current Month
              </h3>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Sales</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-baseline gap-1">
                <span className="text-2xl">₹</span>
                <span>{totalSales.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-6 relative">
            <div className={`flex items-center gap-1 ${stats.isPositive ? 'text-green-600 bg-green-50 border border-green-100' : 'text-red-600 bg-red-50 border border-red-100'} px-3 py-1.5 rounded-full text-sm font-medium`}>
              {stats.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(stats.percentChange)}%</span>
            </div>
            <span className="text-gray-400 text-xs">vs last month</span>
          </div>
        </div>
      </div>

      {/* Featured: Top Selling Products Banner */}
      <div className={`${cardClass} p-0 overflow-hidden animate-scaleIn relative`} style={{ animationDelay: '0.25s', opacity: 0 }}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 animate-gradient-x" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce-slow">
                <Crown size={24} className="text-yellow-300 drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Top Selling Products
                  <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                </h2>
                <p className="text-sm text-white/70">Your best performers this month</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Zap size={14} className="text-yellow-300" />
              <span className="text-sm text-white font-medium">Live Rankings</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => {
                const maxAmount = Math.max(...stats.topProducts.map(p => p.amount));
                return (
                  <div 
                    key={product.name}
                    className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    {/* Rank badge */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-2 ring-yellow-300/50' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700 ring-2 ring-gray-300/50' : 
                      'bg-gradient-to-br from-orange-400 to-amber-500 text-white ring-2 ring-orange-300/50'
                    }`}>
                      {index === 0 ? <Star size={14} className="fill-current" /> : `#${index + 1}`}
                    </div>
                    
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:animate-wiggle">
                        <Package size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate group-hover:text-yellow-200 transition-colors">{product.name}</h3>
                        <p className="text-xs text-white/60 flex items-center gap-1">
                          <ShoppingCart size={10} />
                          {product.quantity}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-300 to-amber-400' :
                            index === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-300' :
                            'bg-gradient-to-r from-orange-300 to-amber-400'
                          }`}
                          style={{ 
                            width: `${(product.amount / maxAmount) * 100}%`,
                            transitionDelay: `${0.5 + index * 0.15}s`
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">₹{product.amount.toLocaleString()}</span>
                      <ArrowUpRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-white/70">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/10 flex items-center justify-center animate-pulse">
                  <Package size={36} className="text-white/50" />
                </div>
                <p className="font-medium text-lg">No products sold yet</p>
                <p className="text-sm text-white/50 mt-1">Start selling to see your top performers here!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Moved here with enhanced styling */}

        {/* Recent Orders - Enhanced */}
        <div className={`${cardClass} p-6 animate-scaleIn group/card relative overflow-hidden`} style={{ animationDelay: '0.4s', opacity: 0 }}>
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-500/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                  <BookOpen size={16} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>
              </div>
              {orders.length > 0 && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium animate-pulse-soft">
                  {orders.length} total
                </span>
              )}
            </div>
            <div className="space-y-3">
              {loading ? (
                // Premium loading skeleton
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-shimmer"></div>
                      <div className="h-3 w-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-shimmer"></div>
                    </div>
                    <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-shimmer"></div>
                  </div>
                ))
              ) : orders.length > 0 ? (
                orders.slice(0, 3).map((order, index) => (
                  <div 
                    key={order.orderId}
                    className="relative flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-blue-100 hover:shadow-md overflow-hidden"
                    onClick={() => navigate('/farmer/orders')}
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    {/* Ripple container */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                    </div>
                    
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        {order.consumerName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{order.consumerName}</p>
                        <p className="text-xs text-gray-500">
                          {order.items.map(i => i.productName).join(', ').substring(0, 25)}...
                        </p>
                      </div>
                    </div>
                    <span className="relative text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded-lg group-hover:bg-blue-100 transition-colors">
                      ₹{order.items.reduce((sum, i) => sum + i.subtotal, 0).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center animate-bounce-slow">
                    <BookOpen size={28} className="text-gray-300" />
                  </div>
                  <p className="font-medium">No orders yet</p>
                  <p className="text-xs mt-1">Orders will appear here when customers buy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Enhanced with micro-interactions */}
        <div className={`${cardClass} p-6 animate-scaleIn lg:col-span-2`} style={{ animationDelay: '0.5s', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ArrowUpRight size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/farmer/products')}
              className="relative w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 group hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-1 overflow-hidden"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Package size={20} />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Manage Products</span>
                  <span className="text-xs text-white/70">Add, edit or remove products</span>
                </div>
              </div>
              <ArrowUpRight size={20} className="relative group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => navigate('/farmer/stories')}
              className="relative w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 hover:border-purple-300 hover:from-purple-50 hover:to-white text-gray-700 hover:text-purple-700 rounded-xl transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent" />
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <BookOpen size={20} className="text-purple-600" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Post a Story</span>
                  <span className="text-xs text-gray-500 group-hover:text-purple-500 transition-colors">Share your farming journey</span>
                </div>
              </div>
              <ChevronRight size={20} className="relative group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => navigate('/farmer/orders')}
              className="relative w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 hover:border-blue-300 hover:from-blue-50 hover:to-white text-gray-700 hover:text-blue-700 rounded-xl transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent" />
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <ShoppingCart size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">View Orders</span>
                  <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">Manage customer orders</span>
                </div>
              </div>
              <ChevronRight size={20} className="relative group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => navigate('/farmer/profile')}
              className="relative w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 hover:border-amber-300 hover:from-amber-50 hover:to-white text-gray-700 hover:text-amber-700 rounded-xl transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-100/50 to-transparent" />
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <Users size={20} className="text-amber-600" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">My Profile</span>
                  <span className="text-xs text-gray-500 group-hover:text-amber-500 transition-colors">Update your details</span>
                </div>
              </div>
              <ChevronRight size={20} className="relative group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className={`${cardClass} p-6 animate-scaleIn`} style={{ animationDelay: '0.6s', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MapPin size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Top Locations
            </h2>
          </div>
          <div className="space-y-3">
            {stats.topLocations.length > 0 ? (
              stats.topLocations.map((location, index) => (
                <div 
                  key={location.city}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50/50 transition-all duration-300 border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                      index === 0 ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' : 
                      index === 1 ? 'bg-gradient-to-br from-blue-300 to-indigo-400 text-white' : 
                      'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{location.city}</p>
                      <p className="text-xs text-gray-500">{location.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-cyan-600 font-bold text-sm bg-cyan-50 px-2 py-1 rounded-lg">
                    ₹{location.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <MapPin size={28} className="text-gray-300" />
                </div>
                <p className="font-medium">No location data yet</p>
                <p className="text-xs mt-1">Locations will appear based on orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className={`${cardClass} p-6 animate-scaleIn`} style={{ animationDelay: '0.7s', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Users size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Top Customers
            </h2>
          </div>
          <div className="space-y-3">
            {stats.topCustomers.length > 0 ? (
              stats.topCustomers.map((customer, index) => (
                <div 
                  key={customer.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50/50 transition-all duration-300 border border-transparent hover:border-purple-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 ring-2 ring-yellow-200' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 ring-2 ring-gray-200' : 
                      'bg-gradient-to-br from-orange-300 to-amber-400 ring-2 ring-orange-200'
                    }`}>
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        {index === 0 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">TOP</span>}
                      </div>
                      <p className="text-xs text-gray-500">{customer.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-purple-600 font-bold text-sm bg-purple-50 px-2 py-1 rounded-lg">
                    ₹{customer.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Users size={28} className="text-gray-300" />
                </div>
                <p className="font-medium">No customer data yet</p>
                <p className="text-xs mt-1">Your top customers will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 20px 5px rgba(34, 197, 94, 0.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .animate-wiggle:hover {
          animation: wiggle 0.5s ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        
        .animate-pop:active {
          animation: pop 0.2s ease-out;
        }
        
        .hover-float:hover {
          animation: float 2s ease-in-out infinite;
        }
        
        .card-premium {
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.03);
        }
        
        .card-premium:hover {
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.08),
            0 12px 40px rgba(0, 0, 0, 0.06);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        
        /* Hover lift effect */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
        
        /* Magnetic button effect */
        .magnetic-hover {
          transition: transform 0.15s ease-out;
        }
        
        /* Glass morphism */
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Interactive border */
        .border-glow:hover {
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
