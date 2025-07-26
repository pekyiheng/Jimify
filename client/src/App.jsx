import { useState, useEffect } from 'react'
import './App.css'
import { Outlet, Navigate } from 'react-router-dom'
import { getDoc, setDoc, doc, } from "firebase/firestore";
import NavBar from './components/NavBar'
import Header from './components/Header'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase_config';
import { useUser } from './UserContext'
import ExperienceBar from './components/ExperienceBar'
import OnboardUser from './pages/OnboardUserPage'


function App() {
  const [userId, setUserId] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [toOnboard, setToOnboard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserProfile(currentUser.uid);
      } else {
        console.log("no user")
        setUserId(null);
        setToOnboard(false);
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []); 

  const fetchUserProfile = async (uid) => {
    const userDocRef = doc(db, 'Users', uid);
    
    try {
      const docSnap = await getDoc(userDocRef);
      setUserId(uid);
      setLoadingAuth(false);
      if (docSnap.exists && docSnap.data().Username) {
        console.log("Username: " + docSnap.data().Username)
        setToOnboard(false);
        return;
      } else {
        console.log("navigating to...");
        setToOnboard(true);
        return;
      }
    } catch (err) {
      console.log("error " + docSnap);
      setToOnboard(true);
      return;
    }
  };

  if (loadingAuth) {
    return (
      <div className="app-loading">
        <p>Loading user session...</p>
      </div>
    );
  }
  
  if (userId != null) {
    if (toOnboard) {
      return (
        <div className='app'>
          <Header toOnboard={toOnboard} />
          <OnboardUser setToOnboard={setToOnboard} />
        </div>
        
      )

    } else {
      return (
        <div className='app'>
          <Header toOnboard={toOnboard} />
          <Outlet />
          <NavBar />
          <ExperienceBar />
        </div>
      )
    }

  } else {
    return <Navigate to="/loginPage" />
  }
}

export default App
