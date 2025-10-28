import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Place, Route, CulturalLandmark } from '../types';

let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

try {
  // This will throw if process.env.API_KEY is missing.
  // The user's build environment (e.g., on Vercel) must replace process.env.API_KEY with the actual key.
  // If it doesn't, this will fail gracefully instead of crashing the app.
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (e: any) {
  initializationError = "Failed to initialize AI service. Please ensure the API_KEY environment variable is correctly set for your deployment.";
  console.error(initializationError, e);
}

// --- Caching Implementation ---
const exploreCache = new Map<string, Place[]>();
const suggestionsCache = new Map<string, string[]>();
const culturalLandmarksCache = new Map<string, CulturalLandmark[]>();
const landmarkDetailsCache = new Map<string, { details: string; imageUrl: string; }>();


const exploreResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The name of the place.',
      },
      category: {
        type: Type.STRING,
        description: 'A single category for the place (e.g., Food, Culture, Nature, Events, Landmark).',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, one-sentence description of the place.',
      },
    },
    required: ['name', 'category', 'description'],
  },
};

export const fetchExplorePlaces = async (category: string, language: string): Promise<Place[]> => {
  const cacheKey = `${category}:${language}`;
  if (exploreCache.has(cacheKey)) {
    return exploreCache.get(cacheKey)!;
  }
  
  if (!ai) {
    return [
        { name: 'API Key Error', category: 'Error', description: initializationError! },
        { name: 'Lekki Conservation Centre', category: 'Nature', description: 'A serene nature reserve known for its long canopy walkway and diverse wildlife.' },
        { name: 'Nike Art Gallery', category: 'Culture', description: 'A stunning art gallery showcasing contemporary and traditional Nigerian art.' },
    ];
  }

  try {
    const prompt = `List 5 popular places in Lagos, Nigeria under the category "${category}". For each place, provide its name, a single category, and a brief one-sentence description. Respond in the ${language} language.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: exploreResponseSchema,
      },
    });

    const jsonText = response.text.trim();
    const places = JSON.parse(jsonText) as Place[];
    exploreCache.set(cacheKey, places);
    return places;

  } catch (error) {
    console.error("Error fetching explore places from Gemini API:", error);
    // Return mock data on error to ensure the app is still functional
    return [
        { name: 'Error fetching data', category: 'Error', description: 'Could not connect to the discovery service. Please check your network connection.' },
        { name: 'Lekki Conservation Centre', category: 'Nature', description: 'A serene nature reserve known for its long canopy walkway and diverse wildlife.' },
        { name: 'Nike Art Gallery', category: 'Culture', description: 'A stunning art gallery showcasing contemporary and traditional Nigerian art.' },
    ];
  }
};

export const chatWithEkoBot = async (
    message: string, 
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    language: string,
    location?: { lat: number, lon: number }
): Promise<string> => {
    if (!ai) {
        return initializationError || "The AI service is currently unavailable.";
    }
    
    // Check if the message is related to navigation or Lagos
    const isNavigationRelated = isQuestionNavigationRelated(message);
    if (!isNavigationRelated) {
        // Return a friendly message in the user's language
        const rejectionMessages: Record<string, string> = {
            English: "I'm here to help with navigation in Lagos, Nigeria. Please ask me about places, directions, or transportation in Lagos.",
            Yoruba: "Mo wa nibi lati ran o lowo ni itinajo ni Lagos, Nigeria. Jọwọ beere fun mi nipa awọn ibi, itinajo, tabi ọna ọkọ in Lagos.",
            Hausa: "Ina nan tana taimaka wa wajen nemanema a cikin Lagos, Nigeria. Don Allah tambayi ni game da wurare, hanyoyi, ko ma aiki a cikin Lagos.",
            Igbo: "Ano m ebe a na-enyere gị aka na njikọ njem na Lagos, Nigeria. Biko jụọ m maka ebe, njikọ, ma ọ bụ njem na Lagos."
        };
        
        return rejectionMessages[language] || rejectionMessages.English;
    }
    
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are EkoBot, a hyper-local and witty navigation assistant for Lagos, Nigeria. You are an expert in all things Lagos. You MUST respond fluently in the user's specified language, which is ${language}. You must also understand English, Yoruba, Hausa, and Igbo. Crucially, you will always be provided with the user's current GPS coordinates (latitude, longitude) when they are available. When a user asks for something 'nearby', 'around here', or 'close to me', you MUST use these coordinates to give specific, relevant, and actionable recommendations. If no location is provided, you should state that you need their location for a better recommendation, but still provide general suggestions for Lagos. Your tone should be friendly, helpful, and concise.
                
IMPORTANT GUARDRAILS:
1. ONLY answer questions related to navigation, places, directions, transportation, and landmarks in Lagos, Nigeria
2. DO NOT answer questions about topics unrelated to Lagos navigation such as general knowledge, entertainment, politics, etc.
3. If a question is not related to Lagos navigation, politely inform the user that you can only help with Lagos navigation
4. ALWAYS focus your responses on Lagos state and its areas, neighborhoods, and transportation systems
5. NEVER provide information about other cities, states, or countries unless it's directly related to navigation to Lagos`,
            },
            history,
        });
        
        let finalMessage = message;
        if (location) {
            finalMessage = `My current location is latitude ${location.lat}, longitude ${location.lon}. My question is: ${message}`;
        }

        const response = await chat.sendMessage({ message: finalMessage });
        return response.text;
    } catch (error) {
        console.error("Error communicating with EkoBot:", error);
        return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
};

// Helper function to check if a question is navigation-related and Lagos-focused
function isQuestionNavigationRelated(message: string): boolean {
    // Convert to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Keywords that indicate navigation-related questions
    const navigationKeywords = [
        'direction', 'route', 'way to', 'how to get', 'navigate', 'map', 'location', 'place', 'landmark',
        'transport', 'bus', 'train', 'ferry', 'taxi', 'uber', 'bolt', 'distance', 'near', 'closest',
        'traffic', 'road', 'street', 'area', 'neighborhood', 'district', 'where is', 'find',
        'itinajo', 'ọna', 'ibi', 'wurare', 'ajọ', 'aiki', 'nemanema', 'hanyoyi', 'gida',
        'naviga', 'mapa', 'lọ', 'kwa', 'godi', 'sauƙi', 'ƙasa', 'waje', 'ƙarami',
        'njikọ', 'njem', 'ebe', 'nke', 'udo', 'ala', 'nso', 'na', 'mfe', 'elu', 'nke'
    ];
    
    // Keywords that indicate Lagos focus
    const lagosKeywords = [
        'lagos', 'eko', 'lekki', 'ikeja', 'surulere', 'yaba', 'apapa', 'ajah', 'ikoyi',
        'victoria island', 'vi', 'mainland', 'mushin', 'ogba', 'ojuelegba', 'ikorodu',
        'badagry', 'agege', 'alimosho', 'oshodi', 'ajegunle', 'bariga', 'ketu'
    ];
    
    // Check if message contains navigation keywords
    const hasNavigationKeyword = navigationKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check if message contains Lagos keywords or is general (assume Lagos context)
    const hasLagosKeyword = lagosKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // If it has navigation keywords, it's likely related to navigation
    // We'll be lenient and allow most questions through, but the AI will enforce stricter rules
    return hasNavigationKeyword || hasLagosKeyword || lowerMessage.includes('?');
}

const searchSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ['suggestions']
};

export const fetchSearchSuggestions = async (query: string, language: string): Promise<string[]> => {
    const cacheKey = `${query}:${language}`;
    if (suggestionsCache.has(cacheKey)) {
        return suggestionsCache.get(cacheKey)!;
    }

    if (!ai) {
        console.error(initializationError || "Search service is unavailable.");
        return [];
    }
    if (!query || query.length < 3) return [];
    try {
        const prompt = `Provide up to 5 autocomplete suggestions for places, landmarks, or areas in Lagos, Nigeria, that start with or are related to "${query}". Respond in the ${language} language.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: searchSuggestionsSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { suggestions: string[] };
        const suggestions = result.suggestions || [];
        suggestionsCache.set(cacheKey, suggestions);
        return suggestions;
    } catch (error) {
        console.error("Error fetching search suggestions:", error);
        return []; // Return empty array on error
    }
};

const geocodeSchema = {
    type: Type.OBJECT,
    properties: {
        lat: { type: Type.NUMBER },
        lon: { type: Type.NUMBER }
    },
    required: ['lat', 'lon']
};

export const geocodePlace = async (placeName: string): Promise<{ lat: number, lon: number } | null> => {
    if (!ai) {
        console.error(initializationError || "Geocoding service is unavailable.");
        return null;
    }
    try {
        const prompt = `Provide the precise latitude and longitude for this location in Lagos, Nigeria: "${placeName}".`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: geocodeSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { lat: number, lon: number };
    } catch (error) {
        console.error("Error geocoding place:", error);
        return null;
    }
};

const routeSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'A name for the route (e.g., "Fastest Route").' },
            summary: { type: Type.STRING, description: 'A short summary of the main roads used.' },
            distance: { type: Type.STRING, description: 'Total distance in kilometers (e.g., "15 km").' },
            duration: { type: Type.STRING, description: 'Estimated travel time (e.g., "45 mins").' },
            polyline: {
                type: Type.ARRAY,
                description: 'An array of [latitude, longitude] pairs representing the route path.',
                items: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                }
            },
            steps: {
                type: Type.ARRAY,
                description: 'An array of turn-by-turn instruction strings.',
                items: { type: Type.STRING }
            }
        },
        required: ['name', 'summary', 'distance', 'duration', 'polyline', 'steps']
    }
};

export const fetchRoutes = async (start: { lat: number, lon: number }, end: { lat: number, lon: number }, language: string): Promise<Route[]> => {
    if (!ai) {
        console.error(initializationError || "Routing service is unavailable.");
        // Return a mock route for development and in case of API key error
        return [
            {
                name: "Mock Route (API Error)",
                summary: "Via Local Roads",
                distance: "10 km",
                duration: "30 mins",
                polyline: [[start.lat, start.lon], [6.46542, 3.40645], [end.lat, end.lon]],
                steps: ["Start at your location.", "Proceed to the destination.", "You have arrived."]
            }
        ];
    }
    try {
        const prompt = `You are a route planning assistant for Lagos, Nigeria. Given a start latitude/longitude and an end latitude/longitude, provide up to 2 distinct route options (fastest and shortest). Respond entirely in the ${language} language. For each route, provide the following in a JSON array format:
1. name: A string (e.g., "Fastest Route").
2. summary: A short string describing the main roads (e.g., "Via Lekki-Epe Expressway").
3. distance: A string representing the total distance (e.g., "12.5 km").
4. duration: A string for the estimated travel time considering typical Lagos traffic (e.g., "45 min").
5. polyline: An array of at least 10 [latitude, longitude] number arrays representing the path, following major roads for a smooth line.
6. steps: An array of strings, where each string is a turn-by-turn instruction (e.g., "Turn left onto Adeola Odeku St").

Start: { lat: ${start.lat}, lon: ${start.lon} }
End: { lat: ${end.lat}, lon: ${end.lon} }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Use a more capable model for this complex task
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: routeSchema,
            },
        });

        const jsonText = response.text.trim();
        const routes = JSON.parse(jsonText) as Route[];
        // Basic validation
        if (!Array.isArray(routes) || routes.some(r => !r.polyline || r.polyline.length === 0)) {
            throw new Error("Invalid route data received from API");
        }
        return routes;
    } catch (error) {
        console.error("Error fetching routes from Gemini API:", error);
        // Fallback to a simple straight-line route on error
        return [
             {
                name: "Direct Route (Fallback)",
                summary: "A straight line to your destination.",
                distance: "N/A",
                duration: "N/A",
                polyline: [[start.lat, start.lon], [end.lat, end.lon]],
                steps: ["Start at your location.", "Proceed directly to the destination."]
            }
        ];
    }
};

const culturalLandmarksSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING, description: 'A brief, one-sentence description of its cultural or historical significance.' },
            lat: { type: Type.NUMBER },
            lon: { type: Type.NUMBER }
        },
        required: ['name', 'description', 'lat', 'lon']
    }
};

export const fetchCulturalLandmarks = async (bounds: { _northEast: { lat: number, lng: number }, _southWest: { lat: number, lng: number } }, language: string): Promise<CulturalLandmark[]> => {
    // Discretize bounds for effective caching. Rounding to 1 decimal place creates a grid of ~11km cells.
    const cacheKey = `${language}:${bounds._northEast.lat.toFixed(1)}:${bounds._northEast.lng.toFixed(1)}:${bounds._southWest.lat.toFixed(1)}:${bounds._southWest.lng.toFixed(1)}`;
    if (culturalLandmarksCache.has(cacheKey)) {
        return culturalLandmarksCache.get(cacheKey)!;
    }

    if (!ai) {
        console.error(initializationError || "Cultural landmark service is unavailable.");
        return [];
    }
    try {
        const prompt = `List up to 10 significant cultural landmarks and historical sites in Lagos, Nigeria, that fall within this geographical bounding box. Respond in the ${language} language.
        North: ${bounds._northEast.lat}, South: ${bounds._southWest.lat}, East: ${bounds._northEast.lng}, West: ${bounds._southWest.lng}.
        For each, provide its name, a brief one-sentence description of its cultural or historical significance, and its precise latitude and longitude.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: culturalLandmarksSchema,
            },
        });

        const jsonText = response.text.trim();
        const landmarks = JSON.parse(jsonText) as CulturalLandmark[];
        culturalLandmarksCache.set(cacheKey, landmarks);
        return landmarks;
    } catch (error) {
        console.error("Error fetching cultural landmarks:", error);
        return [];
    }
};

const landmarkDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        details: { 
            type: Type.STRING, 
            description: 'A detailed history and cultural significance of the landmark, formatted in well-structured paragraphs.' 
        },
        imageUrl: { 
            type: Type.STRING,
            description: 'A publicly accessible URL for a high-quality, relevant image of the landmark.'
        }
    },
    required: ['details', 'imageUrl']
};

export const fetchLandmarkDetails = async (landmarkName: string, language: string): Promise<{ details: string; imageUrl: string; }> => {
    const cacheKey = `${landmarkName}:${language}`;
    if (landmarkDetailsCache.has(cacheKey)) {
        return landmarkDetailsCache.get(cacheKey)!;
    }

    if (!ai) {
        return {
            details: initializationError || "The AI service is currently unavailable.",
            imageUrl: ''
        };
    }
    try {
        const prompt = `Provide a detailed history and cultural significance of "${landmarkName}" in Lagos, Nigeria. Also provide a publicly accessible URL for a high-quality, relevant image of the landmark. Format the response as a JSON object with "details" and "imageUrl" keys. Respond in the ${language} language.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: landmarkDetailsSchema,
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText) as { details: string; imageUrl: string; };
        landmarkDetailsCache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error("Error fetching landmark details:", error);
        return {
            details: "Sorry, I couldn't find more details about this place right now. Please try again later.",
            imageUrl: ''
        };
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    if (!ai) {
        console.error(initializationError || "TTS service is unavailable.");
        return null;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;

    } catch (error) {
        console.error("Error generating speech from Gemini API:", error);
        return null;
    }
};