import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useIssues } from '../contexts/IssueContext'

const Dashboard = () => {
  const { user } = useAuth()
  const { issues, fetchIssues, loading } = useIssues()
  const [userIssues, setUserIssues] = useState([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchIssues()
  }, [])

  useEffect(() => {
    if (user) {
      const filteredIssues = issues.filter(issue => 
        issue.reportedBy._id === user.id || issue.reportedBy === user.id
      )
      setUserIssues(filteredIssues)
    }
  }, [issues, user])

  const filteredIssues = userIssues.filter(issue => {
    if (activeTab === 'all') return true
    return issue.status === activeTab
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'status-resolved'
      case 'in-progress': return 'status-in-progress'
      case 'under-review': return 'status-in-progress'
      default: return 'status-pending'
    }
  }

  const getStatusText = (status) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '80px 20px 20px'
      }}>
        <div className="loading" style={{ width: '50px', height: '50px' }}></div>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 20px 40px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
            Track your reported issues and community contributions
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                  50
                </div>
                <div style={{ color: 'var(--gray)' }}>Total Issues</div>
              </div>
              <div style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '8px' 
              }}>
                <i className="fas fa-flag" style={{ fontSize: '1.5rem' }}></i>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                  38
                </div>
                <div style={{ color: 'var(--gray)' }}>Resolved</div>
              </div>
              <div style={{ 
                background: 'var(--success)', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '8px' 
              }}>
                <i className="fas fa-check-circle" style={{ fontSize: '1.5rem' }}></i>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)'}}>
                  5
                </div>
                <div style={{ color: 'var(--gray)' }}>In Progress</div>
              </div>
              <div style={{ 
                background: 'var(--accent)', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '8px' 
              }}>
                <i className="fas fa-tasks" style={{ fontSize: '1.5rem' }}></i>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--danger)' }}>
                  7
                </div>
                <div style={{ color: 'var(--gray)' }}>Pending</div>
              </div>
              <div style={{ 
                background: 'var(--danger)', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '8px' 
              }}>
                <i className="fas fa-clock" style={{ fontSize: '1.5rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '40px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: 'var(--dark)' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/map" className="btn btn-primary">
                <i className="fas fa-map-marked-alt" style={{ marginRight: '8px' }}></i>
                Report New Issue
              </Link>
              <Link to="/map" className="btn btn-outline">
                <i className="fas fa-map" style={{ marginRight: '8px' }}></i>
                View All Issues
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary">
                  <i className="fas fa-cog" style={{ marginRight: '8px' }}></i>
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="card">
          {filteredIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>
              <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}></i>
              <h3 style={{ marginBottom: '8px' }}>No issues found</h3>
              <p>You haven't reported any issues yet, or there are no issues matching the current filter.</p>
              <Link to="/map" className="btn btn-primary" style={{ marginTop: '16px' }}>
                <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                Report Your First Issue
              </Link>
            </div>
          ) : (
            <div>
              {filteredIssues.map(issue => (
                <div key={issue._id} className="issue-card card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: 'var(--dark)' }}>
                        {issue.title}
                      </h3>
                      <p style={{ color: 'var(--gray)', marginBottom: '12px' }}>
                        {issue.description.length > 150 
                          ? `${issue.description.substring(0, 150)}...` 
                          : issue.description
                        }
                      </p>
                    </div>
                    <span className={`status-badge ${getStatusColor(issue.status)}`}>
                      {getStatusText(issue.status)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--gray)', fontSize: '14px' }}>
                      <span>
                        <i className="fas fa-layer-group" style={{ marginRight: '4px' }}></i>
                        {issue.category}
                      </span>
                      <span>
                        <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="fas fa-thumbs-up" style={{ marginRight: '4px' }}></i>
                        {issue.upvotes || 0} votes
                      </span>
                    </div>
                    <Link 
                      to={`/issue/${issue._id}`} 
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard