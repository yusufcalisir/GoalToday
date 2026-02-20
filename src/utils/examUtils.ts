import { Exam } from '../types/exam';

export const calculateDaysLeft = (dateString: string): number => {
  const examDate = new Date(dateString);
  const today = new Date();
  
  // Reset hours to compare dates properly
  examDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getExamColor = (daysLeft: number): string => {
  if (daysLeft < 0) return '#BDC3C7'; // Passed
  if (daysLeft <= 30) return '#E74C3C'; // Critical (Red)
  if (daysLeft <= 60) return '#F1C40F'; // Warning (Yellow)
  return '#2ECC71'; // Safe (Green)
};

export const getExamMotivation = (daysLeft: number, examTitle: string): string => {
  if (daysLeft < 0) return `${examTitle} tamamlandı. Sonuçlar için heyecanlı mısın?`;
  if (daysLeft === 0) return `Bugün ${examTitle} günü! Başarılar, sen yaparsın! 🍀`;
  if (daysLeft === 1) return `Yarın ${examTitle} var! Sakin ol ve kendine güven.`;
  
  if (daysLeft <= 7) return `Son hafta! ${examTitle} için son tekrarlarını yap.`;
  if (daysLeft <= 30) return `Son 1 ay! ${examTitle} yaklaşıyor, tempoyu koru.`;
  if (daysLeft <= 60) return `${examTitle} için kritik virajdasın. Eksiklerini kapat.`;
  if (daysLeft <= 100) return `${examTitle} maratonu devam ediyor. Düzenli çalışmayı bırakma.`;
  
  return `${examTitle} için önünde uzun bir yol var. İstikrarlı ol!`;
};

export const PREDEFINED_EXAMS = [
  { title: 'YKS (TYT)', category: 'University', date: '2026-06-20T10:15:00' },
  { title: 'YKS (AYT)', category: 'University', date: '2026-06-21T10:15:00' },
  { title: 'LGS', category: 'HighSchool', date: '2026-06-06T09:30:00' },
  { title: 'KPSS Genel Yetenek', category: 'Public', date: '2026-07-14T10:15:00' },
  { title: 'YDS İlkbahar', category: 'Language', date: '2026-04-09T10:15:00' },
];
