import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="fixed bottom-4 right-4 z-[100] inline-flex items-center gap-2 rounded-full
                 border border-gray-200 bg-white/95 px-3 py-2 text-sm font-semibold text-gray-700
                 shadow-lg shadow-gray-900/10 backdrop-blur transition-all duration-200
                 hover:scale-105 hover:border-primary-300 hover:text-primary-700"
      aria-label={language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
      title={language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
    >
      <Languages className="h-4 w-4" />
      <span>{language === 'en' ? 'EN -> ने' : 'ने -> EN'}</span>
    </button>
  );
};

export default LanguageToggle;
