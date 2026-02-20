import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { HabitProvider, useHabits } from '../HabitContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// Mock Notifications
jest.mock('expo-notifications', () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  AndroidImportance: { MAX: 4 },
  setNotificationChannelAsync: jest.fn(),
}));

jest.mock('../../utils/notifications', () => ({
  scheduleNotifications: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HabitProvider>{children}</HabitProvider>
);

describe('HabitContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('adds a habit and persists it', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      result.current.addHabit({
        title: 'New Habit',
        category: 'health',
        frequency: 'daily',
        color: '#6C63FF',
        icon: 'heart',
      });
    });

    expect(result.current.habits.length).toBe(1);
    expect(result.current.habits[0].title).toBe('New Habit');
    
    // Verify persistence
    const stored = await AsyncStorage.getItem('@habits_data');
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it('toggles habit completion correctly', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      result.current.addHabit({
        title: 'Toggle Me',
        category: 'health',
        frequency: 'daily',
        color: '#6C63FF',
        icon: 'heart',
      });
    });

    const habitId = result.current.habits[0].id;
    const today = new Date().toISOString().split('T')[0];

    await act(async () => {
      result.current.toggleHabitCompletion(habitId, today);
    });

    expect(result.current.habits[0].completedDates).toContain(today);
    expect(result.current.habits[0].streak).toBe(1);

    // Toggle off
    await act(async () => {
      result.current.toggleHabitCompletion(habitId, today);
    });

    expect(result.current.habits[0].completedDates).not.toContain(today);
    expect(result.current.habits[0].streak).toBe(0);
  });

  it('updates user profile and persists it', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    const newProfile = {
      name: 'Test User',
      avatar: '👨‍💻',
      categories: ['health'],
      isOnboarded: true,
      theme: 'dark' as const,
      accentColor: '#6C63FF',
      points: 100,
      notificationSettings: {
        enabled: true,
        times: [{ hour: 9, minute: 0 }],
        smartFrequency: true,
      },
    };

    await act(async () => {
      result.current.updateUserProfile(newProfile);
    });

    expect(result.current.userProfile?.name).toBe('Test User');
    expect(result.current.userProfile?.theme).toBe('dark');

    const storedUser = await AsyncStorage.getItem('@user_settings');
    expect(JSON.parse(storedUser!)).toEqual(newProfile);
  });

  it('completes daily task and awards points', async () => {
    // Set up user profile first
    const { result } = renderHook(() => useHabits(), { wrapper });
    
    const initialProfile = {
      name: 'Points User',
      avatar: '👨‍💻',
      categories: ['health'],
      isOnboarded: true,
      theme: 'light' as const,
      accentColor: '#6C63FF',
      points: 0,
      completedDailyTasksCount: 0,
      notificationSettings: {
        enabled: true,
        times: [{ hour: 9, minute: 0 }],
        smartFrequency: false,
      },
    };

    await act(async () => {
      result.current.updateUserProfile(initialProfile);
    });

    // Complete task
    await act(async () => {
      await result.current.completeDailyTask();
    });

    expect(result.current.isDailyTaskCompleted).toBe(true);
    expect(result.current.userProfile?.points).toBe(10);
    expect(result.current.userProfile?.completedDailyTasksCount).toBe(1);

    // Verify persistence of completion
    const storedCompleted = await AsyncStorage.getItem('@daily_task_completed');
    expect(storedCompleted).toBe('true');
  });
});
