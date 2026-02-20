import { useState, useEffect, useRef, useCallback } from 'react';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Leaf, Footprints, Sprout, Flower, Trees, AlertTriangle, Activity } from 'lucide-react-native';
import { Platform, AppState, AppStateStatus, PermissionsAndroid } from 'react-native';
import StepCounter from '../native/StepCounter';

const STORAGE_KEY_PREFIX = 'daily_steps_';
const LAST_SESSION_STEPS_KEY = 'last_session_steps';

export type GrowthStage = {
    icon: any;
    label: string;
    color: string;
};

export const useStepGarden = () => {
  const [steps, setSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | 'checking'>('checking');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isManualMode, setIsManualMode] = useState(false);

  // Refs for logic consistency
  const initialBootSteps = useRef<number | null>(null);
  const sessionStartSteps = useRef<number>(0);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const subscription = useRef<Pedometer.Subscription | null>(null);

  useEffect(() => {
    // Check sensors and permissions on mount
    checkAvailabilityAndStart();

    // Handle App State changes (background/foreground) to save data
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
        subscription.remove();
        stopPedometer();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
          // App going to background: Save current Total
          saveStepsToStorage(steps); 
      }
      if (appState.current.match(/background/) && nextAppState === 'active') {
          // App coming to foreground: Refresh/Resync
          // On iOS this might need a refresh call
          if (Platform.OS === 'ios') {
              refreshIOSSteps();
          }
      }
      appState.current = nextAppState;
  };

  const checkAvailabilityAndStart = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasSensor = await StepCounter.isSensorAvailable();
        if (hasSensor) {
            setIsPedometerAvailable(true);
            // On Android 10+, we need ACTIVITY_RECOGNITION
            if (Platform.Version >= 29) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setPermissionStatus('granted');
                    startTracking();
                } else {
                    setPermissionStatus('denied');
                    enableManualFallback();
                }
            } else {
                setPermissionStatus('granted');
                startTracking();
            }
            return;
        }
      }

      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
          const perm = await Pedometer.getPermissionsAsync();
          if (perm.granted) {
              setPermissionStatus('granted');
              startTracking();
          } else {
              if (perm.canAskAgain) {
                  const newPerm = await Pedometer.requestPermissionsAsync();
                  if (newPerm.granted) {
                      setPermissionStatus('granted');
                      startTracking();
                  } else {
                      setPermissionStatus('denied');
                      enableManualFallback();
                  }
              } else {
                  setPermissionStatus('denied');
                  enableManualFallback();
              }
          }
      } else {
          enableManualFallback();
      }
    } catch (e) {
      console.log('Error checking pedometer:', e);
      setIsPedometerAvailable(false);
      enableManualFallback();
    }
  };

  const enableManualFallback = async () => {
      setIsManualMode(true);
      // Load manual steps from storage
      const today = new Date().toISOString().split('T')[0];
      const saved = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${today}`);
      if (saved) {
          setSteps(parseInt(saved, 10));
      }
  };

  const startTracking = async () => {
      // 1. Load today's existing total from storage
      const today = new Date().toISOString().split('T')[0];
      const savedStr = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${today}`);
      let savedTotal = savedStr ? parseInt(savedStr, 10) : 0;
      
      // Update state immediately with what we have
      setSteps(savedTotal);
      sessionStartSteps.current = savedTotal;

      if (Platform.OS === 'ios') {
          refreshIOSSteps();
      } else {
          const hasSensor = await StepCounter.isSensorAvailable();
          if (hasSensor) {
              startNativeAndroidTracking();
          } else {
              startAndroidTracking(savedTotal);
          }
      }
  };

  const startNativeAndroidTracking = async () => {
      // Start the foreground service
      await StepCounter.startTracking();
      
      // Load initial count
      const initialSteps = await StepCounter.getTodaySteps();
      setSteps(initialSteps);

      // Listen for updates
      StepCounter.addListener((event) => {
          setSteps(event.steps);
      });
  };

  // iOS Strategy: Use getStepCountAsync for absolute accuracy
  const refreshIOSSteps = async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();

      try {
          const result = await Pedometer.getStepCountAsync(start, end);
          if (result) {
              setSteps(result.steps);
              saveStepsToStorage(result.steps);
          }
      } catch (e) {
          console.log('iOS Step refresh error:', e);
      }
  };

  // Android Strategy: Watch updates and accumulate session delta
  const startAndroidTracking = async (baseSteps: number) => {
      if (subscription.current) {
          subscription.current.remove();
      }

      initialBootSteps.current = null; // Reset reference

      subscription.current = Pedometer.watchStepCount(result => {
        // result.steps is "steps since boot" or "steps since sensor start"
        
        if (initialBootSteps.current === null) {
            initialBootSteps.current = result.steps;
        }

        // Handle Potential Reboot (if current < ref)
        if (result.steps < initialBootSteps.current) {
            initialBootSteps.current = result.steps; // Reset ref
        }
        
        const delta = result.steps - initialBootSteps.current;
        const newTotal = baseSteps + delta;
        
        // Prevent negative jumps or weird resets
        if (newTotal >= steps) {
            setSteps(newTotal);
             if (delta % 20 === 0) { // Save more frequently
                saveStepsToStorage(newTotal);
             }
        }
      });
  };

  const stopPedometer = () => {
      if (subscription.current) {
          subscription.current.remove();
          subscription.current = null;
      }
  };

  const saveStepsToStorage = async (count: number) => {
      try {
          const today = new Date().toISOString().split('T')[0];
          await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${today}`, count.toString());
      } catch (e) {
          console.error("Failed to save steps", e);
      }
  };

  const addManualSteps = async (amount: number) => {
      const newTotal = steps + amount;
      setSteps(newTotal);
      saveStepsToStorage(newTotal);
      
      // If we added manually, we update the session base too so Android calculation doesn't overwrite it
      if (Platform.OS === 'android' && !isManualMode) {
          // Restart tracking with new base to prevent overwriting
          startAndroidTracking(newTotal);
      }
  };

  const getGrowthStage = (): GrowthStage => {
      if (steps < 2500) return { icon: Leaf, label: 'Tohum', color: '#88B04B' };
      if (steps < 5000) return { icon: Sprout, label: 'Filiz', color: '#4CAF50' };
      if (steps < 7500) return { icon: Flower, label: 'Çiçek', color: '#E91E63' };
      if (steps < 10000) return { icon: Trees, label: 'Orman', color: '#2E7D32' };
      return { icon: Activity, label: 'Zirve', color: '#FFD700' };
  };

  const getMissingPermissionAlert = () => {
      if (Platform.OS === 'ios') {
          return "Ayarlar > Gizlilik > Hareket ve Fitness kısmından izni açmalısın.";
      }
      return "Ayarlar'dan Fiziksel Aktivite iznini vermelisin.";
  };

  return {
    steps,
    stage: getGrowthStage(),
    isPedometerAvailable,
    permissionStatus,
    isManualMode,

    addManualSteps,
    permissionAlert: getMissingPermissionAlert(),
    retryConnection: checkAvailabilityAndStart
  };
};
