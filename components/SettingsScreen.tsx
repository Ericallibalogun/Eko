import React, { useState, useEffect } from 'react';
import { MenuIcon, ChevronDownIcon } from './Icons';
import { USER_PROFILE, SETTINGS_CONFIG } from '../constants';
import type { SettingsSection, Settings, UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';
import Avatar from './Avatar';
import { userAPI } from '../services/apiService';

interface SettingsScreenProps {
    onMenuClick: () => void;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    userProfile?: UserProfile | null;
}

const SelectInput: React.FC<{ 
    options: string[],
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ options, value, onChange }) => (
    <div className="relative">
        <select value={value} onChange={onChange} className="w-full bg-gray-700 text-white p-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#008751]">
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDownIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
);


const SettingsSectionComponent: React.FC<{ 
    section: SettingsSection,
    settings: Settings,
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    onSettingChange: (key: keyof Settings, value: string) => void;
}> = ({ section, settings, setSettings, onSettingChange }) => {
    const { t } = useLanguage();
    
    const getLabel = (key: keyof Settings) => {
        const keyMap: Record<keyof Settings, keyof typeof translations.English> = {
            theme: 'settings_theme',
            language: 'settings_language',
            mapSource: 'settings_map_source'
        }
        return t(keyMap[key]);
    }

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-400 mb-4 px-2">{t('settings_preferences')}</h3>
            <div className="bg-gray-800/50 rounded-lg">
                {section.items.map((item, index) => (
                    <div key={item.label} className={`flex items-center justify-between p-4 ${index < section.items.length - 1 ? 'border-b border-gray-700' : ''}`}>
                        <label className="text-white">{getLabel(item.key)}</label>
                        {item.type === 'select' && item.options && (
                            <div className="w-40">
                                <SelectInput 
                                    options={item.options} 
                                    value={settings[item.key]}
                                    onChange={(e) => {
                                        const newValue = e.target.value as any;
                                        setSettings(s => ({...s, [item.key]: newValue}));
                                        onSettingChange(item.key, newValue);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onMenuClick, settings, setSettings, userProfile }) => {
    const { t } = useLanguage();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Use the passed userProfile or fallback to the default USER_PROFILE
    const displayUser = userProfile || USER_PROFILE;
    
    // Function to handle setting changes and save to backend
    const handleSettingChange = async (key: keyof Settings, value: string) => {
        try {
            setError('');
            setSuccess('');
            
            // Create settings object with only the changed setting
            const settingsUpdate = { [key]: value };
            
            // Save to backend
            await userAPI.updateSettings(settingsUpdate);
            
            setSuccess('Settings saved successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
        }
    };
    
    // Function to handle logout
    const handleLogout = () => {
        // Clear token from localStorage
        localStorage.removeItem('ekoToken');
        // Redirect to login screen (this would need to be handled by the parent component)
        window.location.reload();
    };

    return (
        <div className="bg-[#121212] min-h-screen text-white">
            <header className="sticky top-0 bg-[#121212]/80 backdrop-blur-md p-4 z-10 flex items-center justify-between text-white">
                <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-700/50">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold font-poppins">{t('settings_header')}</h1>
                 <button className="p-2 rounded-full hover:bg-gray-700/50">
                   <Avatar src={displayUser.avatarUrl} alt="user" className="w-8 h-8 rounded-full" />
                </button>
            </header>

            <div className="p-4">
                {error && (
                    <div className="mb-4 p-2 bg-red-500 text-white rounded">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-2 bg-green-500 text-white rounded">
                        {success}
                    </div>
                )}
                
                {/* Account Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2">{t('settings_account')}</h3>
                    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <Avatar src={displayUser.avatarUrl} alt="User" className="w-16 h-16 rounded-full border-2 border-[#008751]" />
                            <div className="ml-4">
                                <p className="font-bold text-xl">{displayUser.name}</p>
                                <p className="text-sm text-slate-400">{displayUser.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-600/80 hover:bg-red-700/80 text-white font-bold py-2 px-4 rounded-lg transition">
                            {t('settings_logout')}
                        </button>
                    </div>
                </div>

                {/* Settings */}
                {SETTINGS_CONFIG.map(section => (
                    <SettingsSectionComponent 
                        key={section.title} 
                        section={section} 
                        settings={settings} 
                        setSettings={setSettings}
                        onSettingChange={handleSettingChange}
                    />
                ))}

                 {/* About Section */}
                <div className="text-center text-slate-500 text-sm mt-12">
                    <p>EKO Navigation v1.0</p>
                    <p>Made with ❤️ in Nigeria.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;