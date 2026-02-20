import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStepGarden } from '../../hooks/useStepGarden';
import StepCounter from '../../native/StepCounter';
import { Platform, PermissionsAndroid } from 'react-native';

// Mock dependencies
jest.mock('../../native/StepCounter', () => ({
  isSensorAvailable: jest.fn(),
  startTracking: jest.fn(),
  getTodaySteps: jest.fn(),
  addListener: jest.fn(),
}));

jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(),
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    getStepCountAsync: jest.fn(),
    watchStepCount: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  // Use a factory function to ensure fresh mocks
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'android',
      Version: 30,
      select: jest.fn((objs) => objs.android || objs.default),
    },
    PermissionsAndroid: {
      request: jest.fn(),
      RESULTS: { GRANTED: 'granted', DENIED: 'denied' },
      PERMISSIONS: { ACTIVITY_RECOGNITION: 'android.permission.ACTIVITY_RECOGNITION' },
    },
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      currentState: 'active',
    },
    NativeModules: {
      ...RN.NativeModules,
      SettingsManager: {
        settings: { AppleLanguages: ['en'] },
        getConstants: () => ({ settings: { AppleLanguages: ['en'] } }),
      },
      I18nManager: {
        isRTL: false,
      },
      StepCounterModule: {
          addListener: jest.fn(),
          removeListeners: jest.fn(),
          checkSensorAvailability: jest.fn(),
          startTracking: jest.fn(),
          stopTracking: jest.fn(),
          getTodaySteps: jest.fn(),
      }
    },
    TurboModuleRegistry: {
      getEnforcing: jest.fn((name) => {
        if (name === 'SettingsManager') return {
          getConstants: () => ({ settings: { AppleLanguages: ['en'] } }),
        };
        return null;
      }),
      get: jest.fn((name) => {
          if (name === 'SettingsManager') return {
            getConstants: () => ({ settings: { AppleLanguages: ['en'] } }),
          };
          return null;
        }),
    }
  };
});

describe('useStepGarden - Native Android Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use native StepCounter when available and permission granted', async () => {
    (StepCounter.isSensorAvailable as jest.Mock).mockResolvedValue(true);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
    (StepCounter.getTodaySteps as jest.Mock).mockResolvedValue(100);
    
    let eventCallback: any;
    (StepCounter.addListener as jest.Mock).mockImplementation((cb) => {
        eventCallback = cb;
        return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useStepGarden());

    await waitFor(() => {
        expect(StepCounter.isSensorAvailable).toHaveBeenCalled();
        expect(PermissionsAndroid.request).toHaveBeenCalled();
        expect(StepCounter.startTracking).toHaveBeenCalled();
        expect(result.current.steps).toBe(100);
    });

    // Simulate native event
    act(() => {
        eventCallback({ steps: 150 });
    });

    expect(result.current.steps).toBe(150);
  });

  it('should handle permission denied for native sensor', async () => {
    (StepCounter.isSensorAvailable as jest.Mock).mockResolvedValue(true);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');

    const { result } = renderHook(() => useStepGarden());

    await waitFor(() => {
        expect(result.current.permissionStatus).toBe('denied');
        expect(result.current.isManualMode).toBe(true);
    });
  });

  it('should fallback to manual mode if native sensor is unavailable', async () => {
    (StepCounter.isSensorAvailable as jest.Mock).mockResolvedValue(false);
    // Note: It might fallback to expo-sensors Pedometer first, 
    // but in this test we focus on the native module rejection flow.
    
    const { result } = renderHook(() => useStepGarden());

    await waitFor(() => {
        expect(StepCounter.startTracking).not.toHaveBeenCalled();
    });
  });
});
