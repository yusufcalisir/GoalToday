const light = {
  primary: '#6366F1', // Indigo primary
  secondary: '#F43F5E', // Rose secondary
  success: '#10B981', // Emerald green
  warning: '#F59E0B', // Amber warning
  info: '#3B82F6',    // Blue info
  orange: '#F97316',  // Orange
  error: '#EF4444',   // Red error
  background: '#F8FAFC', // Very light slate
  card: '#FFFFFF',
  text: '#0F172A',     // Slate-900
  subText: '#64748B',  // Slate-500
  border: '#E2E8F0',   // Slate-200
  inputBg: '#F1F5F9',  // Slate-100
  categories: {
    health: '#F43F5E',
    learning: '#3B82F6',
    productivity: '#F59E0B',
    mindfulness: '#10B981',
    finance: '#F97316',
    social: '#6366F1',
    general: '#94A3B8',
  },
  backgroundGradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
  primaryGradient: ['#6366F1', '#4F46E5', '#4338CA'], // Indigo 500 -> 600 -> 700
};

const dark = {
  primary: '#818CF8', // Indigo light
  secondary: '#FB7185', // Rose light
  success: '#34D399',
  error: '#F87171',
  background: '#0F172A', // Slate-900 background
  card: '#1E293B',       // Slate-800 card
  text: '#F8FAFC',       // Slate-50
  subText: '#94A3B8',    // Slate-400
  border: '#334155',     // Slate-700
  inputBg: '#1E293B',
  categories: {
    health: '#FB7185',
    learning: '#60A5FA',
    productivity: '#FBBF24',
    mindfulness: '#34D399',
    finance: '#FB923C',
    social: '#818CF8',
    general: '#64748B',
  },
  backgroundGradient: ['#0F172A', '#111827', '#1E293B'], // Denser slate/black gradient
  primaryGradient: ['#6366F1', '#4F46E5', '#4338CA'], // Brighter primary for dark mode pop
};

export type ThemeType = 'light' | 'dark';

export const getColors = (theme: ThemeType, accent?: string) => {
    const base = theme === 'light' ? light : dark;
    return {
        ...base,
        primary: accent || base.primary,
    };
};

// For backward compatibility or default use
export const colors = light;
export const themeColors = { light, dark };
