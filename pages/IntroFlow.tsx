import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import ParticleBackground from '../components/ParticleBackground';

const slides = [
  {
    // Nepali market/vegetables
    image: 'https://images.unsplash.com/photo-1605335500609-b687f277c15e?q=80&w=1500&auto=format&fit=crop', 
    title: 'Welcome to GAUHATT',
    subtitle: 'Farm to Table',
    description: 'Discover the freshest produce directly from local farmers in Nepal. Connect to a vibrant community making healthy eating easy and sustainable.'
  },
  {
    // Nepali/Asian Farmer
    image: 'https://images.unsplash.com/photo-1544712061-68783457193f?q=80&w=1500&auto=format&fit=crop', 
    title: 'Support Local Farmers',
    subtitle: 'Fair & Direct',
    description: 'By cutting out the middlemen, we ensure farmers in the hills and terai get fair prices. Join us in creating a sustainable ecosystem.'
  },
  {
    // Delivery / Transport in context
    image: 'https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1500&auto=format&fit=crop', 
    title: 'Quality You Can Trust',
    subtitle: 'Freshness Guaranteed',
    description: 'Every item is quality checked before it reaches your kitchen. We guarantee freshness and purity, delivered right to your doorstep.'
  }
];

const IntroFlow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Initial Entrance Animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(".intro-card", 
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(".intro-img-container",
      { scale: 1.2, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
      "-=0.8"
    )
    .fromTo([".intro-subtitle", ".intro-title", ".intro-desc", ".intro-actions"],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" },
      "-=0.6"
    );

    // Background Blob Animation (Keep blobs organic for contrast, or hide them for strict sharp theme? keeping for depth)
    gsap.to(".blob-1", {
      x: "100px",
      y: "-50px",
      rotation: 90,
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(".blob-2", {
      x: "-80px",
      y: "60px",
      rotation: -60,
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  const changeSlide = (direction: 'next' | 'prev' = 'next') => {
    if (isAnimating) return;
    
    let nextIndex = currentSlide;
    if (direction === 'next') {
        if (currentSlide === slides.length - 1) {
            navigate('/');
            return;
        }
        nextIndex = currentSlide + 1;
    } else {
        if (currentSlide === 0) return;
        nextIndex = currentSlide - 1;
    }

    setIsAnimating(true);

    const tl = gsap.timeline({
        onComplete: () => {
            setCurrentSlide(nextIndex);
            setIsAnimating(false);
        }
    });

    // Content Exit
    tl.to([".intro-subtitle", ".intro-title", ".intro-desc"], {
        y: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.in"
    })
    // Image Exit
    .to(".intro-img", {
        scale: 1.1,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
    }, "<")
    
    .call(() => {
        setCurrentSlide(nextIndex);
    })

    // Image Enter
    .fromTo(".intro-img", 
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }
    )
    // Content Enter
    .fromTo([".intro-subtitle", ".intro-title", ".intro-desc"], 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" },
        "-=0.4"
    );
  };

  const handleSkip = () => {
    gsap.to(".intro-card", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        onComplete: () => navigate('/')
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <ParticleBackground />

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob-1 absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/60 rounded-none blur-[80px] mix-blend-multiply opacity-70"></div>
        <div className="blob-2 absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-yellow-100/60 rounded-none blur-[80px] mix-blend-multiply opacity-70"></div>
      </div>

      {/* Main Card - Removed rounded-2.5rem */}
      <div className="intro-card bg-white/80 backdrop-blur-xl shadow-2xl w-full max-w-5xl h-[85vh] max-h-[700px] flex flex-col md:flex-row overflow-hidden relative z-10 border border-white/50">
        
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-gray-100">
           <div className="intro-img-container w-full h-full relative">
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 md:hidden"></div>
               <img 
                 key={currentSlide}
                 src={slides[currentSlide].image} 
                 alt={slides[currentSlide].title} 
                 className="intro-img w-full h-full object-cover transition-transform duration-700"
               />
           </div>
           
           {/* Mobile Only: Progress Overlay */}
           <div className="absolute bottom-6 left-6 z-20 md:hidden flex gap-2">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                    ></div>
                ))}
           </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-16 flex flex-col justify-center relative">
          
          <div ref={contentRef} className="flex-1 flex flex-col justify-center">
            <span className="intro-subtitle text-primary-600 font-bold tracking-wider uppercase text-xs md:text-sm mb-4 block">
                {slides[currentSlide].subtitle}
            </span>
            <h2 className="intro-title text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="intro-desc text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* Navigation Area */}
          <div className="intro-actions flex items-center justify-between mt-auto pt-8 border-t border-gray-100">
            {/* Desktop Progress Bars (Sharp) */}
            <div className="hidden md:flex gap-3">
                {slides.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => {
                            if (idx !== currentSlide && !isAnimating) {
                                setCurrentSlide(idx);
                            }
                        }}
                        className={`h-2 transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-primary-600' : 'w-2 bg-gray-200 hover:bg-primary-300'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            <div className="flex items-center gap-6 ml-auto w-full md:w-auto justify-between md:justify-end">
                <button 
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-900 font-medium text-sm transition-colors px-2 py-2"
                >
                    Skip
                </button>
                
                <button 
                    onClick={() => changeSlide('next')}
                    // Removed rounded-full
                    className="group relative flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1 active:translate-y-0"
                >
                    <span className="font-medium text-base">
                        {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                    </span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IntroFlow;