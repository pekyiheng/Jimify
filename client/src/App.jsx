import { useState, useEffect } from 'react'
import './App.css'
import { Outlet, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Header from './components/Header'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase_config';
import ExperienceBar from './components/ExperienceBar'
//import { useAuth } from './AuthContext'

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []); 

  if (loadingAuth) {
    return (
      <div className="app-loading">
        <p>Loading user session...</p>
      </div>
    );
  }
  
  if (user) {

    return (
      <div className='app'>
        <Header />
        <Outlet />
        <NavBar />
        <ExperienceBar />
      </div>
    )
  } else {
    return <Navigate to="/loginPage" />
  }
}

export default App
