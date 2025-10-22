


import React, { useState, useEffect } from 'react';
import { Screen, Settings } from './types';
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


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    theme: 'Dark',
    language: 'English',
    mapSource: 'OpenStreetMap'
  });

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
        return <SettingsScreen onMenuClick={() => setIsSidebarOpen(true)} settings={settings} setSettings={setSettings} />;
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
          />
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;