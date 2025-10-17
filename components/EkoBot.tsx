import React, { useState, useRef, useEffect } from 'react';
import { XIcon, MaximizeIcon, MinimizeIcon, MicrophoneIcon } from './Icons';
import { chatWithEkoBot } from '../services/geminiService';
import { USER_PROFILE } from '../constants';
import { useLanguage } from '../i18n/LanguageContext';
import Avatar from './Avatar';

// Corrected Web Speech API type definitions for global scope
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  const SpeechRecognition: {
    new (): SpeechRecognition;
  };

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
}


interface EkoBotProps {
  isOpen: boolean;
  onClose: () => void;
}

type Message = {
    role: 'user' | 'model';
    text: string;
}

const getCurrentLocation = (): Promise<{ lat: number; lon: number } | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            () => {
                // On error (e.g., user denies permission), resolve with null
                resolve(null);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    });
};

// Helper to parse markdown-style bolding
const renderMessageContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="font-bold text-[#F9B233]">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
};

const EkoBot: React.FC<EkoBotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { language, t } = useLanguage();

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            const langCodeMap = { English: 'en-US', Yoruba: 'yo-NG', Hausa: 'ha-NG', Igbo: 'ig-NG' };
            
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = langCodeMap[language as keyof typeof langCodeMap] || 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInput(transcript);
            };
            
            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech Recognition Error:", event.error, event.message);
                setIsListening(false);
            };
            
            recognitionRef.current = recognition;
        } else {
            console.warn("Speech recognition not supported in this browser.");
        }
    }, [language]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        
        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const historyForApi = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));
        
        const location = await getCurrentLocation();
        const botResponseText = await chatWithEkoBot(input, historyForApi, location);
        const botMessage: Message = { role: 'model', text: botResponseText };
        
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    const toggleListening = () => {
        if (isLoading || !recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInput(''); // Clear input before starting
            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    
    const handleClose = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        }
        setIsMaximized(false);
        onClose();
    };


    if (!isOpen) return null;

    const containerClasses = isMaximized 
        ? 'fixed inset-0 w-full h-full rounded-none' 
        : 'fixed bottom-0 right-0 left-0 sm:left-auto sm:right-4 sm:bottom-4 h-[85%] sm:h-[70%] w-full sm:w-96 rounded-t-2xl sm:rounded-2xl';
    
    const transitionClasses = isOpen 
        ? 'translate-y-0' 
        : 'translate-y-full';

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ekobot-heading"
        className={`${containerClasses} bg-[#1A2E27] text-white z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${transitionClasses}`}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <h2 id="ekobot-heading" className="text-xl font-bold font-poppins">{t('ekobot_header')}</h2>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setIsMaximized(!isMaximized)} 
                    className="p-1 rounded-full hover:bg-gray-700/50" 
                    aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
                >
                    {isMaximized ? <MinimizeIcon className="w-6 h-6" /> : <MaximizeIcon className="w-6 h-6" />}
                </button>
                <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-700/50" aria-label="Close EkoBot">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
        </header>

        <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
                 {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#008751] to-[#1c5f42] flex-shrink-0"></div>}
                        <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-[#008751] rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            <p className="text-white whitespace-pre-wrap">{renderMessageContent(msg.text)}</p>
                        </div>
                         {msg.role === 'user' && <Avatar src={USER_PROFILE.avatarUrl} alt="user" className="w-8 h-8 rounded-full flex-shrink-0" />}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#008751] to-[#1c5f42] flex-shrink-0"></div>
                        <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl bg-gray-700 rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></span>
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={toggleListening}
                    disabled={!recognitionRef.current || isLoading}
                    className={`flex-shrink-0 text-white p-2 rounded-full transition-colors ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={isListening ? t('ekobot_voice_stop_label') : t('ekobot_voice_input_label')}
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? t('ekobot_listening_placeholder') : t('ekobot_placeholder')}
                    className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#008751] disabled:opacity-70"
                    disabled={isListening}
                />
                <button 
                    type="submit"
                    disabled={isLoading || isListening}
                    className="bg-[#008751] text-white p-2 rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed"
                    aria-label={t('ekobot_send_label')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
        </div>
      </div>
    </>
  );
};

export default EkoBot;