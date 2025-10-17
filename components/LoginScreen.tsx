
import React, { useState } from 'react';
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    // In a real application, this would trigger the Google OAuth flow.
    // The frontend would receive an authentication token from Google.
    const googleAuthToken = 'mock-google-auth-token'; // This is a placeholder.

    try {
        // The frontend then sends this token to your backend API.
        const response = await fetch('/api/auth/google', { // NOTE: This is a placeholder endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: googleAuthToken }),
        });

        if (response.ok) {
            // The backend verifies the token with Google, creates a user session,
            // and might return user data or a session token (e.g., JWT).
            // const data = await response.json(); 
            // console.log('Backend login successful:', data);
            
            // On success, proceed to the next screen in the app.
            onComplete();
        } else {
            // Handle login failure from the backend
            alert('Google login failed. Please try again.');
        }
    } catch (error) {
        // This catch block handles network errors, e.g., if the backend is down.
        // Since the backend doesn't exist in this environment, the fetch will fail.
        // We will log a warning and proceed to the next screen to ensure the app is usable.
        console.warn('Could not connect to backend for Google sign-in. Simulating successful login.');
        
        // Simulate a small delay for user experience before proceeding
        await new Promise(resolve => setTimeout(resolve, 1000));
        onComplete();
    } finally {
        setIsGoogleLoading(false);
    }
  };


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
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-wait"
            >
              {isGoogleLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                  <GoogleIcon className="w-5 h-5 mr-2" />
              )}
              {isGoogleLoading ? t('login_google_loading') : t('login_google')}
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
