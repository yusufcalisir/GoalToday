export interface NotificationSettings {
  enabled: boolean;
  times: { hour: number; minute: number }[];
  smartFrequency: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string; // Emoji char
  categories: string[];
  isOnboarded: boolean;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  points: number;
  notificationSettings: NotificationSettings;
  isStudent?: boolean;
  completedDailyTasksCount?: number;
  universityGoal?: string;
  photoUri?: string;
}

export const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '🧘', '🏃', '📚', '🎨', '🚀', '🦁'];

export const CATEGORY_OPTIONS = [
  { id: 'general', label: 'Genel', icon: '🎯' },
  { id: 'health', label: 'Sağlık', icon: '💪' },
  { id: 'learning', label: 'Öğrenme', icon: '🧠' },
  { id: 'productivity', label: 'Üretkenlik', icon: '⚡' },
  { id: 'mindfulness', label: 'Farkındalık', icon: '🧘‍♂️' },
  { id: 'finance', label: 'Finans', icon: '💰' },
  { id: 'social', label: 'Sosyal', icon: '🤝' },
];
