
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const EkoLogo: React.FC = () => (
    <div className="relative text-7xl font-bold font-poppins">
        <span className="absolute -inset-1 bg-gradient-to-r from-[#008751] to-[#F9B233] rounded-lg blur opacity-75 animate-pulse"></span>
        <div className="relative px-7 py-4 bg-[#121212] rounded-lg leading-none flex items-center">
            <span className="text-gray-100">EKO</span>
        </div>
    </div>
);

const SplashScreen: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const timer = setTimeout(() => {
             setProgress(100);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white animate-fade-in">
            <EkoLogo />
            <p className="mt-6 text-slate-300">{t('splash_tagline')}</p>
            <div className="w-1/3 h-1 mt-4 bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-[#008751] to-[#F9B233] transition-all duration-[2000ms] ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default SplashScreen;