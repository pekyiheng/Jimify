import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import TrainingPage from '../pages/TrainingPage';
import { useUser } from '../UserContext';
import { getDocs } from 'firebase/firestore';

jest.mock('../UserContext', () => ({
    useUser: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    increment: jest.fn() 
}));

jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn()
}));

describe('TrainingPage', () => {
    beforeEach(() => {
        useUser.mockReturnValue({
            userId: 'tester',
            exp: 2000,
            user: { uid: 'random123' }
        });
    });

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        render(<TrainingPage />);

        const trainingElements = screen.getAllByText(/my workouts/i);
        expect(screen.getByText(/my workouts/i)).toBeInTheDocument();
    })

    test('workout plan form opens on click', async () => {
        render(<TrainingPage />);

        const button = screen.getByText('+ Create New Workout Plan');
        fireEvent.click(button);
        expect(screen.getByText('Confirm Workout Plan')).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        await waitFor(() => {
            expect(screen.queryByText('Confirm Workout Plan')).not.toBeInTheDocument();
        });
    });
})

