import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AuthService, storeAuthData, LocationUtils } from '../../services/api';
import ParticleBackground from '../../components/ParticleBackground';
import LocationPromptModal from '../../components/LocationPromptModal';
import { UserRole, User, UserLocation } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const navigateByRole = (role: UserRole) => {
    switch (role) {
      case UserRole.CONSUMER:
        navigate('/home');
        break;
      case UserRole.FARMER:
        navigate('/farmer');
        break;
      case UserRole.ADMIN:
        navigate('/admin');
        break;
      case UserRole.DELIVERY_PERSON:
        navigate('/delivery');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      const response = await AuthService.login(email, password);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed");
      }

      // Store auth data
      storeAuthData(response.data);

      const user = response.data.user;
      setLoggedInUser(user);

      // Check if user has location set (from server response or localStorage)
      const hasServerLocation = user.latitude && user.longitude;
      const savedLocation = LocationUtils.getSavedLocation();
      
      // Show location prompt if user doesn't have location and is not admin
      if (!hasServerLocation && !savedLocation && user.role !== UserRole.ADMIN) {
        setShowLocationPrompt(true);
      } else {
        // Navigate directly if location already exists
        navigateByRole(user.role);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSet = (location: UserLocation) => {
    console.log('Location set:', location);
    // Navigate after location is set
    if (loggedInUser) {
      navigateByRole(loggedInUser.role);
    }
  };

  const handleLocationSkip = () => {
    setShowLocationPrompt(false);
    // Navigate even if skipped
    if (loggedInUser) {
      navigateByRole(loggedInUser.role);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      <ParticleBackground />

      {/* Top Navigation / Logo */}
      <div className="absolute top-0 left-0 w-full p-6 z-20">
        <div className="inline-flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
            <Leaf size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white shadow-lg w-full max-w-md p-8 sm:p-10 animate-fade-in-up border border-gray-100 z-10 relative mt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{t('auth.welcomeBack', 'Welcome Back!')}</h2>
          <p className="text-gray-500 text-sm">{t('auth.enterCredentials', 'Enter your credentials to access your account.')}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={t('auth.emailOrUsername', 'Email or Username')}
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder={t('auth.password', 'Password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {t('auth.forgotPassword', 'Forgot Password?')}
            </button>
          </div>

          <Button
            type="submit"
            fullWidth
            className="mt-2"
            isLoading={loading}
          >
            {t('auth.login', 'Login')}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 uppercase">OR</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/register')}
          className="w-full py-3 border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex justify-center items-center shadow-sm"
        >
          {t('auth.createAccount', 'Create an account')}
        </button>

        <div className="mt-8 text-center text-xs text-gray-400">
          {t('auth.termsPrefix', "By continuing, you agree to GAUHATT's")} <span className="text-primary-600 cursor-pointer">{t('auth.terms', 'Terms of Service')}</span> {t('auth.and', 'and')} <span className="text-primary-600 cursor-pointer">{t('auth.privacy', 'Privacy Policy')}</span>.
        </div>
      </div>

      {/* Location Prompt Modal */}
      <LocationPromptModal
        isOpen={showLocationPrompt}
        onClose={handleLocationSkip}
        onLocationSet={handleLocationSet}
        userRole={loggedInUser?.role}
      />
    </div>
  );
};

export default Login;
