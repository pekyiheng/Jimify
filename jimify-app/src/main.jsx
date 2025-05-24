import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import CaloriesPage from './CaloriesPage';
import WeightPage from './WeightPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "caloriesPage",
    element: <CaloriesPage />,
  },
  {
    path: "weightPage",
    element: <WeightPage />,
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
