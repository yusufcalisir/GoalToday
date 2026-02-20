import { getMotivationalMessage } from '../motivation';
import { Habit } from '../../types/habit';

describe('getMotivationalMessage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns default message if no habits exist', () => {
    const message = getMotivationalMessage([]);
    expect(message.type).toBe('info');
    expect(message.text).toContain('fırsat');
  });

  it('returns warning if a high-streak habit is lost', () => {
    const habits: Partial<Habit>[] = [
      { 
        id: '1', 
        title: 'Su İç', 
        streak: 0, 
        completedDates: Array(15).fill('2024-01-01'), // High past activity
        category: 'health'
      }
    ];
    const message = getMotivationalMessage(habits as Habit[]);
    expect(message.type).toBe('warning');
    expect(message.text).toContain('serin bozuldu');
  });

  it('returns morning motivation before 11 AM if morning habit is not completed', () => {
    jest.setSystemTime(new Date(2024, 4, 20, 8, 0, 0)); // 8 AM Local
    const habits: Partial<Habit>[] = [
      { 
        id: '1', 
        title: 'Sabah Yürüyüşü', 
        completedDates: [], 
        category: 'health'
      }
    ];
    const message = getMotivationalMessage(habits as Habit[]);
    expect(message.text).toContain('Güne erken başlamak');
  });

  it('returns success message for high streak', () => {
    const habits: Partial<Habit>[] = [
      { 
        id: '1', 
        title: 'Kitap Oku', 
        streak: 5, 
        completedDates: ['2024-05-20'], 
        category: 'learning'
      }
    ];
    const message = getMotivationalMessage(habits as Habit[]);
    expect(message.type).toBe('success');
  });
});
