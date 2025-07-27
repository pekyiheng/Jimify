import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WeightPage from '../pages/WeightPage';
import { useUser } from '../UserContext';
import { getDocs, getDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { calculateBMR, getActivityLevel } from '../helper';

jest.mock('../UserContext', () => ({
    useUser: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    deleteDoc: jest.fn()
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn()
}));

jest.mock('../helper', () => ({
    calculateBMR: jest.fn(() => 1500),
    getActivityLevel: jest.fn(() => "Active"),
    getGoal: jest.fn(() => "Maintain")
}));

jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="mock-line-chart" />
}));

beforeEach(() => {
    useUser.mockReturnValue({ userId: 'tester'});

    getDocs.mockResolvedValue({ docs: [] });
    getDoc.mockResolvedValue({
        data: () => ({
            Gender: 'Male',
            Height: 170,
            Goal: "Maintain",
            Activity_Level: "Active",
            Birthdate: { toDate: () => new Date('2000-01-01')}
        })
    });
});

test('renders when no weight entries submitted', async () => {
    render(<WeightPage />);
    await waitFor(() => {
        expect(screen.getByText('No Entries Yet')).toBeInTheDocument();
    });
});

test('allows submitting new weight entry', async () => {
    render(<WeightPage />);

    const input = screen.getByPlaceholderText('Enter Weight (KG)');
    fireEvent.change(input, { target: { value: '70' } });

    const submitButton = screen.getByText('Submit Weight Entry');
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
    });
});

test('toggles between all entries and those within past month', async () => {
    render(<WeightPage />);
    const toggleButton = screen.getByText('Show all entries');
    fireEvent.click(toggleButton);
    expect(screen.getByText('Show entries for the past month')).toBeInTheDocument();
});

test('allows deletion of weight entry and updates user field', async () => {
    getDocs.mockImplementation(() => Promise.resolve({
        docs: [
            {
                id: '1',
                data: () => ({
                    value: 70,
                    time: { toDate: () => new Date() }
                })
            },
            {
                id: '2',
                data: () => ({
                    value: 80,
                    time: { toDate: () => new Date() }
                })
            }
        ]
    }));

    render(<WeightPage />);
    const deleteButton = await screen.findAllByText('Delete');
    fireEvent.click(deleteButton[0]);


    await waitFor(() => {
        expect(deleteDoc).toHaveBeenCalled();
        expect(setDoc).toHaveBeenCalled();
    })
});

test('allows for image upload', async () => {
    uploadBytes.mockResolvedValueOnce();
    getDownloadURL.mockResolvedValueOnce('https://mock-image-url.com/image.jpg');

    render(<WeightPage />);
    fireEvent.change(screen.getByPlaceholderText('Enter Weight (KG)'), {
        target: { value: 70 }
    });

    const file = new File(['image'], 'image.jpg', { type: 'image/jpg' });
    fireEvent.change(screen.getByLabelText(/upload image/i), {
        target: { files: [file] }
    });

    fireEvent.click(screen.getByText('Submit Weight Entry'));

    await waitFor(() => {
        expect(uploadBytes).toHaveBeenCalled();
        expect(getDownloadURL).toHaveBeenCalled();
    });
});