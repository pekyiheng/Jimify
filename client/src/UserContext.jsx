import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase_config';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [exp, setExp] = useState(0);
  const [userId, setUserId] = useState(null);
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setExp(0);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, 'Users', userId);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setExp(userData.exp || 0);
        setDailyCaloriesGoal(userData.Daily_Calories || 0);
      } else {
        setExp(0);
      }
    });

    return () => unsubscribeSnapshot();
  }, [userId]);

  return (
    <UserContext.Provider value={{ user, exp, userId, dailyCaloriesGoal }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
