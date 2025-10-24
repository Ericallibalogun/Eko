import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, Route, CulturalLandmark, Settings } from '../types';
import { MenuIcon, SearchIcon, TargetIcon, LayersIcon, CameraIcon, MessageSquareIcon, PlusIcon, MinusIcon, DirectionsIcon, LandmarkIcon } from './Icons';
import { USER_PROFILE } from '../constants';
import EkoBot from './EkoBot';
import RoutePlanner from './RoutePlanner';
import RouteDetails from './RouteDetails';
import CulturalLandmarkModal from './CulturalLandmarkModal';
import { useLanguage } from '../i18n/LanguageContext';
import Avatar from './Avatar';
import { fetchSearchSuggestions, geocodePlace, fetchRoutes, fetchCulturalLandmarks } from '../services/geminiService';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet';

interface HomeScreenProps {
  onMenuClick: () => void;
  onNavigate: (screen: Screen) => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const ActionButton: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void, 'aria-label': string }> = ({ children, className, onClick, 'aria-label': ariaLabel }) => (
    <button 
        onClick={onClick}
        aria-label={ariaLabel}
        className={`bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg border border-gray-700 hover:bg-gray-700 transition ${className}`}>
        {children}
    </button>
);

const ChangeView: React.FC<{ center: [number, number]; zoom: number; bounds?: L.LatLngBoundsExpression }> = ({ center, zoom, bounds }) => {
    const map = useMap();
    if (bounds) {
        map.flyToBounds(bounds, { padding: [50, 50] });
    } else {
        map.flyTo(center, zoom);
    }
    return null;
};

const userLocationIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-6 h-6 rounded-full bg-blue-500/50 animate-ping"></div>
           <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
         </div>`,
  className: 'bg-transparent border-none',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const culturalLandmarkIcon = L.divIcon({
    html: `<div class="relative flex items-center justify-center w-6 h-6">
            <div class="absolute w-6 h-6 rounded-full bg-yellow-500/50 animate-ping"></div>
            <div class="relative w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-lg"></div>
            </div>`,
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});


const HomeScreen: React.FC<HomeScreenProps> = ({ onMenuClick, onNavigate, settings, setSettings }) => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const { t, language } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap>(null);
  
  // Map State
  const lagosCenter: [number, number] = [6.5244, 3.3792];
  const [mapCenter, setMapCenter] = useState<[number, number]>(lagosCenter);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{coords: [number, number], name: string} | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | undefined>(undefined);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Route Planning State
  const [isRoutePlannerVisible, setIsRoutePlannerVisible] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeDestination, setRouteDestination] = useState<{ name: string; coords: { lat: number; lon: number; }; } | null>(null);

  // Cultural Discovery Mode State
  const [isCulturalModeActive, setIsCulturalModeActive] = useState(false);
  const [culturalLandmarks, setCulturalLandmarks] = useState<CulturalLandmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<CulturalLandmark | null>(null);

  const layers: Record<Settings['mapSource'], string> = {
    OpenStreetMap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    'Google Maps': "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  };
  
  const loadCulturalLandmarks = useCallback(async (bounds: L.LatLngBounds) => {
      const landmarks = await fetchCulturalLandmarks(bounds as any, language);
      setCulturalLandmarks(landmarks);
  }, [language]);

  const MapEvents = () => {
      const map = useMapEvents({
          moveend: () => {
              if (isCulturalModeActive) {
                  loadCulturalLandmarks(map.getBounds());
              }
          },
      });
      return null;
  };

  const toggleCulturalMode = async () => {
      const newModeState = !isCulturalModeActive;
      setIsCulturalModeActive(newModeState);

      if (newModeState && mapRef.current) {
          loadCulturalLandmarks(mapRef.current.getBounds());
      } else {
          setCulturalLandmarks([]);
      }
  };


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc: [number, number] = [latitude, longitude];
            setUserLocation(newLoc);
            setMapCenter(newLoc);
        },
        () => console.warn('Could not get user location. Defaulting to Lagos.'),
        { enableHighAccuracy: true, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
      if (searchQuery.length < 3) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
      }
      const handler = setTimeout(async () => {
          setShowSuggestions(true);
          setIsSearching(true);
          const fetchedSuggestions = await fetchSearchSuggestions(searchQuery, language);
          setSuggestions(fetchedSuggestions);
          setIsSearching(false);
      }, 500);
      return () => clearTimeout(handler);
  }, [searchQuery, language]);
    
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  useEffect(() => {
    if (selectedRoute && selectedRoute.polyline.length > 0) {
        const bounds = L.latLngBounds(selectedRoute.polyline as L.LatLngExpression[]);
        setMapBounds(bounds);
    } else {
        setMapBounds(undefined);
    }
  }, [selectedRoute]);


  const handleRecenter = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc: [number, number] = [latitude, longitude];
            setUserLocation(newLoc);
            setMapCenter(newLoc);
            setMapBounds(undefined);
        },
        () => alert('Could not get your current location. Please ensure location services are enabled.'),
        { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const coords = await geocodePlace(suggestion);
    if (coords) {
        const newCoords: [number, number] = [coords.lat, coords.lon];
        setSearchedLocation({ coords: newCoords, name: suggestion });
        setMapCenter(newCoords);
        setMapBounds(undefined);
    } else {
        alert(`Could not find location for "${suggestion}"`);
    }
  };

  const handleRoutesFound = (foundRoutes: Route[]) => {
      setRoutes(foundRoutes);
      if (foundRoutes.length > 0) {
          setSelectedRoute(foundRoutes[0]);
      }
  };
  
  const handleGetDirections = (landmark: CulturalLandmark) => {
    setSelectedLandmark(null); // Close modal
    setRouteDestination({
        name: landmark.name,
        coords: { lat: landmark.lat, lon: landmark.lon }
    });
    setIsRoutePlannerVisible(true);
  };

  const clearRoutes = () => {
      setRoutes([]);
      setSelectedRoute(null);
      setMapBounds(undefined);
      if(userLocation) {
        setMapCenter(userLocation);
      }
  }

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#121212]">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 10 }} ref={mapRef} zoomControl={false}>
        <ChangeView center={mapCenter} zoom={15} bounds={mapBounds} />
        <TileLayer
          attribution={settings.mapSource === 'Google Maps' 
            ? '&copy; Google' 
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url={layers[settings.mapSource]}
          key={settings.mapSource}
        />
        <MapEvents />

        {userLocation && <Marker position={userLocation} icon={userLocationIcon}><Popup>{t('ar_you_are_here')}</Popup></Marker>}
        {searchedLocation && <Marker position={searchedLocation.coords}><Popup>{searchedLocation.name}</Popup></Marker>}
        
        {culturalLandmarks.map((landmark) => (
            <Marker 
                key={landmark.name} 
                position={[landmark.lat, landmark.lon]} 
                icon={culturalLandmarkIcon}
                eventHandlers={{
                    click: () => setSelectedLandmark(landmark),
                }}
            />
        ))}

        {routes.map((route, index) => (
             <Polyline 
                key={index} 
                positions={route.polyline} 
                pathOptions={{
                    color: selectedRoute?.name === route.name ? '#F9B233' : '#6b7280', // yellow for selected, gray for others
                    weight: selectedRoute?.name === route.name ? 7 : 5,
                    opacity: selectedRoute?.name === route.name ? 1 : 0.7,
                }}
                eventHandlers={{ click: () => setSelectedRoute(route) }}
            />
        ))}

      </MapContainer>
      
      {isRoutePlannerVisible && (
        <RoutePlanner 
            onClose={() => {
                setIsRoutePlannerVisible(false);
                setRouteDestination(null);
            }}
            onRoutesFound={handleRoutesFound}
            userLocation={userLocation}
            initialDestination={routeDestination}
        />
      )}

      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between text-white animate-fade-in">
        <button onClick={onMenuClick} aria-label="Open Menu" className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-700">
            <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex-grow mx-4 relative" ref={searchRef}>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder={t('home_search_placeholder')}
                    className="w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white placeholder-gray-400 rounded-full py-3 pl-12 pr-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if(searchQuery.length > 2) setShowSuggestions(true)}}
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg overflow-hidden z-30">
                     <ul>
                        {isSearching ? <li className="p-3 text-gray-400">{t('search_loading')}</li>
                        : suggestions.length > 0 ? suggestions.map((s, i) => (
                            <li key={i} onClick={() => handleSuggestionClick(s)} className="p-3 hover:bg-gray-700 cursor-pointer text-white">{s}</li>
                        ))
                        : searchQuery.length > 2 && <li className="p-3 text-gray-400">{t('search_no_results')}</li>}
                    </ul>
                </div>
            )}
        </div>
        <button onClick={() => onNavigate(Screen.Settings)} aria-label="Open Settings" className="bg-gray-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-700">
            <Avatar src={USER_PROFILE.avatarUrl} alt="user" className="w-8 h-8 rounded-full" />
        </button>
      </header>

      {isCulturalModeActive && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-900/80 border border-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg z-20 animate-fade-in">
              Cultural Discovery Mode is ON
          </div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 right-4 z-[20] flex flex-col space-y-3">
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <ActionButton 
                onClick={toggleCulturalMode}
                aria-label="Toggle Cultural Discovery Mode"
                className={isCulturalModeActive ? 'bg-yellow-600 text-white shadow-yellow-500/50 shadow-lg' : ''}
            >
                <LandmarkIcon className="w-6 h-6" />
            </ActionButton>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}><ActionButton onClick={handleZoomIn} aria-label={t('zoom_in_label')}><PlusIcon className="w-6 h-6" /></ActionButton></div>
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}><ActionButton onClick={handleZoomOut} aria-label={t('zoom_out_label')}><MinusIcon className="w-6 h-6" /></ActionButton></div>
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}><ActionButton onClick={() => onNavigate(Screen.AR)} aria-label="AR Navigation"><CameraIcon className="w-6 h-6" /></ActionButton></div>
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}><ActionButton onClick={handleRecenter} aria-label="Recenter Map"><TargetIcon className="w-6 h-6" /></ActionButton></div>
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}><ActionButton onClick={() => setShowLayers(true)} aria-label="Map Layers"><LayersIcon className="w-6 h-6" /></ActionButton></div>
        <div className="animate-fade-in-up" style={{ animationDelay: '700ms' }}><ActionButton onClick={() => setIsRoutePlannerVisible(true)} aria-label="Plan Route"><DirectionsIcon className="w-6 h-6"/></ActionButton></div>
      </div>

      {/* EkoBot FAB */}
       <div className="absolute bottom-8 left-4 z-[20] animate-fade-in-up" style={{ animationDelay: '800ms' }}>
         <button 
            onClick={() => setIsBotOpen(true)}
            aria-label="Open EkoBot"
            className="bg-gradient-to-br from-[#008751] to-[#1c5f42] text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <MessageSquareIcon className="w-7 h-7" />
        </button>
       </div>
      
      <EkoBot 
        isOpen={isBotOpen} 
        onClose={() => setIsBotOpen(false)} 
        isTtsEnabled={settings.ttsEnabled}
        onToggleTts={() => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }))}
      />

      {selectedLandmark && (
          <CulturalLandmarkModal 
              landmark={selectedLandmark}
              onClose={() => setSelectedLandmark(null)}
              onGetDirections={handleGetDirections}
          />
      )}

      {routes.length > 0 && (
        <RouteDetails 
            routes={routes} 
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            onClose={clearRoutes}
            isTtsEnabled={settings.ttsEnabled}
            onToggleTts={() => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }))}
        />
      )}

      {showLayers && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => setShowLayers(false)}>
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg w-64 text-white" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-lg mb-4 text-center">{t('home_map_layers')}</h3>
                  <ul className="space-y-2">
                      {(Object.keys(layers) as Array<keyof typeof layers>).map(layer => (
                          <li key={layer}>
                              <button 
                                  onClick={() => { 
                                      setSettings(s => ({ ...s, mapSource: layer }));
                                      setShowLayers(false); 
                                  }}
                                  className={`w-full text-left p-3 rounded-lg transition-colors ${settings.mapSource === layer ? 'bg-[#008751] text-white' : 'hover:bg-gray-700'}`}
                              >
                                  {layer}
                              </button>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      )}
    </div>
  );
};

export default HomeScreen;
