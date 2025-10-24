import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';
import { CulturalLandmark } from '../types';
import { fetchLandmarkDetails } from '../services/geminiService';
import { useLanguage } from '../i18n/LanguageContext';
import ImageWithFallback from './ImageWithFallback';

interface CulturalLandmarkModalProps {
  landmark: CulturalLandmark;
  onClose: () => void;
  onGetDirections: (landmark: CulturalLandmark) => void;
}

const CulturalLandmarkModal: React.FC<CulturalLandmarkModalProps> = ({ landmark, onClose, onGetDirections }) => {
  const [data, setData] = useState<{ details: string; imageUrl: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      setData(null);
      const fetchedData = await fetchLandmarkDetails(landmark.name, language);
      setData(fetchedData);
      setIsLoading(false);
    };
    loadDetails();
  }, [landmark.name, language]);

  // A simple markdown-like renderer for newlines
  const renderDetails = (text: string) => {
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-[#1A2E27] text-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold font-poppins text-[#F9B233]">{landmark.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700/50" aria-label="Close details">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {isLoading ? (
            <div className="flex-grow flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
        ) : data ? (
            <>
                {data.imageUrl && (
                    <div className="flex-shrink-0">
                        <ImageWithFallback 
                            src={data.imageUrl} 
                            alt={landmark.name}
                            className="w-full h-48 object-cover"
                            fallbackClassName="bg-gray-800"
                            iconClassName="w-16 h-16 text-gray-600"
                        />
                    </div>
                )}
                <div className="flex-grow p-6 overflow-y-auto">
                    <p className="italic text-slate-300 mb-6">{landmark.description}</p>
                    <div className="text-slate-200">{renderDetails(data.details)}</div>
                </div>
                <footer className="p-4 border-t border-gray-700 flex-shrink-0 bg-[#1A2E27]">
                    <button 
                        onClick={() => onGetDirections(landmark)}
                        className="w-full bg-gradient-to-r from-[#008751] to-[#1c5f42] text-white font-bold py-3 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Get Directions
                    </button>
                </footer>
            </>
        ) : (
            <div className="flex-grow flex justify-center items-center p-6 text-center text-slate-400">
                <p>Could not load details for this landmark.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CulturalLandmarkModal;