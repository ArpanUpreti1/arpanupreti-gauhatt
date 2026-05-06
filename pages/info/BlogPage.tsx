import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/85 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-primary-500 flex items-center justify-center text-white rounded-lg shadow-lg shadow-primary-500/30">
                <Leaf size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-primary-500 tracking-tight">GAUHATT</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/discover-products')} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Shop</button>
              <button onClick={() => navigate('/about')} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">About Us</button>
              <button onClick={() => navigate('/blog')} className="text-sm font-medium text-primary-600 border-b-2 border-primary-500 transition-colors">Blog</button>
            </div>

            <div className="flex items-center space-x-4">
               <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="w-full bg-primary-700 relative py-20 px-4 overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500 rounded-full blur-[80px] opacity-50 -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative z-10 text-center max-w-2xl">
          <FileText size={48} className="mx-auto text-primary-300 mb-6" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Gauhatt Blog</h1>
          <p className="text-primary-100 text-lg">Stories, recipes, and farm-fresh news.</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-16 relative overflow-hidden">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">The harvest is coming soon</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
                We're currently writing our first few articles. From seasonal recipes to spotlighting our amazing farm partners, there's a lot to share. Check back soon for fresh content!
            </p>
            <button onClick={() => navigate('/stories')} className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md group">
                Read Farm Stories <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf size={20} className="text-primary-600" />
            <span className="font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Gauhatt. Seeded in Community.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
