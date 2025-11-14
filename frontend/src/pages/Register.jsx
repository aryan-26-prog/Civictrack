import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen',  // 🔥 NEW FIELD ADDED
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  /* ------------------------------------------
      HANDLE INPUT CHANGE
  ------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    setError('')
  }

  /* ------------------------------------------
      SUBMIT FORM
  ------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await register(formData)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  /* ------------------------------------------
      UI MARKUP
  ------------------------------------------- */
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '80px 20px 20px'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
            Create an Account
          </h1>
          <p style={{ color: 'var(--gray)' }}>
            Join CivicTrack and start contributing
          </p>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div style={{
            background: 'var(--danger)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* NAME */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Minimum 6 characters"
              required
              minLength="6"
            />
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="10-digit phone number"
              required
              pattern="[0-9]{10}"
            />
          </div>

          {/* ROLE SELECTOR */}
          <div className="form-group">
            <label className="form-label">Register As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
            >
              <option value="citizen">Citizen</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* ADDRESS BLOCK */}
          <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--primary)' }}>
              Address Information (Optional)
            </h3>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="form-input"
                placeholder="Street"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="State"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="form-input"
                placeholder="6-digit pincode"
                pattern="[0-9]{6}"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <div style={{ textAlign: 'center', color: 'var(--gray)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Register
