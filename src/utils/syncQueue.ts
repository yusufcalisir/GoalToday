import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { NetworkManager } from './network';

const QUEUE_KEY = 'offline_sync_queue_v1';

export type QueueItemType = 'ANALYTICS' | 'CRASH_LOG';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export const SyncQueue = {
  init: () => {
      // Subscribe to network changes
      NetworkManager.addListener((isOnline) => {
          if (isOnline) {
              logger.info('[SyncQueue] Network restored, flushing queue...');
              SyncQueue.flush();
          }
      });
  },

  enqueue: async (item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    try {
      const newItem: QueueItem = {
        ...item,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        retryCount: 0,
      };

      const currentQueue = await SyncQueue.getQueue();
      currentQueue.push(newItem);
      
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
      logger.info(`[SyncQueue] Enqueued item: ${item.type}`, newItem.id);
      
      // Try to flush immediately if online
      if (NetworkManager.online) {
          SyncQueue.flush();
      }
    } catch (e) {
      logger.error('[SyncQueue] Enqueue failed', e);
    }
  },

  getQueue: async (): Promise<QueueItem[]> => {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  flush: async () => {
    if (!NetworkManager.online) {
        logger.debug('[SyncQueue] Offline, skipping flush');
        return;
    }

    const queue = await SyncQueue.getQueue();
    if (queue.length === 0) return;

    logger.info(`[SyncQueue] Flushing ${queue.length} items...`);

    const remainingItems: QueueItem[] = [];

    for (const item of queue) {
        try {
            await processItem(item);
            logger.info(`[SyncQueue] Processed item: ${item.id}`);
        } catch (e) {
            logger.warn(`[SyncQueue] Failed to process item: ${item.id}`, e);
            item.retryCount++;
            if (item.retryCount < 5) {
                remainingItems.push(item);
            } else {
                logger.error(`[SyncQueue] Dropping item after 5 retries: ${item.id}`);
            }
        }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingItems));
  }
};

// Mock processor - In real app this would call API
const processItem = async (item: QueueItem) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate random failure
    if (Math.random() < 0.1) throw new Error("Network Glitch");
    
    // Success
    return true;
};
