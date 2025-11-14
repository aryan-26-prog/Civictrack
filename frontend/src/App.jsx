// civic-issue-tracker/frontend/src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { IssueProvider } from './contexts/IssueContext'

import Navbar from './components/Navbar'
import AnimatedBackground from './components/AnimatedBackground'

// Main Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import IssueDetail from './pages/IssueDetail'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminVerification from './pages/AdminVerification'
import AdminUsers from './pages/AdminUsers'
import AdminAssign from './pages/AdminAssign'
import AdminMap from './pages/AdminMap'
import AdminNotifications from './pages/AdminNotifications'

// Route Protection
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <IssueProvider>
        <Router>
          <div className="app">
            <AnimatedBackground />
            <Navbar />

            <Routes>

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/issue/:id" element={<IssueDetail />} />

              {/* USER DASHBOARD */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* ADMIN MAIN PAGE */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              {/* ADMIN SUB ROUTES */}
              <Route
                path="/admin/verification"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminVerification />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminUsers />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/assign"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminAssign />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/map"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminMap />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/notifications"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminNotifications />
                  </PrivateRoute>
                }
              />

            </Routes>
          </div>
        </Router>
      </IssueProvider>
    </AuthProvider>
  )
}

export default App
