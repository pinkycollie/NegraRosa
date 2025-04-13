import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, VerificationTranslations, translations, defaultLanguage } from './translations';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: VerificationTranslations;
  availableLanguages: SupportedLanguage[];
  languageNames: Record<SupportedLanguage, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: SupportedLanguage;
}

// Language names in their native script
const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  zh: '中文',
  ar: 'العربية',
  hi: 'हिन्दी',
  ru: 'Русский',
  pt: 'Português',
  ja: '日本語',
  bn: 'বাংলা',
  sw: 'Kiswahili',
  ko: '한국어',
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  initialLanguage = defaultLanguage
}) => {
  // Initialize from localStorage if available, otherwise use initialLanguage
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('verificationLanguage');
      if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
        return savedLanguage as SupportedLanguage;
      }
    }
    return initialLanguage;
  });

  // Get translations for current language
  const t = translations[currentLanguage];
  
  // All available languages
  const availableLanguages = Object.keys(translations) as SupportedLanguage[];

  // Set language function - also saves to localStorage
  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('verificationLanguage', language);
    }
    
    // Set HTML lang attribute for screen readers and accessibility
    document.documentElement.lang = language;
    
    // For RTL languages like Arabic, set the dir attribute
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  // Effect to set the HTML lang attribute on initial load
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    if (currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      t, 
      availableLanguages,
      languageNames 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// HOC to wrap components that need translations
export function withTranslation<P extends object>(
  Component: React.ComponentType<P & { t: VerificationTranslations }>
) {
  return (props: P) => {
    const { t } = useLanguage();
    return <Component {...props} t={t} />;
  };
}