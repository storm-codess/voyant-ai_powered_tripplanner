import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import PageLoader from './components/PageLoader'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateTrip from './pages/CreateTrip'
import TripDetail from './pages/TripDetail'
import FillForm from './pages/FillForm'
import VotePage from './pages/VotePage'
import HomePage from './pages/HomePage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

function NavigationLoader({ children }) {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (loading) return <PageLoader />
  return children
}

export default function App() {
  return (
    <NavigationLoader>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/trips/create" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
        <Route path="/trips/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
        <Route path="/trips/:id/form" element={<PrivateRoute><FillForm /></PrivateRoute>} />
        <Route path="/trips/:id/vote" element={<PrivateRoute><VotePage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </NavigationLoader>
  )
}