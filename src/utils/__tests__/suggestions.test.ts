import { getSmartSuggestions } from '../suggestions';
import { Habit } from '../../types/habit';

describe('getSmartSuggestions', () => {
  it('returns default suggestions when no habits exist', () => {
    const suggestions = getSmartSuggestions([]);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].title).toContain('Su');
  });

  it('filters out water suggestions if user already has a water habit', () => {
    const existingHabits: Partial<Habit>[] = [
      { id: '1', title: 'Günde 2 litre su iç', frequency: 'daily' }
    ];
    const suggestions = getSmartSuggestions(existingHabits as Habit[]);
    const hasWaterSuggestion = suggestions.some(s => s.id === 's1');
    expect(hasWaterSuggestion).toBe(false);
  });

  it('filters out book suggestions if user already has a reading habit', () => {
    const existingHabits: Partial<Habit>[] = [
      { id: '1', title: 'Kitap oku', frequency: 'daily' }
    ];
    const suggestions = getSmartSuggestions(existingHabits as Habit[]);
    const hasBookSuggestion = suggestions.some(s => s.id === 's2');
    expect(hasBookSuggestion).toBe(false);
  });

  it('handles case-insensitivity correctly', () => {
    const existingHabits: Partial<Habit>[] = [
      { id: '1', title: 'SU İÇMEK', frequency: 'daily' }
    ];
    const suggestions = getSmartSuggestions(existingHabits as Habit[]);
    expect(suggestions.some(s => s.id === 's1')).toBe(false);
  });

  it('returns at most 4 suggestions', () => {
    const suggestions = getSmartSuggestions([]);
    expect(suggestions.length).toBeLessThanOrEqual(4);
  });
});
