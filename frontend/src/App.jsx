import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateTrip from './pages/CreateTrip'
import TripDetail from './pages/TripDetail'
import FillForm from './pages/FillForm'
import VotePage from './pages/VotePage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/trips/create" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
      <Route path="/trips/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
      <Route path="/trips/:id/form" element={<PrivateRoute><FillForm /></PrivateRoute>} />
      <Route path="/trips/:id/vote" element={<PrivateRoute><VotePage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}