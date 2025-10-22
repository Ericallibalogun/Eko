import React, { useState, useEffect, useRef } from 'react';
import { XIcon, MapPinIcon, SwapVertIcon, TargetIcon } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchSearchSuggestions, geocodePlace, fetchRoutes } from '../services/geminiService';
import type { Route } from '../types';

interface RoutePlannerProps {
  onClose: () => void;
  onRoutesFound: (routes: Route[]) => void;
  userLocation: [number, number] | null;
}

type LocationPoint = {
  name: string;
  coords: { lat: number, lon: number } | null;
}

// Helper to calculate distance between two lat/lon points in meters
const haversineDistance = (coords1: { lat: number, lon: number }, coords2: { lat: number, lon: number }): number => {
    const R = 6371e3; // metres
    const φ1 = coords1.lat * Math.PI / 180;
    const φ2 = coords2.lat * Math.PI / 180;
    const Δφ = (coords2.lat - coords1.lat) * Math.PI / 180;
    const Δλ = (coords2.lon - coords1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};


const SuggestionInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder: string;
}> = ({ value, onChange, onSelect, placeholder }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handler = setTimeout(async () => {
      setShowSuggestions(true);
      setIsLoading(true);
      const fetchedSuggestions = await fetchSearchSuggestions(value);
      setSuggestions(fetchedSuggestions);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  return (
    <div className="relative w-full" ref={ref}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
        placeholder={placeholder}
        className="w-full bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#008751]"
      />
      {showSuggestions && (
        <div className="absolute top-full mt-1 w-full bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden z-30">
          <ul>
            {isLoading ? (
              <li className="p-3 text-gray-400">Loading...</li>
            ) : suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => { onSelect(s); setShowSuggestions(false); }}
                  className="p-3 hover:bg-gray-700 cursor-pointer text-white"
                >
                  {s}
                </li>
              ))
            ) : (
              <li className="p-3 text-gray-400">No suggestions found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onClose, onRoutesFound, userLocation }) => {
  const { t } = useLanguage();
  const [startPoint, setStartPoint] = useState<LocationPoint>({ name: t('your_location'), coords: userLocation ? { lat: userLocation[0], lon: userLocation[1] } : null });
  const [destinationPoint, setDestinationPoint] = useState<LocationPoint>({ name: '', coords: null });
  const [isLoading, setIsLoading] = useState(false);
  const locationWatchId = useRef<number | null>(null);

  useEffect(() => {
    if (startPoint.name === t('your_location')) {
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }

      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          // Update only if location changes significantly (e.g., > 20 meters) or is not yet set
          if (!startPoint.coords || haversineDistance(startPoint.coords, newCoords) > 20) {
            setStartPoint({ name: t('your_location'), coords: newCoords });
          }
        },
        (error) => {
          console.error("Error watching position:", error);
          // If we fail to get location (e.g. denied), prompt user to enter manually
          if (startPoint.coords === null) {
            alert(t('route_planner_location_error'));
            setStartPoint({ name: '', coords: null });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // If start point is not 'Your Location', clear any active watch.
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
        locationWatchId.current = null;
      }
    }

    // Cleanup function: clear watch when component unmounts or dependency changes
    return () => {
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, [startPoint.name, startPoint.coords, t]);


  const handleSelectStart = async (placeName: string) => {
    const coords = await geocodePlace(placeName);
    setStartPoint({ name: placeName, coords });
  };

  const handleSelectDestination = async (placeName: string) => {
    const coords = await geocodePlace(placeName);
    setDestinationPoint({ name: placeName, coords });
  };
  
  const handleSwap = () => {
      setStartPoint(destinationPoint);
      setDestinationPoint(startPoint);
  }

  const handleFindRoutes = async () => {
      if (!startPoint.coords || !destinationPoint.coords) {
          alert(t('route_planner_validation_error'));
          return;
      }
      setIsLoading(true);
      const routes = await fetchRoutes(startPoint.coords, destinationPoint.coords);
      onRoutesFound(routes);
      setIsLoading(false);
      onClose(); // Close planner to show map results
  };

  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-30 flex flex-col p-4 text-white">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-poppins">{t('route_planner_title')}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700/50">
          <XIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex items-center space-x-3">
          <div className="flex flex-col items-center self-stretch">
            <TargetIcon className="w-5 h-5 text-blue-400"/>
            <div className="flex-grow w-px border-l-2 border-dashed border-gray-600 my-2"></div>
            <MapPinIcon className="w-5 h-5 text-green-400"/>
          </div>
          <div className="flex-grow space-y-4">
              <SuggestionInput 
                value={startPoint.name}
                onChange={(val) => setStartPoint({ name: val, coords: null })}
                onSelect={handleSelectStart}
                placeholder={t('start_point_placeholder')}
              />
              <SuggestionInput 
                value={destinationPoint.name}
                onChange={(val) => setDestinationPoint({ name: val, coords: null })}
                onSelect={handleSelectDestination}
                placeholder={t('destination_placeholder')}
              />
          </div>
           <div className="pl-2">
               <button onClick={handleSwap} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600" aria-label="Swap start and destination">
                  <SwapVertIcon className="w-5 h-5"/>
              </button>
           </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={handleFindRoutes}
          disabled={isLoading || !startPoint.coords || !destinationPoint.coords}
          className="w-full bg-gradient-to-r from-[#008751] to-[#1c5f42] text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('finding_routes') : t('find_routes_button')}
        </button>
      </div>
    </div>
  );
};

export default RoutePlanner;