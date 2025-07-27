import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const mockUseUser = jest.fn();
const mockLogin = jest.fn();

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    createUserWithEmailAndPassword.mockClear();
    sendEmailVerification.mockClear();
    mockNavigate.mockClear();
  });
  
  test('renders without crashing', () => {

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  
    const registerElements = screen.getAllByText(/register/i);
    expect(registerElements[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('registers and sends email verification', async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'randomuserID', email: 'random@example.com' }
    });
    sendEmailVerification.mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'random@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'supersecret' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'supersecret' }
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'random@example.com',
        'supersecret'
      );
      expect(sendEmailVerification).toHaveBeenCalledWith(
        { uid: 'randomuserID', email: 'random@example.com' }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/loginPage');
    })
  });

  test('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'registered@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password1' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password' }
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    const errorMessage = await screen.findByText(/Passwords do not match/i);
    expect(errorMessage).toBeInTheDocument();  
  })

  test('shows error on registered email', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/email-already-in-use',
      message: 'Email already in use'
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'registered@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password' }
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    const errorMessage = await screen.findByText(/This email is already registered/i);
    expect(errorMessage).toBeInTheDocument();  
  })

  test('shows error on invalid email', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/invalid-email',
      message: 'Invalid email'
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password' }
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    const errorMessage = await screen.findByText(/Please enter a valid email address/i);
    expect(errorMessage).toBeInTheDocument();  
  })

  test('shows error on weak password', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/weak-password',
      message: 'This password is too weak'
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'random@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'weak' }
    });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'weak' }
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    const errorMessage = await screen.findByText(/Password should be at least 6 characters./i);
    expect(errorMessage).toBeInTheDocument();  
   })
});