import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Logout from './pages/Logout'
import Layout from './components/Layout'
import Ticket from './pages/Ticket'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { initReduceMotionFromStorage } from './components/ReduceMotion'
import History from './pages/History'
import Fare from './pages/Fare'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <App /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'history', element: <History /> },
          { path: 'fare', element: <Fare /> },
          { path: 'logout', element: <Logout /> },
          { path: 'ticket/:id', element: <Ticket /> },
          { path: 'profile', element: <Profile /> },
          { path: 'admin', element: <Admin /> },
          { path: 'booking', element: <App /> },
        ],
      },
    ],
  },
])

initReduceMotionFromStorage()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
