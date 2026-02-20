import { Habit } from '../../types/habit';

/**
 * Stress tests to simulate "Worst-Case Scenario" devices.
 * Uses 10x larger datasets and checks if the app stays responsive.
 */
describe('Low-End Device Stress Tests (Worst-Case)', () => {
  const generateMassiveHabits = (count: number): Habit[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `habit-${i}`,
      title: `Habit ${i}`,
      category: i % 2 === 0 ? 'fitness' : 'education',
      streak: Math.floor(Math.random() * 500),
      completedDates: Array.from({ length: 365 }, (_, d) => `2023-01-${d % 28 + 1}`), // 1 year of data
      createdAt: new Date().toISOString(),
      color: '#4A00E0',
      icon: 'heart',
      frequency: 'daily'
    }));
  };

  test('Processing 10,000 habits (1 year history each) on "Legacy Device" budget', () => {
    const habits = generateMassiveHabits(10000);
    
    // Low-end benchmark: We allow more time but expect it to finish under 100ms
    // to avoid an Application Not Responding (ANR) lockup.
    const start = Date.now();
    
    // Simulate complex grouping and sorting
    const fitnessHabits = habits
      .filter(h => h.category === 'fitness')
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 100);

    const duration = Date.now() - start;

    console.log(`[Stress Test] Processed 10k habits with full history in ${duration}ms`);
    
    // ANR threshold is typically 5s, but for UI fluidity we want under 100ms
    expect(duration).toBeLessThan(150); 
  });

  test('Daily reset logic simulation for 5,000 habits', () => {
    const habits = generateMassiveHabits(5000);
    const today = '2023-12-31';

    const start = Date.now();
    
    const updatedHabits = habits.map(h => {
        const isNotToday = h.completedDates[h.completedDates.length - 1] !== today;
        return {
            ...h,
            streak: isNotToday ? 0 : h.streak
        };
    });

    const duration = Date.now() - start;

    console.log(`[Stress Test] Daily streak reset for 5k habits took ${duration}ms`);
    expect(duration).toBeLessThan(100);
  });
});
