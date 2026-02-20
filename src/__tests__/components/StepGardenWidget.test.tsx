import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { StepGardenWidget } from '../../components/StepGardenWidget';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../../context/HabitContext', () => ({
  useHabits: () => ({
    colors: {
      card: 'white',
      text: 'black',
      subText: 'gray',
      primary: 'green',
      border: 'ccc',
    },
  }),
}));

jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(),
    getStepCountAsync: jest.fn(),
    watchStepCount: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('lucide-react-native', () => ({
  Leaf: 'Leaf',
  Footprints: 'Footprints',
  Sprout: 'Sprout',
  Flower: 'Flower',
  Trees: 'Trees',
  Edit2: 'Edit2',
  RotateCw: 'RotateCw',
  Save: 'Save',
}));

describe('StepGardenWidget', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with initial state (checking)', async () => {
        // Pedometer.isAvailableAsync returns promise, so it starts with 'checking' and returns null
        // We need to resolve it to test the rendered output
        (Pedometer.isAvailableAsync as jest.Mock).mockResolvedValue(true);
        (Pedometer.getStepCountAsync as jest.Mock).mockResolvedValue({ steps: 500 });
        (Pedometer.watchStepCount as jest.Mock).mockReturnValue({ remove: jest.fn() });

        const { getByText } = render(<StepGardenWidget />);

        await waitFor(() => {
             expect(getByText('Adım Bahçesi')).toBeTruthy();
             expect(getByText('500 Adım')).toBeTruthy();
             expect(getByText('Tohum')).toBeTruthy(); // < 1000 steps
        });
    });

    it('shows manual mode if pedometer unavailable', async () => {
        (Pedometer.isAvailableAsync as jest.Mock).mockResolvedValue(false);
        const { getByText } = render(<StepGardenWidget />);

        await waitFor(() => {
            expect(getByText('Manuel')).toBeTruthy();
        });
    });

    it('updates stage based on steps', async () => {
         (Pedometer.isAvailableAsync as jest.Mock).mockResolvedValue(true);
         // Simulate 1500 steps -> Filiz stage
         (Pedometer.getStepCountAsync as jest.Mock).mockResolvedValue({ steps: 1500 });
         (Pedometer.watchStepCount as jest.Mock).mockReturnValue({ remove: jest.fn() });

         const { getByText } = render(<StepGardenWidget />);

         await waitFor(() => {
             expect(getByText('Filiz')).toBeTruthy();
         });
    });
});
