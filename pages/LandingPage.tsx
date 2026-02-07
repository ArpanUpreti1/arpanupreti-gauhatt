import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, Users, Truck, ShieldCheck, ArrowRight, Star, Leaf, MapPin, 
  Smartphone, ShoppingBag, CheckCircle, Plus, Loader, Clock, TrendingUp,
  QrCode, Store, Search
} from 'lucide-react';
import gsap from 'gsap';
import { Button } from '../components/Button';
import ParticleBackground from '../components/ParticleBackground';

// Updated testimonials with Nepali imagery
const testimonials = [
  {
    id: 1,
    name: "Sita Sharma",
    role: "Home Maker, Kathmandu",
    quote: "The organic vegetables from Gauhatt remind me of my childhood in the village. The freshness is unmatched in the city markets!",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=200&q=80"
  },
  {
    id: 2,
    name: "Rajesh Shrestha",
    role: "Restaurant Owner, Lalitpur",
    quote: "Directly sourcing from farmers has improved our food quality significantly. Our customers love the taste difference.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&q=80"
  },
  {
    id: 3,
    name: "Anjali Pradhan",
    role: "Health Coach, Bhaktapur",
    quote: "Finally, a platform I can trust for my family's nutrition. Knowing exactly where my food comes from gives me peace of mind.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=200&q=80"
  },
  {
    id: 4,
    name: "Bikram Thapa",
    role: "Head Chef, Pokhara",
    quote: "Gauhatt ensures I get the seasonal best for my menu. The delivery is prompt and the produce is always pristine.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=200&q=80"
  },
  {
    id: 5,
    name: "Manisha Gurung",
    role: "Working Mom, Biratnagar",
    quote: "I love supporting local farmers while getting chemical-free veggies delivered to my door. It's a win-win!",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?fit=crop&w=200&q=80"
  },
  {
    id: 6,
    name: "Kiran KC",
    role: "Food Blogger, Dharan",
    quote: "The transparency is amazing. Scanning the QR code to see the farm location is such a cool feature.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=200&q=80"
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  // District Checker State
  const [district, setDistrict] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'unavailable'>('idle');
  
  // Testimonial Selection State
  const [selectedTestimonial, setSelectedTestimonial] = useState(0);

  const checkAvailability = () => {
    if (!district.trim()) return;
    
    // Major districts in Nepal + mock data
    const availableDistricts = [
      'kathmandu', 'lalitpur', 'bhaktapur', 'kaski', 'pokhara', 
      'chitwan', 'morang', 'sunsari', 'jhapa', 'biratnagar', 
      'dharan', 'itahari', 'bharatpur'
    ];
    
    const isAvailable = availableDistricts.some(d => district.toLowerCase().includes(d));
    setAvailabilityStatus(isAvailable ? 'available' : 'unavailable');
  };

  useEffect(() => {
    // Hero Animations - Smoother Reveal
    const tl = gsap.timeline();
    
    // Ensure initial state
    gsap.set([".hero-title-1", ".hero-title-2"], { y: "100%" });
    gsap.set(".hero-desc", { opacity: 0, y: 20 });
    gsap.set(".hero-actions", { opacity: 0, scale: 0.95 });
    
    tl.to(".hero-title-1", { y: "0%", duration: 1.2, ease: "power3.out" })
      .to(".hero-title-2", { y: "0%", duration: 1.2, ease: "power3.out" }, "-=1.0")
      .to(".hero-desc", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to(".hero-actions", { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.2)" }, "-=0.4")
      .fromTo(".hero-img", 
         { opacity: 0, scale: 1.05 }, 
         { opacity: 0.6, scale: 1, duration: 1.5, ease: "power2.out" }, 
         "-=1.5"
      );

    // Features Section Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(".feature-card", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out"
          });
          
          gsap.to(".tracking-dot", { x: 120, duration: 2, repeat: -1, ease: "power1.inOut", yoyo: true });
        }
      });
    }, { threshold: 0.1 });

    if (featuresRef.current) observer.observe(featuresRef.current);

    const worksObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.fromTo(".work-step", 
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
          );
        }
      });
    }, { threshold: 0.1 });

    if (howItWorksRef.current) worksObserver.observe(howItWorksRef.current);

    const phoneScroll = gsap.to(".phone-scroll-content", {
      yPercent: -50,
      ease: "none",
      duration: 8,
      repeat: -1,
      paused: false
    });

    const phoneContainer = document.querySelector(".phone-container");
    const handlePhoneEnter = () => phoneScroll.pause();
    const handlePhoneLeave = () => phoneScroll.play();
    
    phoneContainer?.addEventListener("mouseenter", handlePhoneEnter);
    phoneContainer?.addEventListener("mouseleave", handlePhoneLeave);

    const pathAnim = gsap.fromTo(".map-path-draw", 
      { strokeDasharray: 300, strokeDashoffset: 300 },
      { strokeDashoffset: 0, duration: 2.5, repeat: -1, ease: "power1.inOut", repeatDelay: 1 }
    );

    const truckAnim = gsap.fromTo(".map-truck",
      { offsetDistance: "0%" },
      { offsetDistance: "100%", duration: 2.5, repeat: -1, ease: "power1.inOut", repeatDelay: 1 }
    );

    return () => {
      observer.disconnect();
      worksObserver.disconnect();
      phoneScroll.kill();
      pathAnim.kill();
      truckAnim.kill();
      phoneContainer?.removeEventListener("mouseenter", handlePhoneEnter);
      phoneContainer?.removeEventListener("mouseleave", handlePhoneLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans relative">
      {/* Interactive Particle Background - Leaves */}
      <ParticleBackground />

      {/* CSS for Scan, Map, Wind & Glitch Animations */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.8; }
        }
        .animate-scan {
          animation: scan 2s linear infinite alternate;
        }

        @keyframes move-truck-path {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .animate-move-truck {
          animation: move-truck-path 4s linear infinite;
        }

        @keyframes draw-route-line {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-draw-route {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: draw-route-line 4s linear infinite;
        }

        @keyframes wind-flow {
          0% { transform: translateX(0); opacity: 0.6; }
          100% { transform: translateX(-12px); opacity: 0; }
        }
        .animate-wind {
          animation: wind-flow 0.6s linear infinite;
        }
        
        @keyframes pulse-dot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 154, 42, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(76, 154, 42, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 154, 42, 0); }
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        @keyframes data-stream {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        .animate-data-stream {
            background-size: 200% 100%;
            animation: data-stream 2s linear infinite;
        }

        /* Improved Speed/Motion Animation */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation - Sharp */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              {/* Sharp */}
              <div className="w-9 h-9 bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                <Leaf size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button size="md" onClick={() => navigate('/login')} className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all transform hover:-translate-y-0.5">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Marketteam Inspired with Gauhatt Green */}
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center justify-center min-h-screen">
        
        {/* Gradient Background - Clean Green Theme */}
        <div className="absolute inset-0 z-0">
          {/* Primary gradient: Light to deep green */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100 opacity-100"></div>
          
          {/* Subtle floating blobs */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/30 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-primary-300/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 -right-20 w-72 h-72 bg-primary-100/40 rounded-full blur-[80px]"></div>
        </div>

        {/* Navigation overlay adjustment */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/10 to-transparent z-5 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center min-h-[600px] lg:min-h-[700px]">
          
          {/* Left Content - Typography & CTA */}
          <div className="flex flex-col justify-center py-12 lg:py-0">
            
            {/* Main Heading - Large & Bold */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-950 tracking-tight leading-[1.1] mb-6 hero-title-1 select-none">
              <span className="block">Farm Fresh</span>
              <span className="block bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">On Your Table</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-700 font-medium mb-2 hero-desc">
              Connect directly with local farmers.
            </p>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-10 max-w-xl hero-desc leading-relaxed">
              Fresh, organic vegetables delivered to your doorstep in under 24 hours. Skip the middleman, support farmers, eat healthier.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 hero-actions">
              <Button 
                onClick={() => navigate('/register')} 
                size="lg" 
                className="px-8 py-4 text-base font-bold shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
              >
                Start Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="px-8 py-4 text-base font-bold border-2 border-gray-900 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 hero-actions">
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-primary-700">10,000+</span>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Happy Customers</span>
              </div>
              <div className="w-px bg-gray-300/50"></div>
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-primary-700">500+</span>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Local Farmers</span>
              </div>
              <div className="w-px bg-gray-300/50"></div>
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-primary-700">24hrs</span>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Farm to Door</span>
              </div>
            </div>
          </div>

          {/* Right Side - Circular Avatar/Network Visualization */}
          <div className="relative hidden lg:flex items-center justify-center h-full min-h-[600px]">
            
            {/* Central Circle with Network */}
            <div className="relative w-[600px] h-[600px] flex items-center justify-center">
              
              {/* Circular Rings - Equal spacing (80px apart) */}
              <div className="absolute inset-0 border-2 border-primary-300/40 rounded-full opacity-40"></div>
              <div className="absolute inset-20 border-2 border-primary-400/30 rounded-full opacity-30"></div>
              <div className="absolute inset-40 border border-primary-500/20 rounded-full opacity-30"></div>
              
              {/* Central Hub - Farmers Network */}
              <div className="absolute inset-52 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-2xl shadow-primary-900/30 z-20">
                <div className="text-center">
                  <Sprout size={40} className="text-green-100 mx-auto mb-1" />
                  <p className="text-white font-bold text-base">500+</p>
                  <p className="text-primary-100 text-[10px] uppercase tracking-widest font-semibold">Farmers</p>
                </div>
              </div>

              {/* All Farmer Avatars - Distributed across 3 orbits */}
              {[
                /* Inner orbit (160px) - 2 farmers */
                { orbit: 160, angle: 45, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&q=80', name: 'Ramesh' },
                { orbit: 160, angle: 225, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&q=80', name: 'Priya' },
                
                /* Middle orbit (220px) - 3 farmers */
                { orbit: 220, angle: 0, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=100&q=80', name: 'Anjali' },
                { orbit: 220, angle: 120, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100&q=80', name: 'Vikram' },
                { orbit: 220, angle: 240, image: 'https://images.unsplash.com/photo-1517849845537-1d51a20414de?fit=crop&w=100&q=80', name: 'Gita' },
                
                /* Outer orbit (280px) - 3 farmers */
                { orbit: 280, angle: 60, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=100&q=80', name: 'Pooja' },
                { orbit: 280, angle: 180, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&q=80', name: 'Suresh' },
                { orbit: 280, angle: 300, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&q=80', name: 'Meera' },
              ].map((farmer, idx) => (
                <div
                  key={idx}
                  className="absolute w-14 h-14 rounded-full border-3 border-white shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer z-10 overflow-hidden group"
                  style={{
                    transform: `rotate(${farmer.angle}deg) translateY(-${farmer.orbit}px) rotate(-${farmer.angle}deg)`
                  }}
                >
                  <img 
                    src={farmer.image} 
                    alt={farmer.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 shadow-lg">
                    {farmer.name}
                  </div>
                </div>
              ))}

              {/* Decorative orbit lines matching avatar positions */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 600">
                <circle cx="300" cy="300" r="160" fill="none" stroke="#4c9a2a" strokeWidth="1" opacity="0.15" strokeDasharray="4 4"/>
                <circle cx="300" cy="300" r="220" fill="none" stroke="#4c9a2a" strokeWidth="1" opacity="0.15" strokeDasharray="4 4"/>
                <circle cx="300" cy="300" r="280" fill="none" stroke="#4c9a2a" strokeWidth="1" opacity="0.15" strokeDasharray="4 4"/>
              </svg>
            </div>

          </div>

        </div>

        {/* District Input Section */}
        <div className="relative z-10 w-full max-w-2xl mx-auto mt-16 lg:mt-8">
          <div className="bg-white/95 backdrop-blur-md border border-white shadow-2xl overflow-hidden">
            <div className="flex gap-2 p-2">
              <div className="flex items-center pl-4 text-primary-600">
                <MapPin size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Enter your district (e.g. Kathmandu)..." 
                className="flex-1 px-3 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-400 font-medium text-sm md:text-base"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if(availabilityStatus !== 'idle') setAvailabilityStatus('idle');
                }}
                onKeyDown={(e) => e.key === 'Enter' && checkAvailability()}
              />
              <button 
                onClick={checkAvailability}
                className="bg-primary-600 text-white px-6 py-2 font-bold text-sm hover:bg-primary-700 transition-colors uppercase tracking-wide"
              >
                Check
              </button>
            </div>
            
            {/* Availability Message */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center h-10">
              {availabilityStatus === 'available' && (
                <div className="text-green-700 font-bold flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Service is available in <span className="font-black">{district}</span>!
                </div>
              )}
              {availabilityStatus === 'unavailable' && (
                <div className="text-amber-700 font-bold flex items-center justify-center gap-2">
                  <Clock size={16} /> Coming soon to {district}. Join to get notified!
                </div>
              )}
              {availabilityStatus === 'idle' && (
                <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                  Currently serving 10+ major districts
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Animated Features Section (Bento Grid) - Sharp */}
      <section id="features" className="py-24 bg-gray-50 relative overflow-hidden z-10" ref={featuresRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Why Choose Gauhatt?</h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed">We combine modern technology with traditional farming values to bring you a transparent, fair, and incredibly fresh food system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            
            {/* Feature 1: Quality Check - Sharp */}
            <div className="md:col-span-2 bg-white p-8 md:p-10 shadow-sm border border-gray-200/60 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 feature-card opacity-0 translate-y-8 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                    <div className="bg-primary-50 w-16 h-16 flex items-center justify-center mb-6 text-primary-600 border border-primary-100">
                        <ShieldCheck size={36} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Verified Quality</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Every batch is rigorously tested for chemicals and quality before it leaves the farm. We prioritize your family's health above all else.
                    </p>
                    
                    <div className="mt-8 flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-gray-900">100%</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Freshness</span>
                        </div>
                        <div className="w-px bg-gray-200"></div>
                         <div className="flex flex-col">
                            <span className="text-3xl font-bold text-gray-900">0%</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Chemicals</span>
                        </div>
                    </div>
                </div>
                
                {/* Visual Interaction - Sharp */}
                <div className="flex-1 w-full max-w-xs relative aspect-[4/5] overflow-hidden bg-gray-100 shadow-inner border border-gray-100 group-hover:scale-[1.02] transition-transform duration-500">
                     {/* Authentic Veggie Image */}
                     <img src="https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fresh Vegetables" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/10"></div>
                     {/* CSS Based Scan Line Animation for reliability */}
                     <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_20px_rgba(74,222,128,0.6)] animate-scan top-0 z-20"></div>
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-lg whitespace-nowrap">
                        <CheckCircle size={14} className="text-green-500" /> Quality Verified
                     </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Express Delivery - Enhanced Animation */}
            <div className="bg-primary-50 p-8 shadow-sm border border-primary-100 feature-card opacity-0 translate-y-8 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col">
                <div className="bg-white w-14 h-14 flex items-center justify-center mb-6 text-primary-600 shadow-sm border border-primary-100">
                    <Truck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Express Delivery</h3>
                <p className="text-gray-600 text-sm mb-6">Farm to table in under 24 hours.</p>
                
                {/* Visual: Live Map - Sharp & Animated */}
                <div className="mt-auto relative w-full h-40 bg-white shadow-inner overflow-hidden border border-gray-100 group/map">
                    {/* Map Grid Background */}
                    <div className="absolute inset-0 opacity-10 transition-transform duration-700 group-hover/map:scale-110" 
                         style={{backgroundImage: 'linear-gradient(#4c9a2a 1px, transparent 1px), linear-gradient(90deg, #4c9a2a 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>
                    
                    {/* SVG Route */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                        {/* Road path */}
                        <path id="express-route" d="M -20,80 Q 80,120 150,60 T 320,60" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="square" />
                        
                        {/* Progress path (animated) */}
                        <path d="M -20,80 Q 80,120 150,60 T 320,60" fill="none" stroke="#4c9a2a" strokeWidth="6" strokeLinecap="square" className="animate-draw-route" />
                    </svg>

                    {/* Checkpoints */}
                    <div className="absolute top-[80px] left-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                        <span className="text-[9px] text-gray-500 font-bold mt-1">Farm</span>
                    </div>
                    
                    <div className="absolute top-[60px] right-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                         <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-dot"></div>
                        <span className="text-[9px] text-gray-900 font-bold mt-1">Home</span>
                    </div>

                    {/* Moving Truck Container */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                         <div className="w-8 h-8 bg-white shadow-lg border border-primary-100 flex items-center justify-center text-primary-600 z-20 absolute animate-move-truck"
                              style={{ offsetPath: "path('M -20,80 Q 80,120 150,60 T 320,60')", offsetRotate: 'auto' }}>
                             <Truck size={14} />
                             
                             {/* Speed Lines */}
                             <div className="absolute -left-5 top-1/2 -translate-y-1/2 space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="w-4 h-0.5 bg-primary-300 animate-wind"></div>
                                 <div className="w-6 h-0.5 bg-primary-300 animate-wind delay-75"></div>
                                 <div className="w-3 h-0.5 bg-primary-300 animate-wind delay-150"></div>
                             </div>

                             {/* Tooltip on Hover */}
                             <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                                 65 km/h
                                 <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                             </div>
                         </div>
                    </div>

                    {/* ETA Badge */}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur border border-gray-200 text-gray-600 text-[10px] px-2 py-1 shadow-sm font-mono flex items-center gap-1.5 z-20">
                        <Clock size={10} className="text-primary-500" />
                        <span>ETA: 07:00 AM</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Farmer First - "Cut the Middleman" Visualization */}
            <div className="bg-gray-900 p-8 shadow-sm text-white feature-card opacity-0 translate-y-8 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

              <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                      <div className="bg-white/10 w-14 h-14 flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Users size={28} className="text-primary-400" />
                      </div>
                      <div className="bg-primary-900/50 px-3 py-1 border border-primary-500/30 flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-primary-400" />
                          <span className="text-xs font-bold text-primary-300">Impact</span>
                      </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">Farmer First</h3>
                  <p className="text-gray-400 text-sm mb-6">Cutting out middlemen to double farmer income.</p>
                  
                  {/* Visual: Direct Connection Diagram */}
                  <div className="mt-auto h-32 w-full relative flex items-center justify-between px-2 pt-4">
                     {/* Background Track */}
                     <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-700 -translate-y-1/2"></div>
                     
                     {/* Middlemen Nodes - Vanish on Hover */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 transition-all duration-500 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-0 group-hover:gap-0">
                         <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 border border-gray-500">
                                <Store size={14} />
                            </div>
                            <span className="text-[8px] text-gray-500 mt-1">Agent</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 border border-gray-500">
                                <Store size={14} />
                            </div>
                            <span className="text-[8px] text-gray-500 mt-1">Market</span>
                         </div>
                     </div>

                     {/* Direct Green Line - Appears on Hover */}
                     <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-primary-500 -translate-y-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center shadow-[0_0_15px_rgba(76,154,42,0.8)]"></div>

                     {/* Farmer Node */}
                     <div className="relative z-10 flex flex-col items-center group-hover:translate-x-8 transition-transform duration-500">
                         <div className="w-12 h-12 bg-gray-800 border-2 border-primary-500 flex items-center justify-center text-primary-400 shadow-lg relative">
                             <Sprout size={20} />
                             {/* Money Particle */}
                             <div className="absolute -right-2 -top-2 w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-all delay-300 duration-500 animate-bounce">
                                $$
                             </div>
                         </div>
                         <span className="text-[10px] font-bold mt-2 uppercase tracking-wide">Farmer</span>
                     </div>

                     {/* Consumer Node */}
                     <div className="relative z-10 flex flex-col items-center group-hover:-translate-x-8 transition-transform duration-500">
                         <div className="w-12 h-12 bg-white text-gray-900 flex items-center justify-center shadow-lg">
                             <ShoppingBag size={20} />
                         </div>
                         <span className="text-[10px] font-bold mt-2 uppercase tracking-wide text-gray-300">You</span>
                     </div>

                     {/* Interaction Text */}
                     <div className="absolute bottom-0 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                         <span className="text-xs font-bold text-primary-400 bg-gray-900/80 px-2 py-1">100% Direct to Farmer</span>
                     </div>
                  </div>
              </div>
            </div>

            {/* Feature 4: Tech Transparency - QR Scan Interaction */}
            <div className="md:col-span-2 bg-white p-8 md:p-10 shadow-sm border border-gray-200/60 hover:shadow-xl transition-all duration-500 feature-card opacity-0 translate-y-8 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col justify-between h-full">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                             <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-50 p-2.5 text-primary-600">
                                    <Smartphone size={24} />
                                </div>
                                <span className="text-primary-700 font-bold tracking-wide text-sm uppercase bg-green-50 px-3 py-1 border border-green-100">Digital Traceability</span>
                             </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan to Know the Story</h3>
                            <p className="text-gray-600 max-w-md">Every package comes with a QR code. Scan it to see exactly when and where your food was harvested.</p>
                        </div>
                        
                        {/* Interactive QR Visual */}
                        <div className="relative w-24 h-24 shrink-0 bg-white border-2 border-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-sm group-hover:shadow-md cursor-pointer">
                            <QrCode size={50} className="text-gray-900 transition-colors duration-500 group-hover:text-primary-600" />
                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary-600 shadow-[0_0_10px_#4c9a2a] group-hover:animate-scan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>
                     </div>
                     
                     {/* Timeline Visualization - Data Flow */}
                     <div className="relative bg-gray-50 p-6 border border-gray-100 group-hover:border-primary-100 transition-colors duration-500">
                        {/* Connecting Line - Sharp */}
                        <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-200 -translate-y-1/2 hidden md:block overflow-hidden">
                            {/* Animated Data Stream on Hover */}
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-primary-500 to-transparent -translate-x-full group-hover:animate-data-stream opacity-50"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                            {[
                                { icon: Sprout, label: "Harvested", sub: "6:00 AM", delay: 0 },
                                { icon: CheckCircle, label: "Quality Check", sub: "8:30 AM", delay: 500 },
                                { icon: Truck, label: "In Transit", sub: "10:00 AM", delay: 1000 },
                                { icon: MapPin, label: "Delivered", sub: "Expected 7 AM", delay: 1500 }
                            ].map((step, idx) => (
                                <div 
                                    key={idx} 
                                    className="relative flex md:flex-col items-center gap-4 md:gap-3 z-10 group/step"
                                    style={{ transitionDelay: `${step.delay}ms` }}
                                >
                                    {/* Icon Box - Becomes colored on hover */}
                                    <div className={`w-10 h-10 flex items-center justify-center border-2 shadow-sm transition-all duration-500 z-10 bg-white border-gray-200 text-gray-400 group-hover:border-primary-500 group-hover:text-primary-600 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(76,154,42,0.2)]`}>
                                        <step.icon size={18} />
                                    </div>
                                    <div className="text-left md:text-center transition-opacity duration-500 opacity-60 group-hover:opacity-100">
                                        <p className="font-bold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">{step.label}</p>
                                        <p className="text-xs text-gray-500">{step.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works - Sharp */}
      <section id="how-it-works" className="py-24 bg-white relative z-10" ref={howItWorksRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
                <span className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-2 block">Simple Process</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Freshness in 3 Steps</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (Desktop SVG) */}
                <svg className="hidden md:block absolute top-24 left-0 w-full h-24 -z-10 text-gray-200" preserveAspectRatio="none">
                    <path d="M 150,50 C 400,50 400,50 600,50 C 800,50 800,50 1050,50" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="8 8" />
                </svg>

                {/* Step 1: Browse - Sharp */}
                <div className="work-step opacity-0 group">
                    <div className="relative bg-white p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white font-bold text-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500">
                            1
                        </div>
                        
                        <div className="mt-10 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Browse & Order</h3>
                            <p className="text-gray-500 mb-8 text-sm leading-relaxed">Choose from a wide variety of seasonal produce listed directly by local farmers.</p>
                            
                            {/* Phone Mockup - Sharp */}
                            <div className="w-48 mx-auto bg-gray-900 p-2 shadow-2xl transform group-hover:scale-105 transition-transform duration-500 phone-container relative cursor-pointer">
                                {/* Phone Screen */}
                                <div className="bg-gray-50 overflow-hidden h-64 relative border border-gray-200">
                                    <div className="bg-white h-10 w-full border-b flex items-center px-3 justify-between z-10 relative shadow-sm">
                                        <div className="w-16 h-3 bg-gray-200"></div>
                                        <ShoppingBag size={14} className="text-gray-400" />
                                    </div>
                                    
                                    <div className="p-3 space-y-3 phone-scroll-content">
                                        {[1,2,3,4,5,6].map(i => (
                                            <div key={i} className="bg-white p-2 flex gap-2 shadow-sm border border-gray-100 group/item transition-colors hover:border-primary-200">
                                                <div className="w-8 h-8 bg-green-100 shrink-0"></div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="w-16 h-2 bg-gray-200"></div>
                                                    <div className="w-8 h-2 bg-gray-100"></div>
                                                </div>
                                                <div className="w-6 h-6 bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-primary-500 group-hover/item:text-white transition-colors">
                                                    <Plus size={12} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Cart Badge - Sharp */}
                                    <div className="absolute bottom-3 right-3 w-10 h-10 bg-primary-600 flex items-center justify-center text-white shadow-lg z-20 group-hover:animate-bounce-slow">
                                        <ShoppingBag size={16} />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white flex items-center justify-center text-[8px] font-bold">2</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Harvest - Sharp */}
                <div className="work-step opacity-0 group">
                    <div className="relative bg-white p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white font-bold text-2xl -rotate-3 group-hover:-rotate-12 transition-transform duration-500">
                            2
                        </div>
                        
                        <div className="mt-10 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Harvest on Demand</h3>
                            <p className="text-gray-500 mb-8 text-sm leading-relaxed">Farmers receive your order and harvest crops only when needed to ensure peak freshness.</p>
                            
                            <div className="w-56 mx-auto relative h-64 flex items-center justify-center">
                                {/* Pulse Effect - Sharp */}
                                <div className="absolute inset-0 bg-green-50 scale-75 animate-pulse opacity-50"></div>
                                
                                <div className="relative bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 w-full transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="flex items-center gap-3 mb-3 border-b border-gray-50 pb-3">
                                        <div className="w-8 h-8 bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform duration-500">
                                            <Sprout size={16} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-bold text-gray-900">New Order #204</div>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Clock size={10} /> Just now
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Tomatoes</span>
                                            <span className="font-bold text-gray-900">2 kg</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Spinach</span>
                                            <span className="font-bold text-gray-900">1 bundle</span>
                                        </div>
                                    </div>
                                    
                                    <button className="w-full py-2 font-bold text-xs text-white bg-primary-600 overflow-hidden relative isolate">
                                      <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">Accept Order</span>
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 gap-2">
                                         <Loader className="animate-spin" size={12} /> Harvesting...
                                      </div>
                                      <div className="absolute inset-0 bg-primary-700 w-0 group-hover:w-full transition-all duration-[3000ms] ease-linear -z-10"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 3: Deliver - Sharp */}
                <div className="work-step opacity-0 group">
                    <div className="relative bg-white p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white font-bold text-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500">
                            3
                        </div>
                        
                        <div className="mt-10 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Doorstep Delivery</h3>
                            <p className="text-gray-500 mb-8 text-sm leading-relaxed">Fresh produce arrives at your doorstep by early morning next day.</p>
                            
                            <div className="w-full h-64 flex items-center justify-center relative overflow-hidden border border-gray-100 bg-gray-50">
                                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                                
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 200">
                                    <path 
                                        d="M 50,150 Q 100,80 150,120 T 250,80" 
                                        fill="none" 
                                        stroke="#e5e7eb" 
                                        strokeWidth="4" 
                                        strokeLinecap="round"
                                        strokeDasharray="8 8"
                                    />
                                    <path 
                                        className="map-path-draw"
                                        d="M 50,150 Q 100,80 150,120 T 250,80" 
                                        fill="none" 
                                        stroke="#4c9a2a" 
                                        strokeWidth="4" 
                                        strokeLinecap="round"
                                    />
                                    <circle r="0" fill="none">
                                        <animateMotion 
                                            dur="2.5s" 
                                            repeatCount="indefinite"
                                            path="M 50,150 Q 100,80 150,120 T 250,80"
                                            keyPoints="0;1"
                                            keyTimes="0;1"
                                            calcMode="linear"
                                        >
                                            <mpath xlinkHref="#path" />
                                        </animateMotion>
                                    </circle>
                                </svg>
                                
                                <div className="absolute bottom-8 left-8 bg-white p-1.5 shadow-md z-10">
                                    <Sprout size={16} className="text-primary-600" />
                                </div>
                                
                                <div className="absolute top-16 right-8 bg-white p-1.5 shadow-md z-10 group-hover:scale-110 transition-transform">
                                    <MapPin size={16} className="text-red-500" />
                                </div>

                                <div 
                                    className="map-truck absolute w-8 h-8 bg-white shadow-lg flex items-center justify-center text-primary-600 z-20"
                                    style={{ offsetPath: "path('M 50,150 Q 100,80 150,120 T 250,80')" }}
                                >
                                    <Truck size={16} />
                                </div>

                                <div className="absolute top-6 right-2 bg-white/90 backdrop-blur px-2 py-1 shadow-lg border border-green-100 text-[10px] font-bold text-green-700 opacity-0 group-hover:opacity-100 group-hover:translate-y-[-5px] transition-all delay-1000 duration-500">
                                    Delivered!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials - Customer Reviews with Interactive Circle */}
      <section id="testimonials" className="py-24 bg-white relative overflow-hidden z-10" ref={testimonialsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header with Green Accent */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-1.5 h-12 bg-primary-600"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Customer Reviews</h2>
          </div>
          
          {/* Reviews Layout */}
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[450px]">
            
            {/* Left Side - Interactive Full Circle with Farmers */}
            <div className="relative h-[400px] flex items-center justify-center">
              {/* Circle Container */}
              <div className="relative w-[320px] h-[320px]">
                
                {/* Rotating Highlight Arc - Follows Selected */}
                <svg 
                  className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
                  style={{ transform: `rotate(${(selectedTestimonial * 72) - 90}deg)` }}
                  viewBox="0 0 320 320"
                >
                  {/* Highlight Arc that follows selection */}
                  <circle
                    cx="160"
                    cy="160"
                    r="130"
                    fill="none"
                    stroke="url(#arcGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="50 770"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(76, 154, 42, 0.5))' }}
                  />
                  <defs>
                    <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4c9a2a" />
                      <stop offset="100%" stopColor="#3d8220" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Static Circle Track */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                  <circle
                    cx="160"
                    cy="160"
                    r="130"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                </svg>
                
                {/* Nepali Farmer Avatars positioned on full circle */}
                {[
                  { id: 1, name: 'सीता शर्मा', role: 'गृहिणी, काठमाडौं', quote: 'गौहाटबाट आउने तरकारीहरू एकदमै ताजा र स्वादिष्ट छन्। मेरो परिवारलाई यो सेवा धेरै मन पर्छ।', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?fit=crop&w=150&q=80' },
                  { id: 2, name: 'राजेश श्रेष्ठ', role: 'रेस्टुरेन्ट मालिक, ललितपुर', quote: 'किसानबाट सिधै तरकारी किन्दा गुणस्तर र ताजापन दुवै मिल्छ। मेरो ग्राहकहरू खुसी छन्।', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=150&q=80' },
                  { id: 3, name: 'अञ्जली प्रधान', role: 'स्वास्थ्य सल्लाहकार, भक्तपुर', quote: 'रासायनिक मुक्त तरकारी पाउनु सजिलो भयो। परिवारको स्वास्थ्यको लागि यो उत्तम छ।', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=150&q=80' },
                  { id: 4, name: 'विक्रम थापा', role: 'प्रमुख शेफ, पोखरा', quote: 'मौसमी तरकारीहरू समयमै आइपुग्छन्। डेलिभरी छिटो र भरपर्दो छ।', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&q=80' },
                  { id: 5, name: 'मनिषा गुरुङ', role: 'कामकाजी आमा, विराटनगर', quote: 'घरमै बसेर ताजा तरकारी पाउनु कति राम्रो! किसानलाई पनि सिधै फाइदा पुग्छ।', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=150&q=80' },
                ].map((testimonial, idx) => {
                  // Position avatars evenly around full circle (72 degrees apart for 5 items)
                  const angle = (idx * 72) - 90; // Start from top
                  const radius = 130;
                  const x = 160 + radius * Math.cos(angle * Math.PI / 180);
                  const y = 160 + radius * Math.sin(angle * Math.PI / 180);
                  
                  return (
                    <div
                      key={testimonial.id}
                      onClick={() => setSelectedTestimonial(idx)}
                      className={`absolute cursor-pointer transition-all duration-500 ease-out group`}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {/* Avatar */}
                      <div className={`relative w-16 h-16 rounded-full overflow-hidden border-4 transition-all duration-500 ${
                        selectedTestimonial === idx 
                          ? 'border-primary-500 shadow-xl shadow-primary-500/30 scale-125' 
                          : 'border-white shadow-lg hover:border-primary-200 hover:scale-110'
                      }`}>
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })}
                
                {/* Center Hub */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full shadow-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-xl font-bold">५००+</p>
                    <p className="text-[8px] uppercase tracking-wider">ग्राहक</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Selected Review Quote with Animation */}
            <div className="relative pl-8">
              {/* Large Quote Mark */}
              <span className="absolute -top-4 -left-2 text-8xl text-gray-200 font-serif leading-none select-none">"</span>
              
              {/* Quote Text - Animated */}
              <div className="relative z-10 overflow-hidden">
                {[
                  { id: 1, name: 'सीता शर्मा', role: 'गृहिणी, काठमाडौं', quote: 'गौहाटबाट आउने तरकारीहरू एकदमै ताजा र स्वादिष्ट छन्। मेरो परिवारलाई यो सेवा धेरै मन पर्छ।', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?fit=crop&w=150&q=80' },
                  { id: 2, name: 'राजेश श्रेष्ठ', role: 'रेस्टुरेन्ट मालिक, ललितपुर', quote: 'किसानबाट सिधै तरकारी किन्दा गुणस्तर र ताजापन दुवै मिल्छ। मेरो ग्राहकहरू खुसी छन्।', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=150&q=80' },
                  { id: 3, name: 'अञ्जली प्रधान', role: 'स्वास्थ्य सल्लाहकार, भक्तपुर', quote: 'रासायनिक मुक्त तरकारी पाउनु सजिलो भयो। परिवारको स्वास्थ्यको लागि यो उत्तम छ।', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=150&q=80' },
                  { id: 4, name: 'विक्रम थापा', role: 'प्रमुख शेफ, पोखरा', quote: 'मौसमी तरकारीहरू समयमै आइपुग्छन्। डेलिभरी छिटो र भरपर्दो छ।', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&q=80' },
                  { id: 5, name: 'मनिषा गुरुङ', role: 'कामकाजी आमा, विराटनगर', quote: 'घरमै बसेर ताजा तरकारी पाउनु कति राम्रो! किसानलाई पनि सिधै फाइदा पुग्छ।', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=150&q=80' },
                ].map((testimonial, idx) => (
                  selectedTestimonial === idx && (
                    <blockquote 
                      key={testimonial.id}
                      className="animate-fade-slide-in"
                    >
                      <p className="text-xl md:text-2xl font-serif italic text-gray-700 leading-relaxed mb-6">
                        {testimonial.quote}
                      </p>
                      
                      {/* Reviewer Attribution */}
                      <footer className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-500">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </footer>
                    </blockquote>
                  )
                ))}
              </div>
              
              {/* Navigation Dots */}
              <div className="flex gap-2 mt-8">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      selectedTestimonial === idx 
                        ? 'bg-primary-600 w-6' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Animation Styles */}
        <style>{`
          @keyframes fade-slide-in {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-slide-in {
            animation: fade-slide-in 0.5s ease-out forwards;
          }
        `}</style>
      </section>

      {/* Footer - Sharp */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2 pr-10">
                    <div className="flex items-center gap-2 mb-6">
                        {/* Sharp */}
                        <div className="w-10 h-10 bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                            <Leaf size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-gray-900">GAUHATT</span>
                    </div>
                    <p className="text-gray-500 text-base leading-relaxed max-w-sm mb-8">
                        Restoring the connection between people and the source of their food. Building a healthier, more sustainable future one harvest at a time.
                    </p>
                    <div className="flex gap-2 max-w-sm">
                        <input type="email" placeholder="Enter your email" className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <Button size="sm">Subscribe</Button>
                    </div>
                </div>
                
                {/* Footer Links */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-6">Company</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">Press</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-6">Help</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-primary-600 transition-colors">Support Center</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-primary-600 transition-colors">Contact Us</a></li>
                  </ul>
                </div>
                
            </div>
            
            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-sm text-gray-400">© 2024 Gauhatt. All rights reserved.</p>
               <div className="flex gap-6">
                 {/* Social Icons would go here */}
               </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;