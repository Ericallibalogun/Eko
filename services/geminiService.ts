import { GoogleGenAI, Type } from "@google/genai";
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

export const fetchExplorePlaces = async (category: string): Promise<Place[]> => {
  if (!ai) {
    return [
        { name: 'API Key Error', category: 'Error', description: initializationError! },
        { name: 'Lekki Conservation Centre', category: 'Nature', description: 'A serene nature reserve known for its long canopy walkway and diverse wildlife.' },
        { name: 'Nike Art Gallery', category: 'Culture', description: 'A stunning art gallery showcasing contemporary and traditional Nigerian art.' },
    ];
  }

  try {
    const prompt = `List 5 popular places in Lagos, Nigeria under the category "${category}". For each place, provide its name, a single category, and a brief one-sentence description.`;
    
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
    location?: { lat: number, lon: number }
): Promise<string> => {
    if (!ai) {
        return initializationError || "The AI service is currently unavailable.";
    }
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are EkoBot, a hyper-local and witty navigation assistant for Lagos, Nigeria. You are an expert in all things Lagos. You must understand and respond fluently in English, Yoruba, Hausa, and Igbo. Crucially, you will always be provided with the user's current GPS coordinates (latitude, longitude) when they are available. When a user asks for something 'nearby', 'around here', or 'close to me', you MUST use these coordinates to give specific, relevant, and actionable recommendations. If no location is provided, you should state that you need their location for a better recommendation, but still provide general suggestions for Lagos. Your tone should be friendly, helpful, and concise.",
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

export const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
    if (!ai) {
        console.error(initializationError || "Search service is unavailable.");
        return [];
    }
    if (!query || query.length < 3) return [];
    try {
        const prompt = `Provide up to 5 autocomplete suggestions for places, landmarks, or areas in Lagos, Nigeria, that start with or are related to "${query}".`;
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
        return result.suggestions || [];
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

export const fetchRoutes = async (start: { lat: number, lon: number }, end: { lat: number, lon: number }): Promise<Route[]> => {
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
        const prompt = `You are a route planning assistant for Lagos, Nigeria. Given a start latitude/longitude and an end latitude/longitude, provide up to 2 distinct route options (fastest and shortest). For each route, provide the following in a JSON array format:
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

export const fetchCulturalLandmarks = async (bounds: { _northEast: { lat: number, lng: number }, _southWest: { lat: number, lng: number } }): Promise<CulturalLandmark[]> => {
    if (!ai) {
        console.error(initializationError || "Cultural landmark service is unavailable.");
        return [];
    }
    try {
        const prompt = `List up to 10 significant cultural landmarks and historical sites in Lagos, Nigeria, that fall within this geographical bounding box:
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
        return landmarks;
    } catch (error) {
        console.error("Error fetching cultural landmarks:", error);
        return [];
    }
};

export const fetchLandmarkDetails = async (landmarkName: string): Promise<string> => {
    if (!ai) {
        return initializationError || "The AI service is currently unavailable.";
    }
    try {
        const prompt = `Provide a detailed history and cultural significance of "${landmarkName}" in Lagos, Nigeria. Format the response in well-structured paragraphs.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching landmark details:", error);
        return "Sorry, I couldn't find more details about this place right now.";
    }
};