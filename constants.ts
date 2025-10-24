import type { UserProfile, SettingsSection, SavedPlace } from './types';

export const USER_PROFILE: UserProfile = {
  name: 'Ayomide Lagos',
  email: 'ayo.lagos@example.com',
  avatarUrl: `https://api.pravatar.cc/150?u=${encodeURIComponent('ayo.lagos@example.com')}`,
};

export const SETTINGS_CONFIG: SettingsSection[] = [
  {
    title: 'Preferences',
    items: [
      {
        label: 'Theme',
        type: 'select',
        options: ['Dark', 'Light', 'Auto'],
        key: 'theme',
      },
      {
        label: 'Language',
        type: 'select',
        options: ['English', 'Yoruba', 'Hausa', 'Igbo'],
        key: 'language',
      },
      {
        label: 'Map Source',
        type: 'select',
        options: ['OpenStreetMap', 'Google Maps'],
        key: 'mapSource',
      },
      {
        label: 'Text-to-Speech',
        type: 'toggle',
        key: 'ttsEnabled',
      },
    ],
  },
];

export const SAVED_PLACES: SavedPlace[] = [
    {
      name: 'Lekki Conservation Centre',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-160530514b219-c53351a8a25a?q=80&w=870&auto=format&fit=crop',
    },
    {
      name: 'Nike Art Gallery',
      category: 'Culture',
      imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=774&auto=format&fit=crop',
    },
     {
      name: 'Freedom Park Lagos',
      category: 'Landmark',
      imageUrl: 'https://images.unsplash.com/photo-1568899347948-527b4b1b38f3?q=80&w=774&auto=format&fit=crop',
    },
];

export const RECENT_PLACES: SavedPlace[] = [
    {
      name: 'Kalakuta Republic Museum',
      category: 'Culture',
      imageUrl: 'https://images.unsplash.com/photo-1555529124-76251b6a186a?q=80&w=870&auto=format&fit=crop',
    },
     {
      name: 'Tarkwa Bay Beach',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=774&auto=format&fit=crop',
    },
];
