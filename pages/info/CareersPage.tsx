import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Briefcase, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const CareersPage: React.FC = () => {
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
              <button onClick={() => navigate('/careers')} className="text-sm font-medium text-primary-600 border-b-2 border-primary-500 transition-colors">Careers</button>
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
          <Briefcase size={48} className="mx-auto text-primary-300 mb-6" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Careers at Gauhatt</h1>
          <p className="text-primary-100 text-lg">Help us build a fairer food system.</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-16">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">No Open Roles Currently</h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            We're currently not hiring, but we are always looking for passionate individuals who want to make a difference in local agriculture. Keep an eye on this page for future opportunities!
          </p>
          <div className="inline-flex items-center gap-2 text-primary-600 font-semibold border-b border-primary-600 pb-1 cursor-pointer hover:text-primary-700 hover:border-primary-700 transition-colors" onClick={() => navigate('/contact')}>
            Send us your resume anyway <ChevronRight size={16} />
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

export default CareersPage;
