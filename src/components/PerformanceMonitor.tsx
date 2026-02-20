import React, { Profiler, ProfilerOnRenderCallback } from 'react';

interface PerformanceMonitorProps {
  id: string;
  children: React.ReactNode;
}

/**
 * A wrapper component that uses React.Profiler to measure render performance.
 * Only active in __DEV__ mode.
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ id, children }) => {
  const onRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    if (__DEV__) {
      if (actualDuration > 10) {
        console.warn(
          `[Profiler] [${id}] ${phase} phase - Slow render detected!\n` +
          `Actual: ${actualDuration.toFixed(2)}ms, Base: ${baseDuration.toFixed(2)}ms`
        );
      } else {
        console.log(
          `[Profiler] [${id}] ${phase} phase - ${actualDuration.toFixed(2)}ms`
        );
      }
    }
  };

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};
