import React, { useState } from 'react';
import { GoogleIcon } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { authAPI } from '../services/apiService';

interface SignupScreenProps {
  onComplete: () => void;
  onLogin: () => void;
}

const EkoLogoSmall: React.FC = () => (
    <div className="text-5xl font-bold font-poppins text-gray-100 mb-4">
        EKO
    </div>
);

const SignupScreen: React.FC<SignupScreenProps> = ({ onComplete, onLogin }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      // Use the authAPI service to make the signup request
      const response = await authAPI.register({ name, email, password });
      console.log('Signup successful:', response);
      
      // On success, proceed to the next screen in the app.
      onComplete();
    } catch (error) {
      // Handle signup failure
      console.error('Signup failed:', error);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1A2E27] text-white p-6">
      <div className="w-full max-w-sm text-center">
        <div className="animate-fade-in-up">
            <EkoLogoSmall />
            <h2 className="text-2xl font-bold font-poppins mb-2">{t('signup_create_account')}</h2>
            <p className="text-slate-300 mb-8">{t('signup_tagline')}</p>
        </div>
        
        <div 
            className="bg-[#121212] p-8 rounded-2xl shadow-2xl space-y-6 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
        >
            <input 
                type="text" 
                placeholder={t('fullname_placeholder')}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#008751]"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input 
                type="email" 
                placeholder={t('email_placeholder')}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#008751]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
             <input 
                type="password" 
                placeholder={t('password_placeholder')}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#008751]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleSignup}
              className="w-full bg-[#008751] hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg transform hover:scale-105"
            >
              {t('signup_button')}
            </button>
        </div>
        
        <p className="mt-8 text-slate-400 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {t('signup_has_account')} <button onClick={onLogin} className="font-bold text-[#F9B233] hover:underline">{t('signup_login_link')}</button>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;