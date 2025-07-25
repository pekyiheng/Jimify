// src/__tests__/CaloriesPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  let originalShowModal;
  let originalClose;

  beforeAll(() => {

    if (window.HTMLDialogElement) {
        originalShowModal = window.HTMLDialogElement.prototype.showModal;
        originalClose = window.HTMLDialogElement.prototype.close;

        window.HTMLDialogElement.prototype.showModal = jest.fn();
        window.HTMLDialogElement.prototype.close = jest.fn();
    } else {
        
        console.warn("HTMLDialogElement not found, falling back to mocking HTMLElement.prototype. This might affect other elements.");
        originalShowModal = window.HTMLElement.prototype.showModal;
        originalClose = window.HTMLElement.prototype.close;

        window.HTMLElement.prototype.showModal = jest.fn();
        window.HTMLElement.prototype.close = jest.fn();
    }
  });

  afterAll(() => {
    if (window.HTMLDialogElement) {
        window.HTMLDialogElement.prototype.showModal = originalShowModal;
        window.HTMLDialogElement.prototype.close = originalClose;
    } else {
        window.HTMLElement.prototype.showModal = originalShowModal;
        window.HTMLElement.prototype.close = originalClose;
    }
  });


  beforeEach(() => {
    jest.clearAllMocks(); 

    useUser.mockReturnValue({ userId: mockUserId });

    getDoc.mockImplementation(async (docRef) => {
        useUser.mockReturnValue({
                user: { uid: 'mockUserId', email: 'random@example.com'},
                exp: 2000,
                userId: 'mockUserId',
                dailyCaloriesGoal: 2000
            });

        const requestedDate = docRef.path.split('/').pop(); 

        if (docRef.path === `Users/${mockUserId}/User_Calories/${formattedDate}`) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

          if (requestedDate === tomorrowFormatted) {
              return {
                  exists: true,
                  id: requestedDate,
                  data: () => ({
                      Meal_Map: {
                          Breakfast: { "Tomorrow's Oats": 250 },
                          Lunch: {}, // Maybe no lunch for tomorrow yet
                          Dinner: {},
                          Snacks: {},
                      },
                      Calories: 0, Protein: 0, Carbs: 0, Fats: 0,
                  }),
              };
          }
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

    expect(screen.getByText(/Calories Tracker/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(window.HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
        expect(window.HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    
    await waitFor(() => {
        expect(screen.getByText(/Mock Cereal/i)).toBeInTheDocument();
        expect(screen.getByText(/200/i)).toBeInTheDocument();
        expect(screen.getByText(/Mock Sandwich/i)).toBeInTheDocument();
        expect(screen.getByText(/400/i)).toBeInTheDocument();
    });
    
  });

  test('Handles change of date', async () => {
    render(<CaloriesPage />);

    await waitFor(() => {
      const dateInputByValue = screen.getByDisplayValue(formattedDate);
      expect(dateInputByValue).toBeInTheDocument();
      expect(screen.getByText('Mock Cereal')).toBeInTheDocument();
    });

    const incButton = screen.getAllByRole('button', { name: />/i })[0];
    await waitFor(() => fireEvent.click(incButton));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

     await waitFor(() => {
       const dateInputByValue = screen.getByDisplayValue(tomorrowFormatted);
       expect(dateInputByValue).toBeInTheDocument();
     });
  });

  // ...existing code...

  test('Handles adding food', async () => {
    // Track if food was added
    let foodAdded = true;

    // Update getDoc mock to return new food if added
    getDoc.mockImplementation(async (docRef) => {
      if (foodAdded) {
        return {
          exists: true,
          id: docRef.id,
          data: () => ({
            Meal_Map: {
              Breakfast: { "Mock Cereal": 200, "Test Add": 2 },
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
      // ...original mock logic...
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
    });

    setDoc.mockImplementation(async () => {
      foodAdded = true;
      return Promise.resolve();
    });

    render(<CaloriesPage />);

    const addFoodButton = screen.getAllByRole('button', { name: /Add Food/i })[0];
    await waitFor(() => fireEvent.click(addFoodButton));

    const customFoodButton = screen.getAllByRole('button', { name: /Custom Food/i })[0];
    await waitFor(() => fireEvent.click(customFoodButton));

    const foodInput = screen.getByLabelText('Food');
    await userEvent.type(foodInput, 'Test Add');

    const calInput = screen.getByLabelText('Cal');
    await userEvent.type(calInput, "2");

    const submitButton = screen.getAllByRole('button', { name: /Add/i })[0];
    await waitFor(() => fireEvent.click(submitButton));

    // Wait for UI to update with new food
    await waitFor(() => {
      expect(screen.getByText('Test Add')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

});