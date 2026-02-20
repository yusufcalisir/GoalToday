import { renderHook, act } from '@testing-library/react-native';
import { useCountdown } from '../../hooks/useCountdown';

describe('useCountdown', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with correct remaining time', () => {
        // Current time: 2023-01-01 12:00:00
        jest.setSystemTime(new Date('2023-01-01T12:00:00'));
        
        // Target time: 2023-01-02 12:00:00 (24 hours later)
        const targetDate = '2023-01-02T12:00:00';
        
        const { result } = renderHook(() => useCountdown(targetDate));

        expect(result.current.days).toBe(1);
        expect(result.current.hours).toBe(0);
        expect(result.current.totalSeconds).toBe(86400); // 24 * 60 * 60
        expect(result.current.isExpired).toBe(false);
    });

    it('should update remaining time after 1 second', () => {
        jest.setSystemTime(new Date('2023-01-01T12:00:00'));
        const targetDate = '2023-01-01T12:00:10'; // 10 seconds later
        
        const { result } = renderHook(() => useCountdown(targetDate));

        expect(result.current.seconds).toBe(10);

        // Advance 1 second
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.seconds).toBe(9);
    });

    it('should handle expiration', () => {
        jest.setSystemTime(new Date('2023-01-01T12:00:00'));
        const targetDate = '2023-01-01T12:00:05'; // 5 seconds later
        
        const { result } = renderHook(() => useCountdown(targetDate));
        
        expect(result.current.isExpired).toBe(false);

        // Advance 6 seconds
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(result.current.isExpired).toBe(true);
        expect(result.current.totalSeconds).toBe(0);
    });
});
