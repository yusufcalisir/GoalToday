import { calculateStreak } from '../streak';

describe('calculateStreak', () => {
  beforeAll(() => {
    // Set a fixed date for consistent tests: 2024-05-20
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-05-20'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns 0 for empty array', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 1 if completed only today', () => {
    const dates = ['2024-05-20'];
    expect(calculateStreak(dates)).toBe(1);
  });

  it('returns 1 if completed only yesterday', () => {
    const dates = ['2024-05-19'];
    expect(calculateStreak(dates)).toBe(1);
  });

  it('returns 2 if completed today and yesterday', () => {
    const dates = ['2024-05-20', '2024-05-19'];
    expect(calculateStreak(dates)).toBe(2);
  });

  it('returns 3 if completed today, yesterday, and the day before', () => {
    const dates = ['2024-05-18', '2024-05-19', '2024-05-20'];
    expect(calculateStreak(dates)).toBe(3);
  });

  it('returns 0 if last completion was more than 1 day ago', () => {
    const dates = ['2024-05-18']; // Today is 5-20, yesterday was 5-19. 5-18 is too old.
    expect(calculateStreak(dates)).toBe(0);
  });

  it('breaks streak on missed day', () => {
    const dates = ['2024-05-20', '2024-05-19', '2024-05-17'];
    expect(calculateStreak(dates)).toBe(2);
  });

  it('handles unsorted dates correctly', () => {
    const dates = ['2024-05-19', '2024-05-20', '2024-05-18'];
    expect(calculateStreak(dates)).toBe(3);
  });
});
