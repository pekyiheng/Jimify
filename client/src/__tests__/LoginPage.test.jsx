import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, OperationType } from 'firebase/auth';

const mockUseUser = jest.fn();
const mockLogin = jest.fn();

jest.mock('firebase/auth', () => {
  const actualAuth = jest.requireActual('firebase/auth');
  return {
    ...actualAuth,
    signInWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    signInWithPopup: jest.fn(),
    onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({}))
  };
});

import { GoogleAuthProvider } from 'firebase/auth';
GoogleAuthProvider.credentialFromResult = jest.fn(() => ({
  accessToken: 'fake-access-token',
  idToken: 'fake-id-token'
}))
GoogleAuthProvider.credentialFromError = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    signInWithEmailAndPassword.mockClear();
    sendPasswordResetEmail.mockClear();
    mockNavigate.mockClear();
  });

  test('renders without crashing', () => {

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  
    const loginElements = screen.getAllByText(/Login/i);
    expect(loginElements[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  test('logs in successfully with valid credentials', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'randomuserID', email: 'random@example.com', emailVerified: true}
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'random@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'supersecret' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'random@example.com',
        'supersecret'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    })
  })

  test('shows error on unregistered email', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/user-not-found',
      message: 'No user found with this email'
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'unregistered@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    const errorMessage = await screen.findByText(/No user found with this email/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('shows error if email is not verified after registration', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({
      user: {
        uid: 'randomuid',
        email: 'unverified@example.com',
        emailVerified: false
      }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'unverified@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'somepassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    const unverifiedMessage = await screen.findByText("Login failed. Please try again.");
    expect(unverifiedMessage).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  })

  test('shows error on wrong password', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: 'The password is invalid'
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    const errorMessage = await screen.findByText(/Incorrect password/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('sends password reset email', async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'random@example.com' }
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.any(Object),
        'random@example.com'
      );
    });

    const successMessage = await screen.findByText(/Check your email inbox/i);
    expect(successMessage).toBeInTheDocument();
  });

  test('handles Google login', async () => {
    signInWithPopup.mockResolvedValueOnce({
      user: { uid: 'randomuserID', email: 'random@example.com' },
      providerId: 'google.com',
      credential: {
        accessToken: 'fake-access-token',
        idToken: 'fake-id-token'
      },
      operationType: 'signIn'
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: /sign in with google/i })[0]);
    
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  })

});