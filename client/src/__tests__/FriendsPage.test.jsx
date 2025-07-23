import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FriendsPage from '../pages/FriendsPage';
import { useUser } from '../UserContext';
import { setDoc, getDocs, getDoc, collection, query } from 'firebase/firestore';

jest.mock("../firebase_config", () => ({
    db: {},
    auth: {},
}));

jest.mock("../UserContext", () => ({
    useUser: jest.fn()
}));

jest.mock("firebase/firestore", () => {
    const actual = jest.requireActual("firebase/firestore");
    return {
        ...actual,
        getDoc: jest.fn(),
        getDocs: jest.fn(),
        doc: jest.fn(() => ({ path: "dummyDoc" })),
        query: jest.fn(() => ({ path: "dummyQuery" })),
        collection: jest.fn(() => ({ path: "dummyCollection" })),
        where: jest.fn(() => ({ path: "dummyWhere" })),
        setDoc: jest.fn(),
        updateDoc: jest.fn(),
        arrayUnion: jest.fn(),
        arrayRemove: jest.fn(),
        onSnapshot: jest.fn(),
    };
});

jest.mock("firebase/auth", () => ({
    onAuthStateChanged: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUserId = "randomUID";

const mockFirestoreFlow = ({ userId, friendId }) => {
    require("firebase/firestore");

    collection.mockImplementation((db, name) => {
        if (name === "FriendRequests") return { path: "FriendRequests" };
        if (name === "Users") return { path: "Users" };
        return { path: "Other" };
    })

    query.mockImplementation((colRef, ...conditions) => {
        return { path: colRef.path, type: colRef.path };
    })

    let callCount = 0;
    getDocs.mockImplementation((...args) => {
        callCount++;
        console.log(`getdocs call ${callCount}`, args);
        switch (callCount) {
            case 1:
            case 2:
                return Promise.resolve({ empty: true, docs: [] });
            case 3:
                return Promise.resolve({
                    empty: false,
                    docs: [{
                        id: "testfriend123",
                        data: () => ({ Username: "testfriend"})
                    }]
                });
            case 4:
                return Promise.resolve({ empty: true, docs: [] });
            default:
                return Promise.resolve({ empty: true, docs: [] });
        }
    });

    getDoc.mockImplementation((docRef) => {
        if (docRef && docRef.path && docRef.path.includes(`Users/${mockUserId}`)) {
            return Promise.resolve({
                exists: () => true,
                data: () => ({
                    Username: "testuser",
                    friends: []
                })
            });
        }
        if (docRef && docRef.path && docRef.path.includes(`Users/${friendId}`)) {
            return Promise.resolve({
                exists: () => true,
                data: () => ({
                    Username: "testfriend"
                })
            }); 
        }
        return Promise.resolve({
            exists: () => false,
            data: () => null
        });
    });

    setDoc.mockResolvedValue({});
}

describe('FriendsPage', () => {
  beforeEach(() => {
    useUser.mockReturnValue({
        user: { uid: mockUserId },
        exp: 100,
        userId: mockUserId,
        dailyCaloriesGoal: 2000,
    });
    window.alert = jest.fn();
    mockFirestoreFlow({ userId: mockUserId, friendId: "testfriend123"});
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders without crashing', async () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <FriendsPage />
        </MemoryRouter>
    );

    expect(await screen.findByText("Friends:")).toBeInTheDocument();
    expect(await screen.findByText("Incoming Requests:")).toBeInTheDocument();
    expect(await screen.findByText("Outgoing Requests:")).toBeInTheDocument();
  });

  test('sends friend request', async () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <FriendsPage />
        </MemoryRouter>
    );

    const input = await screen.findByPlaceholderText("username");
    const button = await screen.findByText("Send Friend Request");

    fireEvent.change(input, { target: { value: "testfriend" }});
    fireEvent.click(button);

    console.log("getdocs calls:", getDocs.mock.calls.length);
    console.log("setdoc calls:", setDoc.mock.calls.length);
    await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
            expect.any(Object),
            {
                fromUserId: mockUserId,
                toUserId: "testfriend123",
                status: "pending"
            }
        );
    });
  });

  test('alert when username not found', async () => {
    getDocs.mockImplementationOnce(() =>
        Promise.resolve({ empty: true, docs: [] })
    );
    
    render(
        <MemoryRouter initialEntries={['/']}>
            <FriendsPage />
        </MemoryRouter>
    );

    const input = await screen.findByPlaceholderText("username");
    const button = await screen.findByText("Send Friend Request");

    fireEvent.change(input, { target: { value: "fakeuser" }});
    fireEvent.click(button);

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("No user found with that username");
        expect(setDoc).not.toHaveBeenCalled();
    });
  });

  test('alert when friend request already sent', async () => {
    getDocs.mockImplementation((queryObj) => {
        console.log("getdocs path:", queryObj.path);
        if (queryObj.path.includes("FriendRequests")) {
            return Promise.resolve({
                empty: false,
                docs: [{ id: "req123", data: () => ({ status: "pending" })}]
            });
        }
        if (queryObj.path.includes("Users")) {
            return Promise.resolve({
                empty: false,
                docs: [{ id: "testfriend123", data: () => ({ Username: "testfriend"})}]
            });
        }
        return Promise.resolve({ empty: true, docs: []});
    });

    render(
        <MemoryRouter initialEntries={['/']}>
            <FriendsPage />
        </MemoryRouter>
    );

    const input = await screen.findByPlaceholderText("username");
    const button = await screen.findByText("Send Friend Request");

    fireEvent.change(input, { target: { value: "testfriend" }});
    fireEvent.click(button);

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Friend request already sent");
        expect(setDoc).not.toHaveBeenCalled();
    });
  });
});