import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, Database, Lock, UserCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const PrivacyPolicyPage: React.FC = () => {
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
              <button onClick={() => navigate('/stories')} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Stories</button>
              <button onClick={() => navigate('/privacy')} className="text-sm font-medium text-primary-600 border-b-2 border-primary-500 transition-colors">Privacy</button>
              <button onClick={() => navigate('/terms')} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Terms</button>
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
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500 rounded-full blur-[80px] opacity-50 -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative z-10 text-center max-w-2xl">
          <ShieldCheck size={48} className="mx-auto text-primary-300 mb-6" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-primary-100 text-lg">Last updated: October 20, 2024</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-12">
          
          <section className="prose prose-lg max-w-none text-gray-600">
            <p className="text-xl leading-relaxed text-gray-800 font-medium mb-8">
              At Gauhatt, we believe that trust is the foundation of every strong community. 
              Just as we prioritize transparency in where our food comes from, we are committed 
              to being fully transparent about how we collect, use, and protect your personal information.
            </p>

            <div className="flex items-start gap-4 mb-6 group">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-600 shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 mt-1">1. Information We Collect</h2>
                <p>We collect information necessary to connect you with local farmers and facilitate a seamless marketplace experience. This includes:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-primary-500">
                  <li><strong>Account Details:</strong> Name, email address, phone number, and delivery address.</li>
                  <li><strong>Payment Information:</strong> Processed securely via our payment partners; we do not store full credit card numbers.</li>
                  <li><strong>Transaction History:</strong> Details of the farm produce you purchase to improve your recommendations.</li>
                  <li><strong>Location Data:</strong> Used to calculate the "farm-origin" badge distance and ensure freshness.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6 mt-12 group">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-600 shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                <UserCheck size={24} />
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 mt-1">2. How We Use Your Data</h2>
                <p className="mb-6">Your data is used strictly to enhance your "Farm to Table" experience:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                      Order Fulfillment
                    </h4>
                    <p className="text-sm text-gray-600 m-0">Ensuring your farm-fresh goods arrive promptly and accurately at your doorstep.</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                      Personalized Curation
                    </h4>
                    <p className="text-sm text-gray-600 m-0">Tailoring the marketplace to highlight seasonal produce and farms that match your preferences.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6 mt-12 group">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-600 shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 mt-1">3. Data Security & Sharing</h2>
                <p>
                  We employ industry-standard security measures to protect your data. We do not sell your personal information to third parties. Data is only shared with trusted farm partners necessary for fulfilling your specific orders.
                </p>
                {/* Visual Decorative Banner */}
                <div className="mt-8 rounded-xl overflow-hidden shadow-inner bg-primary-700 relative h-32 flex items-center justify-center border border-primary-600">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                  <p className="relative z-10 text-white font-serif italic text-xl px-6 text-center">
                    "Transparency in our sourcing, privacy in your data."
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6 mt-12 group">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-600 shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                <Leaf size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 mt-1">4. Your Rights</h2>
                <p className="mb-6">
                  You hold the right to access, correct, or delete your personal data at any time. If you wish to exercise these rights or have any questions about this policy, please reach out to our community support team.
                </p>
                <button onClick={() => navigate('/contact')} className="px-6 py-2.5 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
                  Contact Support
                </button>
              </div>
            </div>

          </section>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf size={20} className="text-primary-600" />
            <span className="font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-medium">
            <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Home</button>
            <button onClick={() => navigate('/discover-products')} className="hover:text-primary-600 transition-colors">Shop</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-primary-600 transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-primary-600 transition-colors">Terms of Service</button>
            <button onClick={() => navigate('/contact')} className="hover:text-primary-600 transition-colors">Contact</button>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Gauhatt. Seeded in Community.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
