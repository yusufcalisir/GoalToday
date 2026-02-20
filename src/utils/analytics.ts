import { logger } from './logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncQueue } from './syncQueue';
import { NetworkManager } from './network';

export type EventName = 
  | 'APP_OPEN' 
  | 'HABIT_CREATED' 
  | 'HABIT_COMPLETED' 
  | 'HABIT_DELETED'
  | 'EXAM_CREATED' 
  | 'STEP_GARDEN_UPDATE' 
  | 'SCREEN_VIEW'
  | 'ERROR_OCCURRED';

interface DailyStats {
    date: string;
    events: Record<string, number>;
}

const STATS_KEY = 'usage_stats_v1';

export const Analytics = {
  trackEvent: async (name: EventName, params?: any) => {
    logger.info(`[Analytics] ${name}`, params);
    
    // 1. Local Aggregation (Always works)
    try {
        await updateLocalStats(name);
    } catch (e) {
        logger.error('Failed to update stats', e);
    }

    // 2. Queue for Sync (Cloud)
    // Even if online, we queue it to handle reliable delivery via the flush mechanism
    // SyncQueue handles immediate flush if online
    SyncQueue.enqueue({
        type: 'ANALYTICS',
        payload: { name, params, timestamp: Date.now() }
    });
  },
  
  trackScreen: (screenName: string) => {
    logger.info(`[Screen] ${screenName}`);
    Analytics.trackEvent('SCREEN_VIEW', { screen: screenName });
  }
};

// Helper to update daily counts
const updateLocalStats = async (eventName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const data = await AsyncStorage.getItem(STATS_KEY);
    let stats: DailyStats[] = data ? JSON.parse(data) : [];
    
    // Find or create today's entry
    let todayEntry = stats.find(s => s.date === today);
    if (!todayEntry) {
        todayEntry = { date: today, events: {} };
        stats.unshift(todayEntry); // Add new day to top
        // Keep only last 30 days
        if (stats.length > 30) stats.pop(); 
    }
    
    // Increment count
    todayEntry.events[eventName] = (todayEntry.events[eventName] || 0) + 1;
    
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const getUsageStats = async () => {
    const data = await AsyncStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : [];
};
