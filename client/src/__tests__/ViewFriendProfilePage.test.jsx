import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FriendsPage from '../pages/FriendsPage';
import { useUser } from '../UserContext';
import { getDoc, getDocs, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

jest.mock('../UserContext', () => ({
    useUser: jest.fn()
}));

jest.mock('firebase/firestore', () => {
    return {
        collection: jest.fn(),
        getDoc: jest.fn((ref) => {
            return Promise.resolve({
                data: () => ({ Username: "mockfriend" })
            });
        }),
        getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
        query: jest.fn(),
        doc: jest.fn(),
        updateDoc: jest.fn(),
        setDoc: jest.fn(),
        arrayUnion: jest.fn(),
        arrayRemove: jest.fn()
    };
});

describe('FriendsPage', () => {
    beforeEach(() => {
        useUser.mockReturnValue({
            userId: 'tester',
            user: { uid: 'tester '}
        });
    });

    test('clicking "View Profile" leads to friend profile page', async () => {
        render(<FriendsPage />);

        await waitFor(() => {
            expect(screen.getByText('Friends:')).toBeInTheDocument();
        })

        render(<FriendsPage />);
        await waitFor(() => {
            const friendCard = screen.queryByText("mockfriend");
            if (friendCard) {
                fireEvent.click(screen.getByText('View Profile'));
                expect(mockNavigate).toHaveBeenCalledWith("/viewFriendProfilePage", {
                    state: { friendUserId: expect.any(string) }
                });
            };
        });
    });
});

