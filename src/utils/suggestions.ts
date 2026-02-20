import { Habit } from '../types/habit';
import { colors } from '../constants/colors';

export interface Suggestion {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  reason: string;
}

const COMMON_HABITS: Suggestion[] = [
  {
    id: 's1',
    title: 'Günde 2 Litre Su İç',
    category: 'health',
    icon: '💧',
    color: '#0984E3',
    reason: 'Hidrasyon enerjini ve odaklanmanı artırır.',
  },
  {
    id: 's2',
    title: '20 Sayfa Kitap Oku',
    category: 'learning',
    icon: '📚',
    color: '#6C63FF',
    reason: 'Düzenli okuma kelime dağarcığını geliştirir.',
  },
  {
    id: 's3',
    title: '30 Dakika Yürüyüş Yap',
    category: 'health',
    icon: '🚶',
    color: '#00B894',
    reason: 'Günlük yürüyüş kalp sağlığını korur.',
  },
  {
    id: 's4',
    title: 'Erken Uyan (07:00)',
    category: 'productivity',
    icon: '☀️',
    color: '#FDCB6E',
    reason: 'Günün en verimli saatlerini yakala.',
  },
  {
    id: 's5',
    title: 'Günün Planını Yap',
    category: 'productivity',
    icon: '📝',
    color: '#E17055',
    reason: 'Net bir plan günü daha iyi yönetmeni sağlar.',
  },
  {
    id: 's6',
    title: 'Ailene Zaman Ayır',
    category: 'social',
    icon: '👨‍👩‍👧‍👦',
    color: '#FF7675',
    reason: 'Sevdiklerinle bağlarını canlı tut.',
  },
  {
    id: 's7',
    title: 'Bütçeni Kontrol Et',
    category: 'finance',
    icon: '💰',
    color: '#2D3436',
    reason: 'Harcamalarını takip etmek finansal özgürlük sağlar.',
  },
  {
    id: 's8',
    title: 'Meditasyon Yap',
    category: 'mindfulness',
    icon: '🧘',
    color: '#a29bfe',
    reason: 'Zihnini sakinleştir ve stresi azalt.',
  },
];

export const getSmartSuggestions = (currentHabits: Habit[]): Suggestion[] => {
  // Convert current habit titles to lowercase for easy comparison
  const currentTitles = currentHabits.map(h => h.title.toLowerCase());
  
  // Filter suggestions based on what the user ALREADY has
  const suggestions = COMMON_HABITS.filter(suggestion => {
    // Check if user already has a similar habit
    // Simple verification: specific keywords
    if (suggestion.id === 's1' && currentTitles.some(t => t.includes('su') || t.includes('water'))) return false;
    if (suggestion.id === 's2' && currentTitles.some(t => t.includes('oku') || t.includes('read') || t.includes('kitap'))) return false;
    if (suggestion.id === 's3' && currentTitles.some(t => t.includes('yürü') || t.includes('koş') || t.includes('spor'))) return false;
    if (suggestion.id === 's4' && currentTitles.some(t => t.includes('uyan') || t.includes('kalk'))) return false;
    if (suggestion.id === 's8' && currentTitles.some(t => t.includes('meditasyon') || t.includes('nefes'))) return false;

    return true;
  });

  // Return top 3-4 suggestions
  return suggestions.slice(0, 4);
};
