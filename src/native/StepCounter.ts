import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { StepCounterModule } = NativeModules;

export interface StepEvent {
  steps: number;
}

class StepCounter {
  private eventEmitter: NativeEventEmitter | null = null;

  constructor() {
    if (Platform.OS === 'android' && StepCounterModule) {
      this.eventEmitter = new NativeEventEmitter(StepCounterModule);
    }
  }

  async isSensorAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      return await StepCounterModule.checkSensorAvailability();
    } catch (e) {
      return false;
    }
  }

  async startTracking(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    return await StepCounterModule.startTracking();
  }

  async stopTracking(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    return await StepCounterModule.stopTracking();
  }

  async getTodaySteps(): Promise<number> {
    if (Platform.OS !== 'android') return 0;
    return await StepCounterModule.getTodaySteps();
  }

  addListener(callback: (event: StepEvent) => void) {
    if (!this.eventEmitter) return null;
    return this.eventEmitter.addListener('onStepsChanged', callback);
  }
}

export default new StepCounter();
