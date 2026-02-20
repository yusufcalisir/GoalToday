import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SmartAssistantWidget } from '../../components/SmartAssistantWidget';
import { useHabits } from '../../context/HabitContext';
import { analyzeHabits } from '../../utils/analysis';

// Mock dependencies
jest.mock('../../context/HabitContext', () => ({
  useHabits: jest.fn(),
}));

jest.mock('../../utils/analysis', () => ({
  analyzeHabits: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  AlertCircle: 'AlertCircle',
  Calendar: 'Calendar',
  Clock: 'Clock',
  Moon: 'Moon',
  Flame: 'Flame',
  Sparkles: 'Sparkles',
  X: 'X',
}));

describe('SmartAssistantWidget', () => {
    const mockAppColors = {
        card: 'white',
        text: 'black',
        subText: 'gray',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useHabits as jest.Mock).mockReturnValue({
            habits: [],
            exams: [],
            colors: mockAppColors,
        });
    });

    it('should render nothing if no insights', () => {
        (analyzeHabits as jest.Mock).mockReturnValue([]);
        const { queryByText } = render(<SmartAssistantWidget />);
        expect(queryByText('Asistanın Önerisi')).toBeNull();
    });

    it('should render insight if available', () => {
        const mockInsight = {
            id: '1',
            type: 'motivation',
            message: 'Test Message',
            icon: 'Sparkles',
            color: 'red',
            priority: 1
        };
        (analyzeHabits as jest.Mock).mockReturnValue([mockInsight]);

        const { getByText } = render(<SmartAssistantWidget />);
        
        expect(getByText('Asistanın Önerisi')).toBeTruthy(); // Match source text
        expect(getByText('Test Message')).toBeTruthy();
    });

    it('should hide widget when close button is pressed', () => {
        const mockInsight = {
            id: '1',
            type: 'motivation',
            message: 'Test Message',
            icon: 'Sparkles',
            color: 'red',
            priority: 1
        };
        (analyzeHabits as jest.Mock).mockReturnValue([mockInsight]);

        const { getByText, queryByText, getByTestId } = render(<SmartAssistantWidget />);
        
        expect(getByText('Asistanın Önerisi')).toBeTruthy();

        const closeBtn = getByTestId('close-button');
        fireEvent.press(closeBtn);

        // After press, state update should re-render null
        expect(queryByText('Asistanın Önerisi')).toBeNull();
    });
});

jest.mock('../../utils/analysis', () => ({
  analyzeHabits: jest.fn(),
}));

// Mock Lucide Icons by returning a simple View with testID or just null
// This avoids rendering complex SVG structures
jest.mock('lucide-react-native', () => ({
  AlertCircle: () => 'AlertCircle',
  Calendar: () => 'Calendar',
  Clock: () => 'Clock',
  Moon: () => 'Moon',
  Flame: () => 'Flame',
  Sparkles: () => 'Sparkles',
  X: () => 'X',
}));

describe('SmartAssistantWidget', () => {
    const mockColors = {
        card: 'white',
        text: 'black',
        subText: 'gray',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useHabits as jest.Mock).mockReturnValue({
            habits: [],
            exams: [],
            colors: mockColors,
        });
    });

    it('should render nothing if no insights', () => {
        (analyzeHabits as jest.Mock).mockReturnValue([]);
        const { queryByText } = render(<SmartAssistantWidget />);
        expect(queryByText('Asistanın Önerisi')).toBeNull();
    });

    it('should render insight if available', () => {
        const mockInsight = {
            id: '1',
            type: 'motivation',
            message: 'Test Message',
            icon: 'Sparkles',
            color: 'red',
            priority: 1
        };
        (analyzeHabits as jest.Mock).mockReturnValue([mockInsight]);

        const { getByText } = render(<SmartAssistantWidget />);
        
        expect(getByText('Asistanın Önerisi')).toBeTruthy();
        expect(getByText('Test Message')).toBeTruthy();
    });

    it('should hide widget when close button is pressed', () => {
        const mockInsight = {
            id: '1',
            type: 'motivation',
            message: 'Test Message',
            icon: 'Sparkles',
            color: 'red',
            priority: 1
        };
        (analyzeHabits as jest.Mock).mockReturnValue([mockInsight]);

        const { getByText, queryByText, getByTestId } = render(<SmartAssistantWidget />);
        
        expect(getByText('Asistanın Önerisi')).toBeTruthy();

        const closeBtn = getByTestId('close-button');
        fireEvent.press(closeBtn);

        // After press, it should disappear
        // Note: state updates in tests are usually immediate with RNTL
        expect(queryByText('Asistanın Önerisi')).toBeNull();
    });
});
