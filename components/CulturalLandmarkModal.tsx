import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';
import { CulturalLandmark } from '../types';
import { fetchLandmarkDetails } from '../services/geminiService';

interface CulturalLandmarkModalProps {
  landmark: CulturalLandmark;
  onClose: () => void;
}

const CulturalLandmarkModal: React.FC<CulturalLandmarkModalProps> = ({ landmark, onClose }) => {
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      const fetchedDetails = await fetchLandmarkDetails(landmark.name);
      setDetails(fetchedDetails);
      setIsLoading(false);
    };
    loadDetails();
  }, [landmark.name]);

  // A simple markdown-like renderer for newlines
  const renderDetails = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-[#1A2E27] text-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold font-poppins text-[#F9B233]">{landmark.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700/50" aria-label="Close details">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow p-6 overflow-y-auto">
          <p className="italic text-slate-300 mb-6">{landmark.description}</p>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="text-slate-200 whitespace-pre-wrap">{renderDetails(details)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CulturalLandmarkModal;
