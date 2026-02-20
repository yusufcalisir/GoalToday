import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import StepCounter from '../StepCounter';

// Mock NativeModules
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.NativeModules.StepCounterModule = {
    checkSensorAvailability: jest.fn(),
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    getTodaySteps: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  };
  return ReactNative;
});

describe('StepCounter Wrapper', () => {
  const { StepCounterModule } = NativeModules;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
  });

  it('should call checkSensorAvailability on Android', async () => {
    (StepCounterModule.checkSensorAvailability as jest.Mock).mockResolvedValue(true);
    const result = await StepCounter.isSensorAvailable();
    expect(result).toBe(true);
    expect(StepCounterModule.checkSensorAvailability).toHaveBeenCalled();
  });

  it('should return false for isSensorAvailable on iOS', async () => {
    Platform.OS = 'ios';
    const result = await StepCounter.isSensorAvailable();
    expect(result).toBe(false);
    expect(StepCounterModule.checkSensorAvailability).not.toHaveBeenCalled();
  });

  it('should call startTracking', async () => {
    (StepCounterModule.startTracking as jest.Mock).mockResolvedValue(true);
    const result = await StepCounter.startTracking();
    expect(result).toBe(true);
    expect(StepCounterModule.startTracking).toHaveBeenCalled();
  });

  it('should call getTodaySteps', async () => {
    (StepCounterModule.getTodaySteps as jest.Mock).mockResolvedValue(1234);
    const result = await StepCounter.getTodaySteps();
    expect(result).toBe(1234);
    expect(StepCounterModule.getTodaySteps).toHaveBeenCalled();
  });

  it('should add a listener correctly', () => {
    const callback = jest.fn();
    const subscription = StepCounter.addListener(callback);
    expect(subscription).toBeDefined();
    // NativeEventEmitter is used internally, we trust RN for its correct functioning 
    // but we can check if it returns a subscription object.
  });
});
