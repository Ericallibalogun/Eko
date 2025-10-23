
import React, { useState } from 'react';
import { LockIcon, MapPinIcon, CameraIcon } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

interface PermissionsScreenProps {
  onComplete: () => void;
}

const PermissionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonText: string;
    onAllow: () => void;
    isAllowed: boolean;
}> = ({ icon, title, description, buttonText, onAllow, isAllowed }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-[#1A2E27]/80 border border-green-900/50 p-6 rounded-2xl shadow-lg w-full mb-6">
            <div className="flex items-center mb-4">
                <div className="bg-[#008751]/30 p-3 rounded-full mr-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold font-poppins">{title}</h3>
            </div>
            <p className="text-slate-300 mb-6">{description}</p>
            <button 
                onClick={onAllow} 
                disabled={isAllowed}
                className="w-full bg-[#008751] hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isAllowed ? t('permissions_allowed') : buttonText}
            </button>
        </div>
    );
};


const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onComplete }) => {
    const [locationAllowed, setLocationAllowed] = useState(false);
    const [storageAllowed, setStorageAllowed] = useState(false);
    const [cameraAllowed, setCameraAllowed] = useState(false);
    const { t } = useLanguage();

    const handleLocation = () => {
        navigator.geolocation.getCurrentPosition(
            () => setLocationAllowed(true),
            (error) => {
                // Silently handle denial, user can proceed without this permission.
                console.warn(`Location access denied: ${error.message}`);
                setLocationAllowed(false);
            }
        );
    };

    const handleStorage = async () => {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persist();
                if (isPersisted) {
                    setStorageAllowed(true);
                } else {
                    console.warn("Persistent storage permission denied.");
                    setStorageAllowed(false);
                }
            } catch (error) {
                console.error("Error requesting persistent storage:", error);
                setStorageAllowed(false);
            }
        } else {
            console.warn("Persistent storage API not supported.");
            setStorageAllowed(false);
        }
    };
    
    const handleCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                setCameraAllowed(true);
                // Stop the track immediately to turn off the camera light
                stream.getTracks().forEach(track => track.stop());
            })
            .catch((error) => {
                // Silently handle denial for a smoother user experience.
                console.warn(`Camera access denied: ${error.message}`);
                setCameraAllowed(false);
            });
    };
    
    return (
        <div className="flex flex-col items-center justify-start h-screen bg-[#121212] text-white p-6 py-10 overflow-y-auto">
            <div className="text-center animate-fade-in-up">
                <h2 className="text-3xl font-bold font-poppins mb-2">{t('permissions_title')}</h2>
                <p className="text-slate-400 mb-8 text-center max-w-sm">{t('permissions_tagline')}</p>
            </div>
            <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <PermissionCard 
                    icon={<MapPinIcon className="w-6 h-6 text-[#F9B233]"/>}
                    title={t('permissions_location_title')}
                    description={t('permissions_location_desc')}
                    buttonText={t('permissions_location_button')}
                    onAllow={handleLocation}
                    isAllowed={locationAllowed}
                />
            </div>
            <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                 <PermissionCard 
                    icon={<CameraIcon className="w-6 h-6 text-[#F9B233]"/>}
                    title={t('permissions_camera_title')}
                    description={t('permissions_camera_desc')}
                    buttonText={t('permissions_camera_button')}
                    onAllow={handleCamera}
                    isAllowed={cameraAllowed}
                />
            </div>
            <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <PermissionCard 
                    icon={<LockIcon className="w-6 h-6 text-[#F9B233]"/>}
                    title={t('permissions_offline_title')}
                    description={t('permissions_offline_desc')}
                    buttonText={t('permissions_offline_button')}
                    onAllow={handleStorage}
                    isAllowed={storageAllowed}
                />
            </div>
            <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '650ms' }}>
                <button
                    onClick={onComplete}
                    className="w-full max-w-sm bg-gradient-to-r from-[#008751] to-[#1c5f42] text-white font-bold py-4 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-lg"
                >
                    {t('permissions_continue')}
                </button>
            </div>
        </div>
    );
};

export default PermissionsScreen;