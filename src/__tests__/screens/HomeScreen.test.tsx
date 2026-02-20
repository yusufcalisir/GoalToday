import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../../screens/HomeScreen';

// Mocks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

const mockHabits = [
    { id: '1', title: 'Test Habit 1', category: 'health', completedDates: [], streak: 0, color: 'red' }
];

const mockContext = {
    habits: mockHabits,
    getTodaysHabits: () => mockHabits,
    userProfile: { name: 'Test User', avatar: '👤' },
    colors: {
      primary: '#000',
      card: '#fff',
      border: '#ccc',
      text: '#000',
      subText: '#666',
      backgroundGradient: ['#fff', '#fff'],
      primaryGradient: ['#000', '#000'],
      categories: {},
    },
    toggleHabitCompletion: jest.fn(),
    dailyTask: 'Drink Water',
    isDailyTaskCompleted: false,
    completeDailyTask: jest.fn(),
};

jest.mock('../../context/HabitContext', () => ({
  useHabits: () => mockContext,
}));

jest.mock('../../hooks/useStepGarden', () => ({
  useStepGarden: () => ({
    steps: 1234,
    stage: { label: 'Tohum', icon: 'Leaf' },
    permissionStatus: 'granted',
    isManualMode: false,
    addManualSteps: jest.fn(),
    retryConnection: jest.fn(),
  }),
}));

jest.mock('lucide-react-native', () => ({
  Flame: 'Flame',
  Calendar: 'Calendar',
  Bell: 'Bell',
  SlidersHorizontal: 'SlidersHorizontal',
  Sparkles: 'Sparkles',
  CheckCircle: 'CheckCircle',
  Award: 'Award',
  Footprints: 'Footprints',
}));

jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');
jest.mock('react-native-svg', () => ({
    __esModule: true,
    default: 'Svg',
    Circle: 'Circle',
}));
jest.mock('expo-haptics', () => ({
    notificationAsync: jest.fn(),
    NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

describe('HomeScreen', () => {
    it('renders correctly', async () => {
        const { getByText } = render(<HomeScreen />);
        
        await waitFor(() => {
            expect(getByText('Hedefim')).toBeTruthy(); // Header (1 habit)
            expect(getByText('Test Habit 1')).toBeTruthy(); // Habit Title
            expect(getByText('1234')).toBeTruthy(); // Steps
        });
    });

    it('shows daily task', async () => {
        const { getByText } = render(<HomeScreen />);
        await waitFor(() => {
            expect(getByText('GÜNÜN GÖREVİ')).toBeTruthy();
            expect(getByText('Drink Water')).toBeTruthy();
        });
    });
});
