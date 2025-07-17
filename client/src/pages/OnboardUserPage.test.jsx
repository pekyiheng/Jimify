// src/__tests__/OnboardUserPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardUser from '../pages/OnboardUserPage'; // Your component
import { useUser } from "../UserContext";

// Import the MOCKED Firebase Firestore functions directly
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

// Mock UserContext
jest.mock('../UserContext', () => ({
  useUser: jest.fn(),
}));

// Mock the firebase_config.js
jest.mock('../firebase_config', () => ({
  db: {}, // Placeholder
}));

describe('OnboardUserPage', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();

    useUser.mockReturnValue({ userId: mockUserId });

    // Mock implementations for Firestore functions
    collection.mockImplementation((firestore, path, ...segments) => {
      const mockCollectionRef = {
        id: path,
        path: path,
        firestore: firestore,
        doc: jest.fn((docId) => ({
          id: docId,
          path: `${path}/${docId}`,
          set: jest.fn(() => Promise.resolve()),
        })),
        where: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            docs: [],
            empty: true,
            forEach: jest.fn(() => {}),
          })),
        })),
        get: jest.fn(() => Promise.resolve({
          docs: [],
          empty: true,
          forEach: jest.fn(() => {}),
        })),
      };
      return mockCollectionRef;
    });

    doc.mockImplementation((firestore, collectionPath, docId, ...subCollectionPathSegments) => {
      const fullPath = [collectionPath, docId, ...subCollectionPathSegments].join('/');
      return {
        id: docId,
        path: fullPath,
        set: jest.fn(() => Promise.resolve()),
      };
    });

    query.mockImplementation((collectionRef, ...constraints) => {
      const mockQuery = {
        path: collectionRef.path,
        queryConstraints: constraints,
        get: jest.fn(() => Promise.resolve({
          docs: [],
          empty: true,
          forEach: jest.fn(() => {}),
        })),
        where: jest.fn(() => mockQuery),
      };
      return mockQuery;
    });

    getDocs.mockImplementation(async (mockQueryRef) => {
      if (mockQueryRef.path === 'Users' && mockQueryRef.queryConstraints.some(c => c.field === 'Username')) {
        // Default: username does NOT exist
        return Promise.resolve({ empty: true, docs: [], forEach: jest.fn() });
      }
      return Promise.resolve({ empty: true, docs: [], forEach: jest.fn() });
    });

    setDoc.mockImplementation(async (docRef, data, options) => {
      console.log(`Mock setDoc called for path: ${docRef.path}, data:`, data, `options:`, options);
      return Promise.resolve();
    });
  });

  // --- Test 1: Renders and handles username availability ---
  test('renders without crashing and handles username available', async () => {
    render(<OnboardUser />);

    await fireEvent.click(screen.getByText('Next')); // Assuming there's a "Next" button in step 0

    const usernameInput = screen.getByLabelText('Username');

    fireEvent.change(usernameInput, { target: { value: '' } });
    await fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText('Please enter a username')).toBeInTheDocument();
    });


    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.click(screen.getByText('Next')); 
    await waitFor(() => {
      expect(screen.getByLabelText('What is your gender?')).toBeInTheDocument();
    });

    

    /*
    // Example: Test when username already exists
    // Re-mock getDocs for this specific scenario
    getDocs.mockImplementationOnce(async (mockQueryRef) => {
      if (mockQueryRef.path === 'Users' && mockQueryRef.queryConstraints.some(c => c.field === 'Username' && c.value === 'existinguser')) {
        return Promise.resolve({
          empty: false,
          docs: [{ id: 'existingUser123', data: () => ({ Username: 'existinguser' }) }],
          forEach: jest.fn((cb) => cb({ id: 'existingUser123', data: () => ({ Username: 'existinguser' }) })),
        });
      }
      return Promise.resolve({ empty: true, docs: [], forEach: jest.fn() });
    });

    // Go back to the username step and try again with an existing username
    await fireEvent.click(screen.getByText('Back')); // Go back from gender to username step
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });

    // This click will now trigger the check for the 'existinguser'
    await fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
    */
  });

  /*
  // --- Test 2: handleSubmit saves user profile and weight ---
  test('handleSubmit saves user profile and weight', async () => {
    render(<OnboardUser />);

    // Advance through all steps to the final submission step
    // Each `fireEvent.click` (or change) will cause state updates.
    // Ensure you `await` these interactions, especially if they lead to async operations.

    await fireEvent.click(screen.getByText('Next')); // Step 0 -> 1 (username)
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
    await fireEvent.click(screen.getByText('Next')); // Step 1 -> 2 (gender)

    
    fireEvent.change(screen.getByLabelText('What is your gender?'), { target: { value: 'M' } });
    await fireEvent.click(screen.getByText('Next')); // Step 2 -> 3 (birthdate)

    fireEvent.change(screen.getByLabelText('What is your birthdate?'), { target: { value: '2000-01-01' } });
    await fireEvent.click(screen.getByText('Next')); // Step 3 -> 4 (height)

    fireEvent.change(screen.getByLabelText('What is your height?'), { target: { value: '170' } });
    await fireEvent.click(screen.getByText('Next')); // Step 4 -> 5 (current weight)

    fireEvent.change(screen.getByLabelText('What is your current weight?'), { target: { value: '70' } });
    await fireEvent.click(screen.getByText('Next')); // Step 5 -> 6 (goal)

    fireEvent.change(screen.getByLabelText('What is your goal?'), { target: { value: 'maintain' } });
    await fireEvent.click(screen.getByText('Next')); // Step 6 -> 7 (activity level)

    fireEvent.change(screen.getByLabelText('How active are you??'), { target: { value: 'sedentary' } });

    // The 'Submit' button should be present at this step (step 7)
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    // Clicking submit triggers asynchronous Firebase calls (setDoc) and subsequent state updates.
    await fireEvent.click(submitButton);


    await waitFor(() => {
      // Assert that setDoc was called for the user profile
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "Users",
        mockUserId
      );
      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `Users/${mockUserId}` }),
        expect.objectContaining({
          Username: 'newuser',
          Daily_Calories: expect.any(Number),
          Height: 170,
          Birthdate: expect.any(Date),
          Gender: 'M',
          Activity_Level: 'sedentary',
          Goal: 'maintain',
        }),
        { merge: true }
      );

      // Assert that setDoc was called for the user's weight
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "Users",
        mockUserId,
        "User_Weight",
        expect.any(String) // A timestamp string
      );
      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining(`Users/${mockUserId}/User_Weight/`) }),
        expect.objectContaining({
          value: 70,
          time: expect.any(Date),
        })
      );

      // Verify the component advanced to the final step
      expect(screen.getByText("You're all set and ready to start your fitness journey..")).toBeInTheDocument();
    });
    
  });
  */
 
  // Add more tests for validation, different goals, etc.
});