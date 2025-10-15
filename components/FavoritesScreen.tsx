import React, { useState } from 'react';
import { MenuIcon, StarIcon, ClockIcon } from './Icons';
import type { SavedPlace } from '../types';
import { SAVED_PLACES, RECENT_PLACES } from '../constants';
import { useLanguage } from '../i18n/LanguageContext';
import ImageWithFallback from './ImageWithFallback';


interface FavoritesScreenProps {
  onMenuClick: () => void;
}

const PlaceRow: React.FC<{ place: SavedPlace }> = ({ place }) => (
    <div className="flex items-center bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
        <ImageWithFallback
            src={place.imageUrl}
            alt={place.name}
            className="w-16 h-16 rounded-md object-cover mr-4"
            fallbackClassName="bg-gray-700"
            iconClassName="w-8 h-8 text-gray-500"
        />
        <div className="flex-grow">
            <h3 className="font-bold text-white">{place.name}</h3>
            <p className="text-sm text-slate-400">{place.category}</p>
        </div>
        <StarIcon className="w-6 h-6 text-[#F9B233]" />
    </div>
)

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onMenuClick }) => {
    const [activeTab, setActiveTab] = useState<'favorites' | 'recents'>('favorites');
    const { t } = useLanguage();

    const content = activeTab === 'favorites' ? SAVED_PLACES : RECENT_PLACES;
    
    return (
        <div className="bg-[#121212] min-h-screen text-white flex flex-col">
            <header className="sticky top-0 bg-[#121212]/80 backdrop-blur-md p-4 z-10 flex items-center justify-between text-white">
                <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-700/50">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold font-poppins">{t('favorites_header')}</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <div className="px-4 pt-4">
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`w-1/2 p-2 rounded-md font-semibold transition-colors flex items-center justify-center ${activeTab === 'favorites' ? 'bg-[#008751] text-white' : 'text-slate-300'}`}
                    >
                        <StarIcon className="w-5 h-5 mr-2" />
                        {t('favorites_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('recents')}
                        className={`w-1/2 p-2 rounded-md font-semibold transition-colors flex items-center justify-center ${activeTab === 'recents' ? 'bg-[#008751] text-white' : 'text-slate-300'}`}
                    >
                        <ClockIcon className="w-5 h-5 mr-2" />
                        {t('favorites_recents_tab')}
                    </button>
                </div>
            </div>

            <main className="flex-grow p-4">
                <div className="space-y-4">
                    {content.map(place => (
                        <PlaceRow key={place.name} place={place} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FavoritesScreen;
