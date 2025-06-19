import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import CaloriesPage from './pages/CaloriesPage';
import WeightPage from './pages/WeightPage';
import NutritionPage from './pages/NutritionPage';
import TrainingPage from './pages/TrainingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtherLayout from './OtherLayout';
import DoesNotExistPage from './pages/DoesNotExistPage';
import { UserProvider } from './UserContext'
//import { AuthProvider } from './AuthContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <NutritionPage />},
      { path: "caloriesPage", element: <CaloriesPage />},
      { path: "weightPage", element: <WeightPage />},
      { path: "trainingPage", element: <TrainingPage /> },
    ],
  }, 
  {
    path: "/",
    element: <OtherLayout />,
    children: [
      { path: "loginPage", element: <LoginPage /> },
      { path: "registerPage", element: <RegisterPage /> },
      { path: "*", element: <DoesNotExistPage />},
    ]
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>,
)
