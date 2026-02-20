import { Habit } from '../../types/habit';
import { performance } from '../../utils/performance';

describe('Logic Performance Benchmarks', () => {
  const generateMockHabits = (count: number): Habit[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `habit-${i}`,
      title: `Habit ${i}`,
      timesCompleted: Math.floor(Math.random() * 100),
      isCompleted: false,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: Math.floor(Math.random() * 10),
      category: 'health'
    }));
  };

  test('Sorting 1000 habits should take less than 10ms', () => {
    const habits = generateMockHabits(1000);
    
    const start = Date.now();
    const sorted = habits.sort((a, b) => b.timesCompleted - a.timesCompleted);
    const duration = Date.now() - start;

    console.log(`[Benchmark] Sorting 1000 habits took ${duration}ms`);
    expect(duration).toBeLessThan(10);
  });

  test('Filtering 5000 habits should take less than 20ms', () => {
    const habits = generateMockHabits(5000);
    
    const start = Date.now();
    const filtered = habits.filter(h => h.timesCompleted > 50);
    const duration = Date.now() - start;

    console.log(`[Benchmark] Filtering 5000 habits took ${duration}ms`);
    expect(duration).toBeLessThan(20);
  });
});
