import React, { useEffect, useRef } from 'react';
import { XIcon } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

interface ARScreenProps {
  onExit: () => void;
}

const ARScreen: React.FC<ARScreenProps> = ({ onExit }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Prefer the back camera
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access the camera. Please ensure permissions are granted. AR mode requires camera access.");
        onExit(); // Exit AR mode if camera fails
      }
    };

    startCamera();

    // Cleanup function to stop the camera stream
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onExit]);

  return (
    <div className="relative h-screen w-full bg-black text-white">
      {/* Live camera feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="absolute inset-0 w-full h-full object-cover"
      ></video>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-black/50 p-2 rounded-lg backdrop-blur-sm">AR Navigation Mode</h1>
        <button 
          onClick={onExit} 
          aria-label="Exit AR Mode" 
          className="bg-red-600/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-red-500"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </header>

      {/* Mock UI Overlay for navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/60 p-4 rounded-xl text-center backdrop-blur-sm">
        <p className="font-bold text-lg">Lekki Conservation Centre</p>
        <p className="text-slate-300">Turn right in 50 meters</p>
      </div>

      {/* User Location Marker */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* The ping animation: a ring that expands and fades */}
          <div className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-ping"></div>
          {/* The solid, visible center dot */}
          <div className="relative w-6 h-6 bg-sky-500 rounded-full border-2 border-white shadow-lg"></div>
        </div>
        <p className="-mt-2 font-semibold text-white bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {t('ar_you_are_here')}
        </p>
      </div>
    </div>
  );
};

export default ARScreen;