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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <NutritionPage />},
      { path: "caloriesPage", element: <CaloriesPage />},
      { path: "weightPage", element: <WeightPage />},
      { path: "trainingPage", element: <TrainingPage /> },
      { path: "loginPage", element: <LoginPage /> },
      { path: "registerPage", element: <RegisterPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
