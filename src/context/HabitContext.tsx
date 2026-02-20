import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/habit';
import { UserProfile } from '../types/user';
import { Exam } from '../types/exam';
import { STORAGE_KEYS } from '../constants/keys';
import { calculateStreak } from '../utils/streak';
import { getColors } from '../constants/colors';
import { useColorScheme } from 'react-native';
import { scheduleNotifications } from '../utils/notifications';
import * as Notifications from 'expo-notifications';

interface HabitContextType {
  habits: Habit[];
  userProfile: UserProfile | null;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => void;
  addMultipleHabits: (habits: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>[]) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  updateUserProfile: (profile: UserProfile) => void;
  loading: boolean;
  colors: any;
  dailyTask: string | null;
  isDailyTaskCompleted: boolean;
  completeDailyTask: () => void;
  exams: Exam[];
  addExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  resetData: () => Promise<void>;
  getTodaysHabits: () => Habit[];
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const MINI_TASKS = [
  "5 dakika meditasyon yap 🧘",
  "Bir bardak su iç 💧",
  "10 sayfa kitap oku 📚",
  "Dışarı çık ve temiz hava al 🌳",
  "Gözlerini 1 dakika dinlendir 👀",
  "Sevdiğin bir şarkıyı dinle 🎵",
  "Bugün şükrettiğin 3 şeyi yaz ✨",
  "Odanı havalandır 🌬️",
  "Arkadaşına güzel bir mesaj at 💬",
  "Kendine bir kahve ısmarla ☕"
];

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTask, setDailyTask] = useState<string | null>(null);
  const [isDailyTaskCompleted, setIsDailyTaskCompleted] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    loadData();
    checkDailyTask();
  }, []);



  const checkDailyTask = async () => {
    try {
      const storedTask = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_TASK);
      const storedDate = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_TASK_DATE);
      const today = new Date().toISOString().split('T')[0];

      if (storedDate === today && storedTask && storedTask.length > 0) {
        setDailyTask(storedTask);
        const completed = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_TASK_COMPLETED);
        setIsDailyTaskCompleted(completed === 'true');
      } else {
        // New day, new task
        generateNewDailyTask();
      }
    } catch (e) {
      console.error('Failed to load daily task', e);
      // Fallback
      if (!dailyTask) generateNewDailyTask();
    }
  };

  const generateNewDailyTask = async () => {
      const today = new Date().toISOString().split('T')[0];
      const newTask = MINI_TASKS[Math.floor(Math.random() * MINI_TASKS.length)];
      
      setDailyTask(newTask);
      setIsDailyTaskCompleted(false);
      
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASK, newTask);
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASK_DATE, today);
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASK_COMPLETED, 'false');
  };

  const completeDailyTask = async () => {
    if (isDailyTaskCompleted || !userProfile) return;
    
    setIsDailyTaskCompleted(true);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASK_COMPLETED, 'true');
    
    // Award 10 points and increment count
    const newPoints = (userProfile.points || 0) + 10;
    const newCount = (userProfile.completedDailyTasksCount || 0) + 1;
    updateUserProfile({ ...userProfile, points: newPoints, completedDailyTasksCount: newCount });
  };

  const loadData = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      // Load Exams - STORAGE_KEYS.EXAMS needs to be added or use string literal for now
      const storedExams = await AsyncStorage.getItem(STORAGE_KEYS.EXAMS);
      
      let currentHabits: Habit[] = [];
      if (storedHabits) {
        currentHabits = JSON.parse(storedHabits);
        setHabits(currentHabits);
      }
      
      if (storedExams) {
        setExams(JSON.parse(storedExams));
      }

      if (storedUser) {
          try {
              const parsedUser = JSON.parse(storedUser);
              if (typeof parsedUser === 'object' && parsedUser !== null) {
                  // Ensure points exist
                  if (typeof parsedUser.points === 'undefined') {
                      parsedUser.points = 0;
                  }
                  
                  // Ensure completedDailyTasksCount exists
                  if (typeof parsedUser.completedDailyTasksCount === 'undefined') {
                      parsedUser.completedDailyTasksCount = 0;
                  }

                  // Migrating old notificationTime to notificationSettings
                  if (!parsedUser.notificationSettings && parsedUser.notificationTime) {
                      parsedUser.notificationSettings = {
                          enabled: true,
                          times: [parsedUser.notificationTime],
                          smartFrequency: false
                      };
                      delete parsedUser.notificationTime;
                  } else if (!parsedUser.notificationSettings) {
                       // Default if neither exists
                      parsedUser.notificationSettings = {
                          enabled: true,
                          times: [{ hour: 9, minute: 0 }],
                          smartFrequency: false
                      };
                  }

                  setUserProfile(parsedUser);
                  // Ensure notifications are scheduled on app launch
                  scheduleNotifications(parsedUser.notificationSettings, currentHabits);
              }
          } catch {
              // Legacy error handling
          }
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(newHabits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  };

  const resetData = async () => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.HABITS,
            STORAGE_KEYS.USER_SETTINGS,
            STORAGE_KEYS.EXAMS,
            STORAGE_KEYS.DAILY_TASK,
            STORAGE_KEYS.DAILY_TASK_DATE,
            STORAGE_KEYS.DAILY_TASK_COMPLETED
        ]);
        
        setHabits([]);
        setUserProfile(null);
        setExams([]);
        setDailyTask(null);
        setIsDailyTaskCompleted(false);
        
        // Cancel all notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        // Regenerate daily task immediately so UI isn't empty
        setTimeout(() => {
            generateNewDailyTask();
        }, 500);

    } catch (e) {
        console.error('Failed to reset data', e);
    }
  };

  const saveExams = async (newExams: Exam[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(newExams));
    } catch (e) {
      console.error('Failed to save exams', e);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(profile));
      await scheduleNotifications(profile.notificationSettings, habits);
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(),
      createdAt: new Date().toISOString(),
      streak: 0,
      completedDates: [],
    };
    setHabits(prev => {
        const updated = [...prev, newHabit];
        saveHabits(updated);
        return updated;
    });
  };

  const addMultipleHabits = (habitsData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>[]) => {
    const newHabits: Habit[] = habitsData.map((h, index) => ({
        ...h,
        id: (Date.now() + index).toString() + Math.random().toString(36).substr(2, 5),
        createdAt: new Date().toISOString(),
        streak: 0,
        completedDates: [],
    }));

    setHabits(prev => {
        const updated = [...prev, ...newHabits];
        saveHabits(updated);
        return updated;
    });
  };

  const addExam = (exam: Exam) => {
      const updatedExams = [...exams, exam];
      setExams(updatedExams);
      saveExams(updatedExams);
  };

  const updateExam = (updatedExam: Exam) => {
      const updatedExams = exams.map(e => e.id === updatedExam.id ? updatedExam : e);
      setExams(updatedExams);
      saveExams(updatedExams);
  };

  const deleteExam = (id: string) => {
      const updatedExams = exams.filter(e => e.id !== id);
      setExams(updatedExams);
      saveExams(updatedExams);
  };

  const toggleHabitCompletion = (id: string, date: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(date);
        let newCompletedDates: string[];
        let newLogs = habit.logs || [];

        if (isCompleted) {
          // Uncheck: Remove date and relevant logs
          newCompletedDates = habit.completedDates.filter(d => d !== date);
          newLogs = newLogs.filter(log => !log.startsWith(date));
        } else {
          // Check: Add date and log timestamp
          newCompletedDates = [...habit.completedDates, date];
          newLogs = [...newLogs, new Date().toISOString()];
        }
        
        const newStreak = calculateStreak(newCompletedDates);
        
        return { 
          ...habit, 
          completedDates: newCompletedDates, 
          streak: newStreak,
          logs: newLogs 
        };
      }
      return habit;
    });
    setHabits(updatedHabits);
    saveHabits(updatedHabits);
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== id);
    setHabits(updatedHabits);
    saveHabits(updatedHabits);
  };

  const getTodaysHabits = () => {
    const today = new Date().getDay(); // 0 is Sunday
    return habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'specific' && habit.specificDays?.includes(today)) return true;
      return false;
    });
  };

  const systemTheme = useColorScheme();
  const currentTheme = userProfile?.theme === 'system' ? (systemTheme || 'light') : (userProfile?.theme || 'light');
  const appColors = getColors(currentTheme as any, userProfile?.accentColor);

  const contextValue = React.useMemo(() => ({
    habits,
    userProfile,
    addHabit,
    addMultipleHabits,
    toggleHabitCompletion,
    deleteHabit,
    updateUserProfile,
    loading,
    colors: appColors,
    dailyTask,
    isDailyTaskCompleted,
    completeDailyTask,
    exams,
    addExam,
    updateExam,
    deleteExam,
    resetData,
    getTodaysHabits
  }), [
    habits,
    userProfile,
    loading,
    appColors,
    dailyTask,
    isDailyTaskCompleted,
    exams
  ]);

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
