import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, MapPin, Mail, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ContactUsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Order Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
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
              <button onClick={() => navigate('/privacy')} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Privacy</button>
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

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700 mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Whether you have a question about our local farm partners, need assistance with an order, or simply want to share a recipe, we're here to listen. We love hearing from our community!
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Contact Info & Image */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-primary-50">
              <h2 className="text-2xl font-serif font-bold text-primary-700 mb-8">Direct Contact</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start group">
                  <div className="bg-primary-50 p-3 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Headquarters</h3>
                    <p className="text-gray-600 text-sm">123 Harvest Way<br/>Kathmandu, Bagmati 44600</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="bg-primary-50 p-3 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600 text-sm">hello@gauhatt.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="bg-primary-50 p-3 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm">+977 1-4567890<br/>Mon-Fri, 9am - 5pm NPT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Image Banner */}
            <div className="relative rounded-2xl overflow-hidden h-64 shadow-md group">
              <img 
                src="https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop" 
                alt="Farm landscape" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                 <p className="text-white font-serif text-xl font-bold">Farm to Table</p>
                 <p className="text-white/80 text-sm mt-1">Supporting local agriculture.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-8 md:p-12 shadow-xl shadow-primary-500/5 border border-primary-50 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Message Sent!</h2>
                  <p className="text-gray-600 max-w-sm mb-8">Thank you for reaching out to Gauhatt. Our team will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-primary-50 text-primary-700 font-bold rounded-xl hover:bg-primary-100 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-serif font-bold text-primary-700 mb-8">Send an Inquiry</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">First Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                          placeholder="Jane"
                          value={formState.firstName}
                          onChange={e => setFormState({...formState, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Last Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                          placeholder="Doe"
                          value={formState.lastName}
                          onChange={e => setFormState({...formState, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder="jane@example.com"
                        value={formState.email}
                        onChange={e => setFormState({...formState, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Subject</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none appearance-none"
                        value={formState.subject}
                        onChange={e => setFormState({...formState, subject: e.target.value})}
                      >
                        <option value="Order Inquiry">Order Inquiry</option>
                        <option value="Farm Partnership">Farm Partnership</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Message</label>
                      <textarea 
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                        placeholder="How can we help you today?"
                        value={formState.message}
                        onChange={e => setFormState({...formState, message: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all active:scale-95 group"
                    >
                      Send Message
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
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

export default ContactUsPage;
