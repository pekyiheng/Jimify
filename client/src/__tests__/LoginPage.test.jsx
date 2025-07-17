import React from 'react';
import { render, screen, fireEvent  } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';


const mockUseUser = jest.fn();

jest.mock('../UserContext', () => ({
  useUser: () => mockUseUser(), 
}));


describe('LoginPage', () => {
  beforeEach(() => {
    mockUseUser.mockClear();
  });

  test('renders without crashing with a user', () => {

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
  );
  const loginElements = screen.getAllByText(/Login/i);
  expect(loginElements.length).toBeGreaterThan(0);
  expect(loginElements[0]).toBeInTheDocument();
  });
});