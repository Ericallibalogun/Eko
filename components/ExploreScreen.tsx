import React, { useState, useEffect } from 'react';
import { MenuIcon, CompassIcon, InfoIcon } from './Icons';
import { fetchExplorePlaces } from '../services/geminiService';
import { placesAPI } from '../services/apiService';
import type { Place } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ExploreScreenProps {
  onMenuClick: () => void;
}

const categories = [
    { key: 'Trending', tKey: 'explore_trending' },
    { key: 'Food', tKey: 'explore_food' },
    { key: 'Culture', tKey: 'explore_culture' },
    { key: 'Nature', tKey: 'explore_nature' },
    { key: 'Events', tKey: 'explore_events' },
];

const PlaceCard: React.FC<{ place: Place }> = ({ place }) => {
    const categoryIconMap: { [key: string]: React.ReactNode } = {
        Food: <CompassIcon className="w-5 h-5 text-[#F9B233]" />,
        Culture: <CompassIcon className="w-5 h-5 text-[#F9B233]" />,
        Nature: <CompassIcon className="w-5 h-5 text-[#F9B233]" />,
        Events: <CompassIcon className="w-5 h-5 text-[#F9B233]" />,
        Landmark: <CompassIcon className="w-5 h-5 text-[#F9B233]" />,
        Trending: <CompassIcon className="w-5 h-5 text-[#F9B233]" />,
        Error: <InfoIcon className="w-5 h-5 text-red-500" />
    };
    
    const icon = categoryIconMap[place.category] || <CompassIcon className="w-5 h-5 text-[#F9B233]" />;

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center mb-2">
                <div className="mr-3 flex-shrink-0">{icon}</div>
                <h3 className="font-bold text-white text-lg">{place.name}</h3>
            </div>
            <p className="text-sm text-slate-400 pl-8">{place.description}</p>
        </div>
    );
};


const ExploreScreen: React.FC<ExploreScreenProps> = ({ onMenuClick }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].key);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const loadPlaces = async () => {
      setIsLoading(true);
      setError('');
      setPlaces([]); // Clear previous places
      
      try {
        // Try to fetch from backend first
        const fetchedPlaces = await placesAPI.getPlacesByCategory(selectedCategory);
        setPlaces(fetchedPlaces);
      } catch (err) {
        // If backend fails, fallback to Gemini API
        console.log('Fetching from backend failed, falling back to Gemini API');
        try {
          const fetchedPlaces = await fetchExplorePlaces(selectedCategory);
          setPlaces(fetchedPlaces);
        } catch (geminiErr) {
          setError('Failed to load places');
          console.error('Both backend and Gemini API failed:', geminiErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaces();
  }, [selectedCategory]);

  return (
    <div className="bg-[#121212] min-h-screen text-white flex flex-col">
      <header className="sticky top-0 bg-[#121212]/80 backdrop-blur-md p-4 z-10 flex items-center justify-between text-white">
        <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-700/50">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold font-poppins">{t('explore_header')}</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      
      {error && (
        <div className="mx-4 my-2 p-2 bg-red-500 text-white rounded">
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="px-4 pt-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === category.key
                  ? 'bg-[#008751] text-white'
                  : 'bg-gray-800/50 text-slate-300 hover:bg-gray-700/50'
              }`}
            >
              {t(category.tKey as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <main className="flex-grow p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {places.map((place, index) => (
              <PlaceCard key={`${place.name}-${index}`} place={place} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExploreScreen;