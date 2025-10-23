
import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import ImageWithFallback from './ImageWithFallback';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    image: 'https://images.unsplash.com/photo-1605723528445-535f2b05b5a6?q=80&w=1000&auto=format&fit=crop',
    titleKey: 'onboarding_title_1',
    descriptionKey: 'onboarding_desc_1',
  },
  {
    image: 'https://images.unsplash.com/photo-1684483751563-745862593b33?q=80&w=1000&auto=format&fit=crop',
    titleKey: 'onboarding_title_2',
    descriptionKey: 'onboarding_desc_2',
  },
  {
    image: 'https://images.unsplash.com/photo-1615124845014-943343a4e9a3?q=80&w=1000&auto=format&fit=crop',
    titleKey: 'onboarding_title_3',
    descriptionKey: 'onboarding_desc_3',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const step = onboardingSteps[currentStep];

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white">
        <div className="flex-grow relative">
            <ImageWithFallback 
                src={step.image} 
                alt="Lagos scenery" 
                className="w-full h-full object-cover opacity-60"
                fallbackClassName="bg-gray-900"
                iconClassName="w-24 h-24 text-gray-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent"></div>
        </div>

      <div key={currentStep} className="absolute bottom-0 left-0 right-0 p-8 text-center bg-[#121212] bg-opacity-70 backdrop-blur-sm rounded-t-3xl animate-fade-in">
        <h2 className="text-3xl font-bold font-poppins mb-4">{t(step.titleKey as any)}</h2>
        <p className="text-slate-300 mb-8 max-w-md mx-auto">{t(step.descriptionKey as any)}</p>

        <div className="flex items-center justify-center space-x-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentStep === index ? 'bg-[#F9B233] w-6' : 'bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="w-full max-w-md mx-auto bg-gradient-to-r from-[#008751] to-[#1c5f42] text-white font-bold py-4 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-lg"
        >
          {currentStep === onboardingSteps.length - 1 ? t('onboarding_get_started') : t('onboarding_next')}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;