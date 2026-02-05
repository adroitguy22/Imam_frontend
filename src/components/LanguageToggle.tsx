import { useTranslation } from '../i18n';
import { Languages, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const languageNames = {
  en: 'English',
  ar: 'عربي',
  ha: 'Hausa'
};

const languageNativeNames = {
  en: 'English',
  ar: 'العربية',
  ha: 'Hausa'
};

export const LanguageToggle = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = ['en', 'ar', 'ha'] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
      >
        <Languages size={18} />
        <span className="text-sm font-medium">{languageNames[language]}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  language === lang ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                {languageNativeNames[lang]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
