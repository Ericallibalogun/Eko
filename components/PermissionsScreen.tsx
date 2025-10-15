
import React, { useState, useEffect } from 'react';
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
        <div className="bg-[#1A2E27]/80 border border-green-900/50 p-6 rounded-2xl shadow-lg w-full max-w-sm mb-6">
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
    
    useEffect(() => {
        if (locationAllowed && storageAllowed && cameraAllowed) {
            const timer = setTimeout(() => onComplete(), 500);
            return () => clearTimeout(timer);
        }
    }, [locationAllowed, storageAllowed, cameraAllowed, onComplete]);

    const handleLocation = () => {
        navigator.geolocation.getCurrentPosition(
            () => setLocationAllowed(true),
            () => alert("Location access denied. Some features may not work correctly.")
        );
    };

    const handleStorage = async () => {
        // Check if the browser supports the API.
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persist();
                if (isPersisted) {
                    // Success!
                    setStorageAllowed(true);
                } else {
                    // The browser denied the request. We'll inform the user but
                    // allow them to proceed so as not to block the app experience.
                    alert("Persistent storage could not be enabled automatically. Offline features might be limited. You can continue.");
                    setStorageAllowed(true);
                }
            } catch (error) {
                console.error("Error requesting persistent storage:", error);
                alert("An error occurred while trying to enable offline access. You can continue, but offline features may be limited.");
                setStorageAllowed(true);
            }
        } else {
            // The API is not supported at all. Inform the user and proceed.
            alert("Your browser doesn't fully support offline storage. You can continue, but some features may not work without a connection.");
            setStorageAllowed(true);
        }
    };
    
    const handleCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                setCameraAllowed(true);
                // Stop the track immediately to turn off the camera light
                stream.getTracks().forEach(track => track.stop());
            })
            .catch(() => alert("Camera access denied. AR features will not be available."));
    };
    
    return (
        <div className="flex flex-col items-center justify-start h-screen bg-[#121212] text-white p-6 py-10 overflow-y-auto">
            <h2 className="text-3xl font-bold font-poppins mb-2">{t('permissions_title')}</h2>
            <p className="text-slate-400 mb-8 text-center max-w-sm">{t('permissions_tagline')}</p>
            <PermissionCard 
                icon={<MapPinIcon className="w-6 h-6 text-[#F9B233]"/>}
                title={t('permissions_location_title')}
                description={t('permissions_location_desc')}
                buttonText={t('permissions_location_button')}
                onAllow={handleLocation}
                isAllowed={locationAllowed}
            />
             <PermissionCard 
                icon={<CameraIcon className="w-6 h-6 text-[#F9B233]"/>}
                title={t('permissions_camera_title')}
                description={t('permissions_camera_desc')}
                buttonText={t('permissions_camera_button')}
                onAllow={handleCamera}
                isAllowed={cameraAllowed}
            />
            <PermissionCard 
                icon={<LockIcon className="w-6 h-6 text-[#F9B233]"/>}
                title={t('permissions_offline_title')}
                description={t('permissions_offline_desc')}
                buttonText={t('permissions_offline_button')}
                onAllow={handleStorage}
                isAllowed={storageAllowed}
            />
        </div>
    );
};

export default PermissionsScreen;
