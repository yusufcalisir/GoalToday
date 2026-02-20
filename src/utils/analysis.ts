import { Habit } from '../types/habit';
import { Exam } from '../types/exam';

export interface Insight {
  id: string;
  type: 'motivation' | 'pattern' | 'exam' | 'suggestion';
  message: string;
  icon: string;
  color: string;
  priority: number; // Higher is more important
}

export const analyzeHabits = (habits: Habit[], exams: Exam[]): Insight[] => {
  const insights: Insight[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const hour = today.getHours();

  // 1. Exam Countdown Logic (High Priority)
  exams.forEach(exam => {
    const examDate = new Date(exam.date);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 3) {
      insights.push({
        id: `exam-${exam.id}`,
        type: 'exam',
        message: `📢 ${exam.title} sınavına sadece ${diffDays} gün kaldı! Bugün 1 saat ekstra çalışmaya ne dersin?`,
        icon: 'AlertCircle',
        color: '#E74C3C',
        priority: 10
      });
    } else if (diffDays === 7) {
        insights.push({
            id: `exam-${exam.id}-7`,
            type: 'exam',
            message: `📅 ${exam.title} sınavına 1 hafta var. Konu tekrarlarına başlamak için harika bir gün.`,
            icon: 'Calendar',
            color: '#F39C12',
            priority: 8
        });
    }
  });

  // 2. Time-Based Pattern Analysis
  // "You usually do X in the morning, but haven't done it yet."
  const timeOfDay = hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening');
  
  habits.forEach(habit => {
      if (habit.completedDates.includes(todayStr)) return; // Already done today

      // Check logs to see average completion hour
      if (habit.logs && habit.logs.length > 5) {
          const hours = habit.logs.map(log => new Date(log).getHours());
          const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
          
          const usualTime = avgHour < 12 ? 'morning' : (avgHour < 18 ? 'afternoon' : 'evening');

          if (usualTime === timeOfDay) {
             insights.push({
                  id: `pattern-${habit.id}`,
                  type: 'pattern',
                  message: `💡 Genelde bu saatlerde "${habit.title}" yapıyorsun. Serini bozma!`,
                  icon: 'Clock',
                  color: habit.color,
                  priority: 7
             });
          } else if (timeOfDay === 'evening' && usualTime === 'morning') {
              insights.push({
                  id: `missed-${habit.id}`,
                  type: 'suggestion',
                  message: `🌙 Sabah "${habit.title}" hedefini kaçırdın, ama akşam telafi edebilirsin.`,
                  icon: 'Moon',
                  color: '#9B59B6',
                  priority: 5
              });
          }
      }
  });

  // 3. Consistency/Streak Motivation
  const streakRiskHabits = habits.filter(h => h.streak > 3 && !h.completedDates.includes(todayStr));
  if (streakRiskHabits.length > 0) {
      const habit = streakRiskHabits[0]; // Pick one
      insights.push({
          id: `streak-${habit.id}`,
          type: 'motivation',
          message: `🔥 "${habit.title}" için ${habit.streak} günlük serin tehlikede! Hemen tamamla.`,
          icon: 'Flame',
          color: '#FF6F61',
          priority: 9
      });
  }

  // 4. General Motivation (Fallback)
  if (insights.length === 0) {
      const messages = [
          "Bugün harika bir gün olacak. Küçük bir adımla başla! 🚀",
          "Her gün %1 daha iyi olmak, yıl sonunda devasa bir fark yaratır. 📈",
          "Sanal bahçen hareketini bekliyor. Biraz yürüyüşe ne dersin? 🌿",
          "Kendine inan, hedeflerine ulaşmak senin elinde. ✨"
      ];
      insights.push({
          id: 'general-motivation',
          type: 'motivation',
          message: messages[Math.floor(Math.random() * messages.length)],
          icon: 'Sparkles',
          color: '#F1C40F',
          priority: 1
      });
  }

  // Sort by priority
  return insights.sort((a, b) => b.priority - a.priority);
};
