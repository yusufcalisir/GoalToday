import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HabitProvider } from './src/context/HabitContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initCrashReporting } from './src/utils/crashReporter';
import { SyncQueue } from './src/utils/syncQueue';
import { MigrationService } from './src/utils/migrations';
import { featureFlags } from './src/utils/featureFlags';

// Initialize Global Error Handler
initCrashReporting();
// Initialize Sync Queue (Network Listeners)
SyncQueue.init();

export default function App() {
  useEffect(() => {
    const initArchitecture = async () => {
      await featureFlags.init();
      await MigrationService.migrate();
    };
    initArchitecture();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <HabitProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </HabitProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
