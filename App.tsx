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
import { authAPI, userAPI } from './services/apiService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    theme: 'Dark',
    language: 'English',
    mapSource: 'OpenStreetMap'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Check if user is already authenticated and fetch profile
  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const token = localStorage.getItem('ekoToken');
      console.log('Checking authentication token:', token);
      if (token) {
        setIsAuthenticated(true);
        // Fetch user profile
        await fetchUserProfile();
      }
    };
    
    checkAuthAndFetchProfile();
  }, []);

  const fetchUserProfile = async () => {
    // Prevent multiple simultaneous fetches
    if (isProfileLoading) return;
    
    try {
      setIsProfileLoading(true);
      console.log('Fetching user profile...');
      const profile = await userAPI.getProfile();
      console.log('User profile fetched:', profile);
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      // If we can't fetch profile, logout user
      handleLogout();
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Refetch profile when isAuthenticated changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentScreen === Screen.Splash) {
      const timer = setTimeout(() => {
        // If user is authenticated, go to home screen, otherwise go to login
        setCurrentScreen(isAuthenticated ? Screen.Home : Screen.Login);
      }, 2500); // Splash screen duration
      return () => clearTimeout(timer);
    }
  }, [currentScreen, isAuthenticated]);
  
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

  const handleLoginComplete = () => {
    console.log('Login completed, fetching user profile...');
    setIsAuthenticated(true);
    // Fetch user profile after login
    fetchUserProfile();
    setCurrentScreen(Screen.Permissions);
  };

  const handleSignupComplete = () => {
    console.log('Signup completed, fetching user profile...');
    setIsAuthenticated(true);
    // Fetch user profile after signup
    fetchUserProfile();
    setCurrentScreen(Screen.Permissions);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    authAPI.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setCurrentScreen(Screen.Login);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Splash:
        return <SplashScreen />;
      case Screen.Onboarding:
        return <OnboardingScreen onComplete={() => setCurrentScreen(Screen.Login)} />;
      case Screen.Login:
        return <LoginScreen onSignup={() => setCurrentScreen(Screen.Signup)} onComplete={handleLoginComplete} />;
      case Screen.Signup:
        return <SignupScreen onLogin={() => setCurrentScreen(Screen.Login)} onComplete={handleSignupComplete} />;
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

  // Log when userProfile changes
  useEffect(() => {
    console.log('User profile updated:', userProfile);
  }, [userProfile]);

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