import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useIssues } from '../contexts/IssueContext'
import IssueMap from '../components/IssueMap'
import IssueForm from '../components/IssueForm'

const MapView = () => {
  const { user } = useAuth()
  const { issues, fetchIssues, filters, setFilters } = useIssues()
  const [showReportForm, setShowReportForm] = useState(false)
  const [filteredIssues, setFilteredIssues] = useState([])

  useEffect(() => {
    fetchIssues()
  }, [])

  useEffect(() => {
    let filtered = issues
    
    if (filters.category) {
      filtered = filtered.filter(issue => issue.category === filters.category)
    }
    
    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status)
    }
    
    if (filters.severity) {
      filtered = filtered.filter(issue => issue.severity === filters.severity)
    }

    setFilteredIssues(filtered)
  }, [issues, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? null : value
    }))
  }

  return (
    <div style={{ height: '100vh', paddingTop: '80px', display: 'flex' }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ 
        width: '350px', 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        padding: '20px',
        overflowY: 'auto',
        borderRight: '1px solid rgba(0,0,0,0.1)'
      }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px', color: 'var(--dark)' }}>
            Community Issues Map
          </h2>
          
          {user ? (
            <button 
              onClick={() => setShowReportForm(true)}
              className="btn btn-primary pulse"
              style={{ width: '100%', marginBottom: '16px' }}
            >
              <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
              Report New Issue
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--dark)' }}>
                Sign in to report issues
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--dark)' }}>
            Filters
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* CATEGORY FILTER */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Category
              </label>
              <select 
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              >
                <option value="all">All Categories</option>
                <option value="pothole">Potholes</option>
                <option value="streetlight">Street Lights</option>
                <option value="garbage">Garbage</option>
                <option value="water">Water Issues</option>
                <option value="sewage">Sewage</option>
                <option value="traffic">Traffic</option>
                <option value="parks">Parks</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* STATUS FILTER */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Status
              </label>
              <select 
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under-review">Under Review</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* SEVERITY FILTER */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Severity
              </label>
              <select 
                value={filters.severity || 'all'}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              >
                <option value="all">All Severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

          </div>
        </div>

        {/* ISSUE LIST */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--dark)' }}>
            Issues ({filteredIssues.length})
          </h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredIssues.map(issue => (
              <div 
                key={issue._id}
                style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  background: 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'var(--dark)' }}>
                  {issue.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '8px' }}>
                  {issue.category} • {new Date(issue.createdAt).toLocaleDateString()}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '10px',
                    background: issue.status === 'resolved' ? '#d1fae5' : 
                               issue.status === 'in-progress' ? '#dbeafe' : '#fef3c7',
                    color: issue.status === 'resolved' ? '#059669' : 
                          issue.status === 'in-progress' ? '#2563eb' : '#d97706'
                  }}>
                    {issue.status}
                  </span>

                  <Link 
                    to={`/issue/${issue._id}`}
                    style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    View →
                  </Link>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* RIGHT MAP AREA */}
      <div style={{ flex: 1, position: 'relative' }}>
        <IssueMap issues={filteredIssues} />
      </div>

      {/* REPORT ISSUE MODAL */}
      {showReportForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Report New Issue</h2>
              <button 
                onClick={() => setShowReportForm(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  color: 'var(--gray)'
                }}
              >
                ×
              </button>
            </div>
            <IssueForm onSuccess={() => setShowReportForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MapView
