import * as Network from 'expo-network';
import { useState, useEffect } from 'react';
import { logger } from './logger';

class NetworkManagerService {
  private isConnected: boolean = true;
  private listeners: ((isConnected: boolean) => void)[] = [];

  constructor() {
    this.init();
  }

  async init() {
    try {
      const state = await Network.getNetworkStateAsync();
      this.isConnected = state.isConnected ?? true;
      logger.info(`[Network] Initial State: ${this.isConnected ? 'ONLINE' : 'OFFLINE'}`);
    } catch (e) {
      logger.error('[Network] Init failed', e);
    }
  }

  get online() {
    return this.isConnected;
  }

  async checkConnection() {
    try {
      const state = await Network.getNetworkStateAsync();
      const status = state.isConnected ?? false;
      
      if (status !== this.isConnected) {
          this.isConnected = status;
          this.notifyListeners();
          logger.info(`[Network] Changed to: ${status ? 'ONLINE' : 'OFFLINE'}`);
      }
      return status;
    } catch (e) {
      return false;
    }
  }

  addListener(callback: (isConnected: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.isConnected));
  }
}

export const NetworkManager = new NetworkManagerService();

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(NetworkManager.online);

  useEffect(() => {
    // Poll every 10 seconds as a backup to event listeners if needed, 
    // or just rely on manual checks for now. 
    // Expo Network doesn't have a reliable background listener on all platforms easily without bare workflow,
    // so we'll check on app state changes or intervals.
    
    // For now, let's just sync with the manager
    const unsubscribe = NetworkManager.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
};
