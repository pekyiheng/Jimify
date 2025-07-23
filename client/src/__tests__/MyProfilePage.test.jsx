import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyProfilePage from '../pages/MyProfilePage';
import { useUser } from '../UserContext';
import { collection, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
jest.mock('../UserContext', () => ({
    useUser: jest.fn()
}));

jest.mock('../firebase_config', () => ({
    db: {},
    auth: {},
    storage: {},
    getAuth: jest.fn(),
    getAI: jest.fn(),
    getGenerativeModel: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn()
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn()
}));


describe('MyProfilePage', () => {
  beforeEach(() => {
    useUser.mockReturnValue({
        user: { uid: 'mockUserId', email: 'random@example.com'},
        exp: 2000,
        userId: 'mockUserId',
        dailyCaloriesGoal: 2000
    });

    getDoc.mockResolvedValue({
        data: () => ({
            Username: 'tester',
            Activity_Level: 'High',
            Birthdate: { toDate: () => new Date('2000-01-01')},
            Gender: 'Male',
            Goal: 'Maintain',
            Height: 170,
            Profile_Picture: 'https://fakeurl.com/profile.jpg',
            exp: 2000
        })
    });

    getDocs.mockResolvedValue({
        docs: []
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders without crashing', async () => {

    render(
        <MemoryRouter>
            <MyProfilePage />
        </MemoryRouter>
    );
  
    await waitFor(() => {
        expect(getDoc).toHaveBeenCalled();
    });

    expect(await screen.findByText("Male", { exact: false })).toBeInTheDocument();
    expect(await screen.findByText("High", { exact: false })).toBeInTheDocument();
    expect(await screen.findByText("tester", { exact: false })).toBeInTheDocument();
    expect(await screen.findByText("Maintain", { exact: false })).toBeInTheDocument();
    expect(await screen.findByText("01 Jan 2000", { exact: false })).toBeInTheDocument();
    expect(await screen.findByText("170", { exact: false })).toBeInTheDocument();
    });
});