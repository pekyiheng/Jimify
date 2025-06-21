import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import OnboardUser from './pages/OnboardUserPage.jsx';
import CaloriesPage from './pages/CaloriesPage';
import WeightPage from './pages/WeightPage';
import NutritionPage from './pages/NutritionPage';
import TrainingPage from './pages/TrainingPage';
import WorkoutStartPage from './pages/WorkoutStartPage.jsx';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtherLayout from './OtherLayout';
import DoesNotExistPage from './pages/DoesNotExistPage';
import { UserProvider } from './UserContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <NutritionPage />},
      { path: "caloriesPage", element: <CaloriesPage />},
      { path: "weightPage", element: <WeightPage />},
      { path: "trainingPage", element: <TrainingPage /> },
      { path: "workoutStartPage", element: <WorkoutStartPage />}, 
    ],
  }, 
  {
    path: "/",
    element: <OtherLayout />,
    children: [
      { path: "loginPage", element: <LoginPage /> },
      { path: "registerPage", element: <RegisterPage /> },
      { path: "onboardUserPage", element: <OnboardUser />},
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
