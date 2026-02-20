import { Habit } from '../types/habit';

export interface MotivationMessage {
  text: string;
  emoji: string;
  type: 'success' | 'warning' | 'info';
}

const SUCCESS_MESSAGES: MotivationMessage[] = [
  { text: "Harika gidiyorsun, devam et!", emoji: "🔥", type: 'success' },
  { text: "Zinciri kırma, harika bir ivme yakaladın!", emoji: "🚀", type: 'success' },
  { text: "Azmin elinden hiçbir şey kurtulmaz!", emoji: "💪", type: 'success' },
];

const INACTIVE_MESSAGES: MotivationMessage[] = [
  { text: "Hadi, bugün küçük bir adım at!", emoji: "🌱", type: 'warning' },
  { text: "En zor adım ilk adımdır, sen bunu yapabilirsin.", emoji: "✨", type: 'warning' },
  { text: "Hedeflerin seni bekliyor, geç kalmış sayılmazsın.", emoji: "⏳", type: 'warning' },
];

const DEFAULT_MESSAGES: MotivationMessage[] = [
  { text: "Bugün yeni bir fırsat, hadi değerlendirelim!", emoji: "☀️", type: 'info' },
  { text: "Küçük adımlar büyük değişimler yaratır.", emoji: "💎", type: 'info' },
  { text: "Kendin için bir şey yapmanın tam zamanı.", emoji: "🎯", type: 'info' },
];

export const getMotivationalMessage = (habits: Habit[]): MotivationMessage => {
  if (habits.length === 0) return DEFAULT_MESSAGES[0];

  const today = new Date().toISOString().split('T')[0];
  const completedCount = habits.filter(h => h.completedDates.includes(today)).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  // 1. Completion State (100%)
  if (progress === 1 && totalCount > 0) {
    return {
      text: "Bugünün şampiyonu sensin! Tüm hedefler tamamlandı. 🏆",
      emoji: "🌟",
      type: 'success'
    };
  }

  // 2. High Progress (> 75%)
  if (progress >= 0.75) {
     return {
      text: "Çok az kaldı! Günü harika bitirmek üzeresin.",
      emoji: "🚀",
      type: 'success'
    };
  }

  // 3. Mid Progress (approx 50%)
  if (progress >= 0.4 && progress < 0.75) {
     return {
      text: "Harika gidiyorsun! Yarıyı geçtin, devam et.",
      emoji: "🔥",
      type: 'info'
    };
  }

  // 4. Just Started (> 0% but low)
  if (progress > 0 && progress < 0.4) {
     return {
      text: "İlk adımı attın, gerisi çorap söküğü gibi gelecek!",
      emoji: "👍",
      type: 'info'
    };
  }

  // 5. Not Started (0%) - Context Aware
  if (progress === 0) {
    const currentHour = new Date().getHours();
    if (currentHour < 10) {
        return { text: "Günaydın! Güne bir hedefle başlamaya ne dersin?", emoji: "☀️", type: 'info' }; 
    } else if (currentHour >= 20) {
        return { text: "Günü bitirmeden en azından bir hedefi tamamlayalım.", emoji: "🌙", type: 'warning' };
    }
  }

  // ... keep existing logic as fallback or secondary checks ...

  // 6. Analyze Streak Loss
  const lostStreakHabit = habits.find(h => h.streak === 0 && h.completedDates.length > 10);
  if (lostStreakHabit) {
    return {
      text: `${lostStreakHabit.title} serin bozuldu ama pes etme! Bugün yeniden başla.`,
      emoji: "🔄",
      type: 'warning'
    };
  }

  // 7. Category Weakness (Health check)
  const healthHabits = habits.filter(h => h.category === 'health' && !h.completedDates.includes(today));
  if (healthHabits.length > 0) {
    const currentHour = new Date().getHours();
    if (currentHour > 18) {
      return {
        text: "Bugün sağlığın için henüz bir şey yapmadın. Ufak bir egzersiz?",
        emoji: "❤️",
        type: 'warning'
      };
    }
  }

  return DEFAULT_MESSAGES[Math.floor(Math.random() * DEFAULT_MESSAGES.length)];
};
