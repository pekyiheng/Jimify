// src/__tests__/CaloriesPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CaloriesPage from '../pages/CaloriesPage';
import { useUser } from '../UserContext';

// Import the mocked Firebase functions (ensure these are correctly pointed to your __mocks__ directory)
import { getDoc, doc, setDoc } from 'firebase/firestore';

// Mock UserContext
jest.mock('../UserContext', () => ({
  useUser: jest.fn(),
}));

// Mock Firebase (this line ensures your __mocks__/firebase/firestore is used)
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('../../__mocks__/firebase/firestore'),
}));

describe('CaloriesPage', () => {
  const mockUserId = 'test-user-id';
  // No need for mockDialogRef or spying on useRef globally anymore.
  // We'll mock the prototype of HTMLDialogElement instead.

  // Store the original implementations to restore them later
  let originalShowModal;
  let originalClose;

  beforeAll(() => {
    // Check if dialog element exists in JSDOM and mock its prototype methods
    // If HTMLDialogElement is not defined in your JSDOM env (unlikely with recent JSDOM),
    // you might have to mock HTMLElement.prototype.
    if (window.HTMLDialogElement) {
        originalShowModal = window.HTMLDialogElement.prototype.showModal;
        originalClose = window.HTMLDialogElement.prototype.close;

        window.HTMLDialogElement.prototype.showModal = jest.fn();
        window.HTMLDialogElement.prototype.close = jest.fn();
    } else {
        // Fallback for older JSDOM or environments where HTMLDialogElement is not a distinct prototype
        // This is less ideal as it mocks ALL elements, but might be necessary.
        console.warn("HTMLDialogElement not found, falling back to mocking HTMLElement.prototype. This might affect other elements.");
        originalShowModal = window.HTMLElement.prototype.showModal;
        originalClose = window.HTMLElement.prototype.close;

        window.HTMLElement.prototype.showModal = jest.fn();
        window.HTMLElement.prototype.close = jest.fn();
    }
  });

  afterAll(() => {
    // Restore the original implementations after all tests are done
    if (window.HTMLDialogElement) {
        window.HTMLDialogElement.prototype.showModal = originalShowModal;
        window.HTMLDialogElement.prototype.close = originalClose;
    } else {
        window.HTMLElement.prototype.showModal = originalShowModal;
        window.HTMLElement.prototype.close = originalClose;
    }
  });


  beforeEach(() => {
    jest.clearAllMocks(); // Clears call counts on the *mocked* showModal/close functions

    useUser.mockReturnValue({ userId: mockUserId });

    // --- IMPORTANT: Configure getDoc to return data for the DailyMacros document ---
    getDoc.mockImplementation(async (docRef) => {
        // Mock specific data for user profile if needed by CaloriesPage
        if (docRef.path === `Users/${mockUserId}`) {
            return {
                exists: true,
                id: docRef.id,
                data: () => ({
                    Username: 'testuser',
                    Daily_Calories: 2000,
                    // ... other user profile data CaloriesPage might display
                }),
            };
        }

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        if (docRef.path === `Users/${mockUserId}/DailyMacros/${formattedDate}`) {
            return {
                exists: true,
                id: docRef.id,
                data: () => ({
                    Meal_Map: {
                        Breakfast: { "Mock Cereal": 200 },
                        Lunch: { "Mock Sandwich": 400 },
                        Dinner: {},
                        Snacks: {},
                    },
                    Calories: 0,
                    Protein: 0,
                    Carbs: 0,
                    Fats: 0,
                }),
            };
        }

        return { exists: false, data: () => undefined, id: docRef.id };
    });

    setDoc.mockImplementation(() => Promise.resolve());
  });


  test('renders without crashing with a user', async () => {
    render(<CaloriesPage />);

    // Assert that the CaloriesPage itself renders correctly
    expect(screen.getByText(/Calories Tracker/i)).toBeInTheDocument();

    // Now, your mocked showModal/close should be called
    await waitFor(() => {
        // Assuming showDialog is initially false, close() should be called on mount
        expect(window.HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
        expect(window.HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    // You might also want to assert that elements populated by AddFood are present
    /*
    await waitFor(() => {
        expect(screen.getByText(/Mock Cereal/i)).toBeInTheDocument();
        expect(screen.getByText(/200/i)).toBeInTheDocument();
        expect(screen.getByText(/Mock Sandwich/i)).toBeInTheDocument();
        expect(screen.getByText(/400/i)).toBeInTheDocument();
    });
    */

    // Example of testing dialog open:
    // If there's a button to open the dialog, e.g., an "Add Food" button
    // const addFoodButton = screen.getByRole('button', { name: /Add Food/i });
    // fireEvent.click(addFoodButton);

    // await waitFor(() => {
    //   expect(window.HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    //   expect(window.HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1); // Still 1 from initial mount
    // });
  });

  // Add more tests for dialog opening/closing behavior, data display, etc.
});