import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase_config';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up an observer on the Auth object to know when the user's authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Set loading to false once we know the auth state
    });

    // Clean up the observer when the component unmounts
    return unsubscribe;
  }, []); // Empty dependency array means this effect runs only once on mount

  // Placeholder for login function using Firebase
  const login = (username, password) => {
    signInWithEmailAndPassword(auth, username, password);
  };

  // Placeholder for logout function using Firebase
  const logout = () => {
    // You would implement your Firebase logout logic here
    // signOut(auth)
    //   .then(...)
    //   .catch(...)
  };

  // Value to be provided by the context
  const value = {
    currentUser,
    isAuthenticated: !!currentUser, // Derived state: true if currentUser is not null
    login,
    logout,
  };

  // Provide the context value to children components
  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only when authentication state is known */}
    </AuthContext.Provider>
  )};