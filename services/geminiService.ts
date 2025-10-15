import { GoogleGenAI, Type } from "@google/genai";
import type { Place } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        { name: 'Error fetching data', category: 'Error', description: 'Could not connect to the discovery service. Please check your API key and network connection.' },
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
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are EkoBot, a friendly and witty navigation assistant for Lagos, Nigeria. You must understand and respond fluently in English, Yoruba, Hausa, and Igbo. You will often be provided with the user's current GPS coordinates (latitude, longitude). Use this information to provide accurate, location-aware directions and recommendations. Keep your answers concise and helpful for navigation and discovering places in Lagos.",
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