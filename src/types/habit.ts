export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  streak: number;
  completedDates: string[]; // ISO Date Strings (YYYY-MM-DD)
  createdAt: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'specific';
  specificDays?: number[]; // 0 = Sunday, 1 = Monday...
  logs?: string[]; // ISO Date Strings with time (YYYY-MM-DDTHH:mm:ss.sssZ)
}

export type RootStackParamList = {
  Welcome: undefined;
  Registration: undefined;
  OnboardingGoals: undefined;
  HabitDetail: { habitId: string };
  Main: undefined;
  AddHabit: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
};
