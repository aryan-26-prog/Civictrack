import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  /* ---------------------------------------
        INPUT HANDLER
  ---------------------------------------- */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  /* ---------------------------------------
        LOGIN SUBMIT FUNCTION
  ---------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)

    if (result.success) {
      // Admin? → Admin Dashboard
      if (result.user.role === "admin") {
        return navigate('/admin')
      }
      // Citizen → User Dashboard
      return navigate('/dashboard')
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  /* ---------------------------------------
        UI SECTION
  ---------------------------------------- */
  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '80px 20px'
      }}
    >
      <div 
        className="card"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '18px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '700', color: 'var(--primary)' }}>
            Welcome Back 👋
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--gray)' }}>
            Login to continue managing your city responsibly
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              background: 'var(--danger)',
              padding: '12px',
              borderRadius: '8px',
              color: 'white',
              textAlign: 'center',
              marginBottom: '20px',
              animation: 'shake 0.2s ease-in-out',
            }}
          >
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '10px',
              marginBottom: '18px',
            }}
          >
            {loading ? (
              <>
                <div className="loading" style={{ marginRight: 8 }}></div>
                Signing In...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" style={{ marginRight: 8 }}></i>
                Login
              </>
            )}
          </button>
        </form>

        {/* REGISTER LINK */}
        <div style={{ textAlign: 'center', marginTop: '5px', color: 'var(--gray)' }}>
          New here?{' '}
          <Link 
            to="/register" 
            style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </div>

        {/* DEMO CREDENTIALS BOX */}
        <div
          style={{
            marginTop: '28px',
            padding: '16px',
            background: 'rgba(37, 99, 235, 0.08)',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '14px'
          }}
        >
          <p style={{ margin: 0, color: 'var(--gray)' }}>
            <i className="fas fa-info-circle" style={{ marginRight: 8 }}></i>
            <b>Demo Admin:</b> admin@civictrack.com — password
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
