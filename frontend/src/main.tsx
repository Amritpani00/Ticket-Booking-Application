import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dashboard', element: <Dashboard /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
