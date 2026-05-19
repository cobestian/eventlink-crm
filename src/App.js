import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import './styles/global.css'

import ProfilePage from './pages/ProfilePage'

import Welcome from './pages/auth/Welcome'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import CreateEvent from './pages/organizer/CreateEvent'
import ManageEvents from './pages/organizer/ManageEvents'
import HireAgency from './pages/organizer/HireAgency'
import AttendeeList from './pages/organizer/AttendeeList'
import OrganizerMessages from './pages/organizer/OrganizerMessages'

import AgencyDashboard from './pages/agency/AgencyDashboard'
import BookingRequests from './pages/agency/BookingRequests'
import CRMPage from './pages/agency/CRMPage'
import StreaksPage from './pages/agency/StreaksPage'
import AgencyMessages from './pages/agency/AgencyMessages'

import AttendeeDashboard from './pages/attendee/AttendeeDashboard'
import BrowseEvents from './pages/attendee/BrowseEvents'
import MyTickets from './pages/attendee/MyTickets'
import BadgesPage from './pages/attendee/BadgesPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'

import Loader from './components/common/Loader'

const RoleRouter = () => {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/" replace />
  switch (profile?.role) {
    case 'organizer': return <Navigate to="/organizer/dashboard" replace />
    case 'agency': return <Navigate to="/agency/dashboard" replace />
    case 'attendee': return <Navigate to="/attendee/dashboard" replace />
    case 'admin': return <Navigate to="/admin/dashboard" replace />
    default: return <Loader />
  }
}

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && profile?.role !== allowedRole) return <Navigate to="/role-home" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/role-home" element={<RoleRouter />} />

          <Route path="/organizer/dashboard" element={<ProtectedRoute allowedRole="organizer"><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/organizer/create-event" element={<ProtectedRoute allowedRole="organizer"><CreateEvent /></ProtectedRoute>} />
          <Route path="/organizer/events" element={<ProtectedRoute allowedRole="organizer"><ManageEvents /></ProtectedRoute>} />
          <Route path="/organizer/hire-agency" element={<ProtectedRoute allowedRole="organizer"><HireAgency /></ProtectedRoute>} />
          <Route path="/organizer/attendees" element={<ProtectedRoute allowedRole="organizer"><AttendeeList /></ProtectedRoute>} />
          <Route path="/organizer/messages" element={<ProtectedRoute allowedRole="organizer"><OrganizerMessages /></ProtectedRoute>} />

          <Route path="/agency/dashboard" element={<ProtectedRoute allowedRole="agency"><AgencyDashboard /></ProtectedRoute>} />
          <Route path="/agency/bookings" element={<ProtectedRoute allowedRole="agency"><BookingRequests /></ProtectedRoute>} />
          <Route path="/agency/crm" element={<ProtectedRoute allowedRole="agency"><CRMPage /></ProtectedRoute>} />
          <Route path="/agency/streaks" element={<ProtectedRoute allowedRole="agency"><StreaksPage /></ProtectedRoute>} />
          <Route path="/agency/messages" element={<ProtectedRoute allowedRole="agency"><AgencyMessages /></ProtectedRoute>} />

          <Route path="/attendee/dashboard" element={<ProtectedRoute allowedRole="attendee"><AttendeeDashboard /></ProtectedRoute>} />
          <Route path="/attendee/events" element={<ProtectedRoute allowedRole="attendee"><BrowseEvents /></ProtectedRoute>} />
          <Route path="/attendee/tickets" element={<ProtectedRoute allowedRole="attendee"><MyTickets /></ProtectedRoute>} />
          <Route path="/attendee/badges" element={<ProtectedRoute allowedRole="attendee"><BadgesPage /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><ManageUsers /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App