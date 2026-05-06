import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, HelpCircle, Search, Book, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const SupportCenterPage: React.FC = () => {
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
              <button onClick={() => navigate('/support')} className="text-sm font-medium text-primary-600 border-b-2 border-primary-500 transition-colors">Support</button>
              <button onClick={() => navigate('/contact')} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Contact</button>
            </div>

            <div className="flex items-center space-x-4">
               <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner with Search */}
      <div className="w-full bg-primary-700 relative py-24 px-4 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500 rounded-full blur-[80px] opacity-50 -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative z-10 max-w-2xl w-full">
          <HelpCircle size={48} className="mx-auto text-primary-300 mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">How can we help?</h1>
          
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search for articles, guides, or FAQs..." 
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 border-none focus:ring-4 focus:ring-primary-500/30 outline-none shadow-lg text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer group">
            <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
              <Book size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Knowledge Base</h3>
            <p className="text-gray-600">Browse our comprehensive guides on ordering, returns, and connecting with farmers.</p>
          </div>

          <div 
            onClick={() => navigate('/contact')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer group"
          >
            <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-600">Can't find what you're looking for? Reach out to our dedicated support team directly.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
                <div className="pb-6 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">How do I track my delivery?</h4>
                    <p className="text-gray-600">Once your order is dispatched by the farmer, you will receive a notification with live tracking information in your dashboard.</p>
                </div>
                <div className="pb-6 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">What happens if my produce is damaged?</h4>
                    <p className="text-gray-600">We have a strict freshness guarantee. Please take a photo of the damaged goods and contact support within 24 hours for a refund or replacement.</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-2">How do I become a seller?</h4>
                    <p className="text-gray-600">Navigate to our Farmer Registration page via the main navigation to submit your farm's details for verification.</p>
                </div>
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

export default SupportCenterPage;
