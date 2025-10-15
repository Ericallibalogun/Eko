import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../types';
import { MenuIcon, SearchIcon, TargetIcon, LayersIcon, CameraIcon, MessageSquareIcon, PlusIcon, MinusIcon } from './Icons';
import { USER_PROFILE } from '../constants';
import EkoBot from './EkoBot';
import { useLanguage } from '../i18n/LanguageContext';
import Avatar from './Avatar';
import { fetchSearchSuggestions, geocodePlace } from '../services/geminiService';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet';

interface HomeScreenProps {
  onMenuClick: () => void;
  onNavigate: (screen: Screen) => void;
  mapSource: 'OpenStreetMap' | 'Google Maps';
}

const ActionButton: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void, 'aria-label': string }> = ({ children, className, onClick, 'aria-label': ariaLabel }) => (
    <button 
        onClick={onClick}
        aria-label={ariaLabel}
        className={`bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg border border-gray-700 hover:bg-gray-700 transition ${className}`}>
        {children}
    </button>
);

// A component to programmatically change the map's view
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    map.flyTo(center, zoom);
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


const HomeScreen: React.FC<HomeScreenProps> = ({ onMenuClick, onNavigate }) => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState('Mapnik');
  const [showLayers, setShowLayers] = useState(false);
  const { t } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap>(null);
  
  // Map State
  const lagosCenter: [number, number] = [6.5244, 3.3792];
  const [mapCenter, setMapCenter] = useState<[number, number]>(lagosCenter);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{coords: [number, number], name: string} | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const layers = {
    Mapnik: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    CycleMap: "https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=YOUR_API_KEY",
    TransportMap: "https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_API_KEY"
  };
  
   // Get initial user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc: [number, number] = [latitude, longitude];
            setUserLocation(newLoc);
            setMapCenter(newLoc);
        },
        () => {
            console.warn('Could not get user location. Defaulting to Lagos.');
        }
    );
  }, []);

  // Debounce search input
  useEffect(() => {
      if (searchQuery.length < 3) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
      }

      const handler = setTimeout(async () => {
          setShowSuggestions(true);
          setIsSearching(true);
          const fetchedSuggestions = await fetchSearchSuggestions(searchQuery);
          setSuggestions(fetchedSuggestions);
          setIsSearching(false);
      }, 500); // 500ms debounce

      return () => {
          clearTimeout(handler);
      };
  }, [searchQuery]);
    
    // Click outside handler for search suggestions
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [searchRef]);


  const handleRecenter = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc: [number, number] = [latitude, longitude];
            setUserLocation(newLoc); // Update the user location state
            setMapCenter(newLoc);   // Fly the map to the new location
        },
        () => {
            alert('Could not get your current location. Please ensure location services are enabled.');
        },
        { enableHighAccuracy: true }
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
    } else {
        alert(`Could not find location for "${suggestion}"`);
    }
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#121212]">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 10 }} ref={mapRef} zoomControl={false}>
        <ChangeView center={mapCenter} zoom={15} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={layers[mapLayer as keyof typeof layers].replace('YOUR_API_KEY', 'b5a8e312f3474c35b5a4b7a7f83b63c7')}
          key={mapLayer}
        />
        {userLocation && (
             <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>{t('ar_you_are_here')}</Popup>
            </Marker>
        )}
        {searchedLocation && (
            <Marker position={searchedLocation.coords}>
                <Popup>{searchedLocation.name}</Popup>
            </Marker>
        )}
      </MapContainer>
      
      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between text-white">
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
                        {isSearching ? (
                            <li className="p-3 text-gray-400">{t('search_loading')}</li>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="p-3 hover:bg-gray-700 cursor-pointer text-white"
                                >
                                    {suggestion}
                                </li>
                            ))
                        ) : (
                           searchQuery.length > 2 && <li className="p-3 text-gray-400">{t('search_no_results')}</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
        <button onClick={() => onNavigate(Screen.Settings)} aria-label="Open Settings" className="bg-gray-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-700">
            <Avatar src={USER_PROFILE.avatarUrl} alt="user" className="w-8 h-8 rounded-full" />
        </button>
      </header>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 right-4 z-[20] flex flex-col space-y-3">
        <ActionButton onClick={handleZoomIn} aria-label={t('zoom_in_label')}>
            <PlusIcon className="w-6 h-6" />
        </ActionButton>
        <ActionButton onClick={handleZoomOut} aria-label={t('zoom_out_label')}>
            <MinusIcon className="w-6 h-6" />
        </ActionButton>
        <ActionButton onClick={() => onNavigate(Screen.AR)} aria-label="AR Navigation">
            <CameraIcon className="w-6 h-6" />
        </ActionButton>
        <ActionButton onClick={handleRecenter} aria-label="Recenter Map">
            <TargetIcon className="w-6 h-6" />
        </ActionButton>
        <ActionButton onClick={() => setShowLayers(true)} aria-label="Map Layers">
            <LayersIcon className="w-6 h-6" />
        </ActionButton>
      </div>

      {/* EkoBot FAB */}
       <div className="absolute bottom-8 left-4 z-[20]">
         <button 
            onClick={() => setIsBotOpen(true)}
            aria-label="Open EkoBot"
            className="bg-gradient-to-br from-[#008751] to-[#1c5f42] text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <MessageSquareIcon className="w-7 h-7" />
        </button>
       </div>
      
      <EkoBot isOpen={isBotOpen} onClose={() => setIsBotOpen(false)} />

      {/* Layers Modal */}
      {showLayers && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => setShowLayers(false)}>
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg w-64 text-white" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-lg mb-4 text-center">{t('home_map_layers')}</h3>
                  <ul className="space-y-2">
                      {Object.keys(layers).map(layer => (
                          <li key={layer}>
                              <button 
                                  onClick={() => { setMapLayer(layer); setShowLayers(false); }}
                                  className={`w-full text-left p-3 rounded-lg transition-colors ${mapLayer === layer ? 'bg-[#008751] text-white' : 'hover:bg-gray-700'}`}
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