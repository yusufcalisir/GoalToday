import { Habit } from '../../types/habit';
import { performance } from '../../utils/performance';

describe('Logic Performance Benchmarks', () => {
  const generateMockHabits = (count: number): Habit[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `habit-${i}`,
      title: `Habit ${i}`,
      category: 'health',
      streak: Math.floor(Math.random() * 10),
      completedDates: Array.from({ length: Math.floor(Math.random() * 100) }, () => '2023-01-01'),
      createdAt: new Date().toISOString(),
      color: '#4A00E0',
      icon: 'heart',
      frequency: 'daily'
    }));
  };

  test('Sorting 1000 habits by completion count should take less than 10ms', () => {
    const habits = generateMockHabits(1000);
    
    const start = Date.now();
    const sorted = habits.sort((a, b) => b.completedDates.length - a.completedDates.length);
    const duration = Date.now() - start;

    console.log(`[Benchmark] Sorting 1000 habits took ${duration}ms`);
    expect(duration).toBeLessThan(10);
  });

  test('Filtering 5000 habits by streak should take less than 20ms', () => {
    const habits = generateMockHabits(5000);
    
    const start = Date.now();
    const filtered = habits.filter(h => h.streak > 5);
    const duration = Date.now() - start;

    console.log(`[Benchmark] Filtering 5000 habits took ${duration}ms`);
    expect(duration).toBeLessThan(20);
  });
});
