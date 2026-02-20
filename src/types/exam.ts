export interface Exam {
  id: string;
  title: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  category: 'HighSchool' | 'University' | 'Public' | 'Language' | 'Medical' | 'Other';
  color?: string;
  goal?: string;
}

export const EXAM_CATEGORIES = [
  { id: 'HighSchool', label: 'Lise (LGS)', color: '#FFB74D' }, // Orange
  { id: 'University', label: 'Üniversite (YKS)', color: '#64B5F6' }, // Blue
  { id: 'Public', label: 'Kamu (KPSS)', color: '#81C784' }, // Green
  { id: 'Language', label: 'Dil (YDS/YÖKDİL)', color: '#BA68C8' }, // Purple
  { id: 'Medical', label: 'Tıp (TUS/DUS)', color: '#E57373' }, // Red
  { id: 'Other', label: 'Diğer', color: '#90A4AE' }, // Grey
];
