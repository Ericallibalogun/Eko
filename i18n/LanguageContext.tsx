
import React, { createContext, useContext, useState, useMemo } from 'react';
import { translations } from './translations';
import type { Settings } from '../types';

type Language = Settings['language'];

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: keyof typeof translations.English) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ 
    children: React.ReactNode;
    value: Language;
    setValue: (lang: Language) => void;
}> = ({ children, value, setValue }) => {
    
    const t = useMemo(() => (key: keyof typeof translations.English): string => {
        return translations[value][key] || translations['English'][key] || key;
    }, [value]);

    return (
        <LanguageContext.Provider value={{ language: value, setLanguage: setValue, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
