
import React from 'react';
import { GoogleIcon } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

interface LoginScreenProps {
  onComplete: () => void;
  onSignup: () => void;
}

const EkoLogoSmall: React.FC = () => (
    <div className="text-5xl font-bold font-poppins text-gray-100 mb-4">
        EKO
    </div>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onComplete, onSignup }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1A2E27] text-white p-6">
      <div className="w-full max-w-sm text-center">
        <EkoLogoSmall />
        <h2 className="text-2xl font-bold font-poppins mb-2">{t('login_welcome')}</h2>
        <p className="text-slate-300 mb-8">{t('login_tagline')}</p>
        
        <div className="bg-[#121212] p-8 rounded-2xl shadow-2xl space-y-6">
            <input 
                type="email" 
                placeholder={t('email_placeholder')}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#008751]"
            />
             <input 
                type="password" 
                placeholder={t('password_placeholder')}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#008751]"
            />
            <button
              onClick={onComplete}
              className="w-full bg-[#008751] hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg transform hover:scale-105"
            >
              {t('login_button')}
            </button>
             <div className="flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400">{t('or_divider')}</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
             <button
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              {t('login_google')}
            </button>
        </div>
        
        <p className="mt-8 text-slate-400">
            {t('login_no_account')} <button onClick={onSignup} className="font-bold text-[#F9B233] hover:underline">{t('login_signup_link')}</button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
