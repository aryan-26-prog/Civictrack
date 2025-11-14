import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <i className="fas fa-map-marker-alt"></i> CivicTrack
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/map" className="nav-link">
                <i className="fas fa-map"></i> Map View
              </Link>
              <Link to="/dashboard" className="nav-link">
                <i className="fas fa-tachometer-alt"></i> Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  <i className="fas fa-cog"></i> Admin
                </Link>
              )}
              <span className="nav-link">
                <i className="fas fa-user"></i> {user.name}
              </span>
              <button onClick={handleLogout} className="btn btn-outline" style={{padding: '8px 16px'}}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/Login" className="btn btn-primary" style={{padding: '8px 16px'}}>
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{padding: '8px 16px'}}>
                <i className="fas fa-user-plus"></i> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar