import React, { useState, useEffect } from 'react';
import { Screen, Settings, UserProfile } from './types';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import PermissionsScreen from './components/PermissionsScreen';
import HomeScreen from './components/HomeScreen';
import Sidebar from './components/Sidebar';
import ExploreScreen from './components/ExploreScreen';
import FavoritesScreen from './components/FavoritesScreen';
import SettingsScreen from './components/SettingsScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import ARScreen from './components/ARScreen';
import { LanguageProvider } from './i18n/LanguageContext';
import { userAPI } from './services/apiService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    theme: 'Dark',
    language: 'English',
    mapSource: 'OpenStreetMap'
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (currentScreen === Screen.Splash) {
      const timer = setTimeout(() => {
        setCurrentScreen(Screen.Onboarding);
      }, 2500); // Splash screen duration
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);
  
  useEffect(() => {
    const body = document.body;
    if (settings.theme === 'Light') {
      body.classList.remove('dark');
      body.style.backgroundColor = '#F3F4F6';
    } else {
      body.classList.add('dark');
      body.style.backgroundColor = '#121212';
    }
  }, [settings.theme])

  // Fetch user profile when user logs in
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Only fetch if we're past the login screen and have a token
        if (![Screen.Splash, Screen.Onboarding, Screen.Login, Screen.Signup].includes(currentScreen)) {
          const profile = await userAPI.getProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // If we can't fetch the profile, we might want to redirect to login
        // setCurrentScreen(Screen.Login);
      }
    };

    fetchUserProfile();
  }, [currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Splash:
        return <SplashScreen />;
      case Screen.Onboarding:
        return <OnboardingScreen onComplete={() => setCurrentScreen(Screen.Login)} />;
      case Screen.Login:
        return <LoginScreen onSignup={() => setCurrentScreen(Screen.Signup)} onComplete={() => setCurrentScreen(Screen.Permissions)} />;
      case Screen.Signup:
        return <SignupScreen onLogin={() => setCurrentScreen(Screen.Login)} onComplete={() => setCurrentScreen(Screen.Permissions)} />;
      case Screen.Permissions:
        return <PermissionsScreen onComplete={() => setCurrentScreen(Screen.Home)} />;
      case Screen.Home:
        return <HomeScreen onMenuClick={() => setIsSidebarOpen(true)} onNavigate={setCurrentScreen} mapSource={settings.mapSource} />;
       case Screen.Explore:
        return <ExploreScreen onMenuClick={() => setIsSidebarOpen(true)} />;
       case Screen.Favorites:
        return <FavoritesScreen onMenuClick={() => setIsSidebarOpen(true)} />;
       case Screen.Settings:
        return <SettingsScreen onMenuClick={() => setIsSidebarOpen(true)} settings={settings} setSettings={setSettings} userProfile={userProfile} />;
       case Screen.AR:
        return <ARScreen onExit={() => setCurrentScreen(Screen.Home)} />;
      default:
        return <HomeScreen onMenuClick={() => setIsSidebarOpen(true)} onNavigate={setCurrentScreen} mapSource={settings.mapSource} />;
    }
  };
  
  const showSidebar = ![Screen.Splash, Screen.Onboarding, Screen.Permissions, Screen.Login, Screen.Signup, Screen.AR].includes(currentScreen);

  return (
    <LanguageProvider value={settings.language} setValue={(lang) => setSettings(s => ({...s, language: lang}))}>
      <div className="h-screen w-screen overflow-hidden">
        {renderScreen()}
        {showSidebar && (
          <Sidebar 
              isOpen={isSidebarOpen} 
              onClose={() => setIsSidebarOpen(false)}
              onNavigate={(screen) => setCurrentScreen(screen)}
              currentScreen={currentScreen}
              userProfile={userProfile}
          />
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;