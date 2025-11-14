import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LandingPage = () => {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Make Your City Better, Together
          </h1>
          <p className="hero-subtitle">
            Report local issues like potholes, broken streetlights, and garbage problems. 
            Track their resolution in real-time and help improve your community.
          </p>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/map" className="btn btn-primary pulse">
                  <i className="fas fa-map-marked-alt"></i> View Issues Map
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                  <i className="fas fa-tachometer-alt"></i> Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary pulse">
                  <i className="fas fa-user-plus"></i> Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline">
                  <i className="fas fa-sign-in-alt"></i> Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '16px' }}>
            How CivicTrack Works
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--gray)', maxWidth: '600px', margin: '0 auto' }}>
            Simple steps to report and track local issues in your community
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3 className="feature-title">Pin the Location</h3>
            <p className="feature-description">
              Use our interactive map to precisely mark the location of the issue. 
              No address needed - just click on the map!
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">
              <i className="fas fa-camera"></i>
            </div>
            <h3 className="feature-title">Report with Photos</h3>
            <p className="feature-description">
              Upload photos of the issue to provide clear evidence. 
              This helps authorities understand and prioritize the problem.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">
              <i className="fas fa-bell"></i>
            </div>
            <h3 className="feature-title">Real-time Updates</h3>
            <p className="feature-description">
              Get instant notifications when your issue status changes. 
              Track progress from reporting to resolution in real-time.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="feature-title">Community Power</h3>
            <p className="feature-description">
              Vote on important issues, comment with updates, and work together 
              with your neighbors to get things fixed faster.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-description">
              Monitor how quickly issues are being resolved in your area. 
              See statistics and trends for your community.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3 className="feature-title">Mobile Friendly</h3>
            <p className="feature-description">
              Report issues on the go with our mobile-optimized interface. 
              Perfect for when you spot problems while walking or driving.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: '20px',
          padding: '60px 40px',
          marginTop: '80px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '40px', fontWeight: '600' }}>
            Join Thousands of Active Citizens
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '40px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '8px' }}>10K+</div>
              <div style={{ opacity: '0.9' }}>Issues Reported</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '8px' }}>85%</div>
              <div style={{ opacity: '0.9' }}>Resolution Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '8px' }}>50+</div>
              <div style={{ opacity: '0.9' }}>Cities Covered</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '8px' }}>24h</div>
              <div style={{ opacity: '0.9' }}>Avg. Response Time</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '600', marginBottom: '20px', color: 'var(--dark)' }}>
            Ready to Make a Difference?
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--gray)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Join your neighbors in creating a cleaner, safer, and better community. 
            It only takes 2 minutes to report your first issue.
          </p>
          {!user && (
            <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
              <i className="fas fa-rocket"></i> Start Reporting Issues Now
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default LandingPage