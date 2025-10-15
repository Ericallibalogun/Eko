export enum Screen {
  Splash,
  Onboarding,
  Login,
  Signup,
  Permissions,
  Home,
  Explore,
  Favorites,
  Settings,
  AR,
}

export interface Place {
  name: string;
  category: string;
  description:string;
}

export interface SavedPlace {
    name: string;
    category: string;
    imageUrl: string;
}

export interface UserProfile {
    name: string;
    email: string;
    avatarUrl: string;
}

export interface Settings {
    theme: 'Dark' | 'Light' | 'Auto';
    language: 'English' | 'Yoruba' | 'Hausa' | 'Igbo';
    mapSource: 'OpenStreetMap' | 'Google Maps';
}

export interface SettingsSection {
    title: string;
    items: {
        label: string;
        type: 'toggle' | 'select';
        options?: string[];
        key: keyof Settings;
    }[];
}
