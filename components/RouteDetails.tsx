
import React, { useState, useEffect, useCallback } from 'react';
import type { Route } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { XIcon, ArrowUpIcon, ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, ShareIcon } from './Icons';

interface RouteDetailsProps {
  routes: Route[];
  selectedRoute: Route | null;
  onSelectRoute: (route: Route) => void;
  onClose: () => void;
}

// Helper function to calculate distance between two lat/lon points in meters
const haversineDistance = (coords1: [number, number], coords2: [number, number]): number => {
    const R = 6371e3; // metres
    const φ1 = coords1[0] * Math.PI / 180;
    const φ2 = coords2[0] * Math.PI / 180;
    const Δφ = (coords2[0] - coords1[0]) * Math.PI / 180;
    const Δλ = (coords2[1] - coords1[1]) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

const getInstructionIcon = (instruction: string): React.ReactNode => {
    const lowerInstruction = instruction.toLowerCase();
    if (lowerInstruction.includes('left')) return <ArrowLeftIcon className="w-16 h-16" />;
    if (lowerInstruction.includes('right')) return <ArrowRightIcon className="w-16 h-16" />;
    if (lowerInstruction.includes('straight') || lowerInstruction.includes('continue')) return <ArrowUpIcon className="w-16 h-16" />;
    return <ArrowUpIcon className="w-16 h-16" />;
};

const RouteDetails: React.FC<RouteDetailsProps> = ({ routes, selectedRoute, onSelectRoute, onClose }) => {
  const { t } = useLanguage();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleStartNavigation = () => {
    if (selectedRoute) {
      setIsNavigating(true);
      setCurrentStepIndex(0);
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
  };

  const handleNextStep = useCallback(() => {
    if (selectedRoute && currentStepIndex < selectedRoute.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [selectedRoute, currentStepIndex]);

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (!isNavigating || !selectedRoute) return;

    const getTargetPointForStep = (stepIndex: number): [number, number] | null => {
        if (!selectedRoute || selectedRoute.steps.length === 0 || selectedRoute.polyline.length < 2) return null;
        const ratio = (stepIndex + 1) / selectedRoute.steps.length;
        const polylineIndex = Math.min(Math.floor(ratio * selectedRoute.polyline.length), selectedRoute.polyline.length - 1);
        return selectedRoute.polyline[polylineIndex];
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentUserLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
        const targetPoint = getTargetPointForStep(currentStepIndex);
        
        if (targetPoint) {
            const distance = haversineDistance(currentUserLocation, targetPoint);
            if (distance < 25) { // Auto-advance if within 25 meters
                handleNextStep();
            }
        }
      },
      (error) => console.error("Error watching position:", error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isNavigating, selectedRoute, currentStepIndex, handleNextStep]);
  
  const handleShareRoute = async (e: React.MouseEvent, route: Route) => {
      e.stopPropagation();
      if (navigator.share) {
          try {
              await navigator.share({
                  title: "EKO Navigation: Route Suggestion",
                  text: `Check out this route I found with EKO Navigation:\n\n*${route.name}*\n- Summary: ${route.summary}\n- Distance: ${route.distance}\n- Duration: ${route.duration}`,
                  url: window.location.href
              });
          } catch (error) {
              console.log('Error sharing route:', error);
          }
      }
  };


  if (!routes || routes.length === 0) return null;

  const renderNavigationUI = () => {
    if (!selectedRoute) return null;
    const isFinalStep = currentStepIndex === selectedRoute.steps.length - 1;
    const currentStep = selectedRoute.steps[currentStepIndex];
    const nextStep = isFinalStep ? t('navigation_you_have_arrived') : selectedRoute.steps[currentStepIndex + 1];

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold font-poppins">{selectedRoute.name}</h3>
                <button onClick={handleEndNavigation} className="bg-red-600/80 text-white font-bold py-2 px-4 rounded-lg transition hover:bg-red-700">
                    {t('navigation_end_route')}
                </button>
            </div>
            <div className="flex-grow p-4 flex flex-col items-center justify-center text-center">
                <div className="text-green-400 mb-4 animate-pulse-glow">
                    {getInstructionIcon(currentStep)}
                </div>
                <p className="text-3xl font-bold leading-tight">{currentStep}</p>
                <div className="mt-6 border-t border-gray-700 w-full pt-4">
                    <p className="text-sm text-slate-400 uppercase tracking-wider">{t('navigation_next_instruction')}</p>
                    <p className="text-lg text-slate-300">{nextStep}</p>
                </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                <button onClick={handlePrevStep} disabled={currentStepIndex === 0} className="flex items-center space-x-2 text-white font-bold py-3 px-6 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>{t('navigation_back')}</span>
                </button>
                 <span className="font-semibold">{currentStepIndex + 1} / {selectedRoute.steps.length}</span>
                <button onClick={handleNextStep} className="flex items-center space-x-2 text-white font-bold py-3 px-6 rounded-lg bg-gray-700 hover:bg-gray-600">
                    <span>{isFinalStep ? t('navigation_finish') : t('navigation_next')}</span>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
  };

  const renderRouteSelectionUI = () => (
     <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-bold font-poppins">{t('route_details_title')}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700/50">
            <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-4 space-y-3 flex-grow overflow-y-auto">
            {routes.map((route, index) => (
            <div
                key={index}
                onClick={() => onSelectRoute(route)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                selectedRoute?.name === route.name
                    ? 'bg-green-800/50 border-green-500'
                    : 'bg-gray-800/60 border-transparent hover:border-gray-600'
                }`}
            >
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-[#F9B233]">{route.name}</h4>
                    <div className="flex items-center space-x-2">
                        <div className="text-right">
                            <p className="font-bold text-lg">{route.duration}</p>
                            <p className="text-sm text-slate-400">{route.distance}</p>
                        </div>
                        {navigator.share && (
                            <button onClick={(e) => handleShareRoute(e, route)} className="p-2 rounded-full hover:bg-gray-600 self-start" aria-label={`Share ${route.name}`}>
                                <ShareIcon className="w-5 h-5 text-slate-300" />
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-slate-300 mt-1">{route.summary}</p>
            </div>
            ))}
        </div>
        <div className="p-4 border-t border-gray-700">
            <button 
                disabled={!selectedRoute}
                onClick={handleStartNavigation}
                className="w-full bg-gradient-to-r from-[#008751] to-[#1c5f42] text-white font-bold py-3 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {t('start_navigation_button')}
            </button>
        </div>
     </div>
  );


  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-30 text-white rounded-t-2xl shadow-2xl animate-slide-up max-h-[60vh] flex flex-col">
       {isNavigating ? renderNavigationUI() : renderRouteSelectionUI()}
       <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RouteDetails;