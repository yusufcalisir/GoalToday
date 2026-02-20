import { analyzeHabits, Insight } from '../../utils/analysis';
import { Habit } from '../../types/habit';
import { Exam } from '../../types/exam';

describe('SmartAnalysisService', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const mockHabit: Habit = {
        id: '1',
        title: 'Morning Jog',
        category: 'health',
        streak: 5,
        completedDates: [],
        color: 'red',
        icon: 'Run',
        logs: [], // Populated in specific tests
        frequency: 'daily',
        createdAt: '2023-01-01'
    };

    const mockExam: Exam = {
        id: 'exam1',
        title: 'Math Exam',
        date: '2023-01-10', // Fixed date
        category: 'HighSchool',
        color: 'blue'
    };

    it('should generate exam countdown insight (3 days left)', () => {
        // Set today to 2023-01-07 (3 days before exam)
        jest.setSystemTime(new Date('2023-01-07T10:00:00'));
        
        const insights = analyzeHabits([], [mockExam]);
        
        expect(insights).toHaveLength(1);
        expect(insights[0].type).toBe('exam');
        expect(insights[0].message).toContain('3 gün kaldı');
    });

    it('should generate exam countdown insight (1 week left)', () => {
        // Set today to 2023-01-03 (7 days before exam)
        jest.setSystemTime(new Date('2023-01-03T10:00:00'));
        
        const insights = analyzeHabits([], [mockExam]);
        
        expect(insights).toHaveLength(1);
        expect(insights[0].message).toContain('1 hafta var');
    });

    it('should suggest habit based on time pattern', () => {
        // Mock a habit usually done at 9 AM
        const morningLog = '2023-01-01T09:00:00';
        const patternHabit = {
            ...mockHabit,
            logs: Array(6).fill(morningLog) // 6 logs to trigger analysis
        };

        // Set current time to morning (10 AM)
        jest.setSystemTime(new Date('2023-01-08T10:00:00'));

        const insights = analyzeHabits([patternHabit], []);

        const patternInsight = insights.find(i => i.type === 'pattern');
        expect(patternInsight).toBeDefined();
        expect(patternInsight?.message).toContain('Genelde bu saatlerde');
        expect(patternInsight?.message).toContain(mockHabit.title);
    });

    it('should suggest missed morning habit in the evening', () => {
        // Mock a habit usually done at 9 AM
        const morningLog = '2023-01-01T09:00:00';
        const patternHabit = {
            ...mockHabit,
            logs: Array(6).fill(morningLog)
        };

        // Set current time to evening (20 PM)
        jest.setSystemTime(new Date('2023-01-08T20:00:00'));

        const insights = analyzeHabits([patternHabit], []);

        const missedInsight = insights.find(i => i.type === 'suggestion');
        expect(missedInsight).toBeDefined();
        expect(missedInsight?.message).toContain('Sabah');
        expect(missedInsight?.message).toContain('kaçırdın');
    });

    it('should warn about risky streak', () => {
        // Habit with good streak but not done today
        const riskyHabit = {
            ...mockHabit,
            streak: 5,
            completedDates: ['2023-01-07'] // Yesterday
        };

        // Set today to 2023-01-08
        jest.setSystemTime(new Date('2023-01-08T20:00:00'));

        const insights = analyzeHabits([riskyHabit], []);
        
        const streakInsight = insights.find(i => i.type === 'motivation');
        expect(streakInsight).toBeDefined();
        expect(streakInsight?.message).toContain('tehlikede');
    });

    it('should provide general motivation if no specific insights', () => {
         // No habits, no exams
         jest.setSystemTime(new Date('2023-01-01T10:00:00'));
         const insights = analyzeHabits([], []);

         expect(insights).toHaveLength(1);
         expect(insights[0].type).toBe('motivation');
         // One of the random messages
         expect(insights[0].priority).toBe(1);
    });
});
