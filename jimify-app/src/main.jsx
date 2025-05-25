import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import CaloriesPage from './pages/CaloriesPage';
import WeightPage from './pages/WeightPage';
import { MainNutritionPage, NutritionPage } from './pages/NutritionPage';
import TrainingPage from './pages/TrainingPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <MainNutritionPage />},
      {
        path: "nutritionPage", element: <NutritionPage />, 
        children: [
          { index: true, element: <MainNutritionPage /> },
          { path: "caloriesPage", element: <CaloriesPage />},
          { path: "weightPage", element: <WeightPage />},
        ]
      }, 
      { path: "trainingPage", element: <TrainingPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
