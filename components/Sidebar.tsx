

import React from 'react';
import { Screen, UserProfile } from '../types';
import { HomeIcon, CompassIcon, StarIcon, ClockIcon, SettingsIcon, InfoIcon, XIcon } from './Icons';
import { USER_PROFILE } from '../constants';
import { useLanguage } from '../i18n/LanguageContext';
import Avatar from './Avatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <li
      onClick={onClick}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive ? 'bg-[#008751] text-white shadow-md' : 'text-slate-300 hover:bg-gray-700/50'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </li>
);


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentScreen }) => {
    const { t } = useLanguage();
    
    const handleNavigation = (screen: Screen) => {
        onNavigate(screen);
        onClose();
    }
    
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#1A2E27] text-white p-6 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold font-poppins">{t('sidebar_eko_nav')}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700/50">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="flex items-center p-3 bg-gray-900/50 rounded-lg mb-8">
            <Avatar src={USER_PROFILE.avatarUrl} alt="User" className="w-12 h-12 rounded-full border-2 border-[#008751]" />
            <div className="ml-3">
                <p className="font-bold">{USER_PROFILE.name}</p>
                <p className="text-sm text-slate-400">{t('sidebar_welcome_user')}</p>
            </div>
        </div>

        <nav>
          <ul>
            <NavItem icon={<HomeIcon className="w-6 h-6"/>} label={t('sidebar_home')} isActive={currentScreen === Screen.Home} onClick={() => handleNavigation(Screen.Home)} />
            <NavItem icon={<CompassIcon className="w-6 h-6"/>} label={t('sidebar_explore')} isActive={currentScreen === Screen.Explore} onClick={() => handleNavigation(Screen.Explore)} />
            <NavItem icon={<StarIcon className="w-6 h-6"/>} label={t('sidebar_favorites')} isActive={currentScreen === Screen.Favorites} onClick={() => handleNavigation(Screen.Favorites)} />
            <NavItem icon={<SettingsIcon className="w-6 h-6"/>} label={t('sidebar_settings')} isActive={currentScreen === Screen.Settings} onClick={() => handleNavigation(Screen.Settings)} />
          </ul>
        </nav>
        
        <div className="absolute bottom-6 left-6 text-slate-500 text-xs">
            <p>EKO v1.0</p>
            <p>&copy; 2024 Made with ❤️ in Nigeria.</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;