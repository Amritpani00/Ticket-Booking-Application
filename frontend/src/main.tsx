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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'logout', element: <Logout /> },
      { path: 'ticket/:id', element: <Ticket /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin', element: <Admin /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
