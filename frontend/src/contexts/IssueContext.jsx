import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

const IssueContext = createContext()

export const useIssues = () => {
  const context = useContext(IssueContext)
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider')
  }
  return context
}

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const [socket, setSocket] = useState(null)

  /* ==================================================================
        SOCKET.IO — FIXED, PERFECT, REALTIME
  ================================================================== */
  useEffect(() => {
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    // When new issue is created
    newSocket.on('issue-created', (issue) => {
      setIssues(prev => [issue, ...prev])
    })

    // When status OR proof OR any update happens
    newSocket.on('issue-updated', (updatedIssue) => {
      setIssues(prev =>
        prev.map(i => (i._id === updatedIssue._id ? updatedIssue : i))
      )
    })

    // When admin verifies issue
    newSocket.on('issue-verified', (updatedIssue) => {
      setIssues(prev =>
        prev.map(i => (i._id === updatedIssue._id ? updatedIssue : i))
      )
    })

    // When someone comments
    newSocket.on('issue-comment', (updatedIssue) => {
      setIssues(prev =>
        prev.map(i => (i._id === updatedIssue._id ? updatedIssue : i))
      )
    })

    // When someone votes
    newSocket.on('issue-voted', (updatedIssue) => {
      setIssues(prev =>
        prev.map(i => (i._id === updatedIssue._id ? updatedIssue : i))
      )
    })

    return () => newSocket.close()
  }, [])

  /* ======================================================
       FETCH ISSUES
    ====================================================== */
  const fetchIssues = async (params = {}) => {
    setLoading(true)
    try {
      const res = await axios.get('/api/issues', { params })
      setIssues(res.data.issues)
    } catch (error) {
      console.error('Error fetching issues:', error)
    } finally {
      setLoading(false)
    }
  }

  /* ======================================================
       CREATE ISSUE
    ====================================================== */
  const createIssue = async (issueData) => {
    try {
      const res = await axios.post('/api/issues', issueData)
      return { success: true, data: res.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create issue' 
      }
    }
  }

  /* ======================================================
       UPDATE ISSUE
    ====================================================== */
  const updateIssue = async (id, updateData) => {
    try {
      const res = await axios.put(`/api/issues/${id}`, updateData)
      return { success: true, data: res.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update issue' 
      }
    }
  }

  /* ======================================================
       ADD COMMENT (FIXED)
    ====================================================== */
  const addComment = async (id, comment) => {
    try {
      const res = await axios.post(`/api/issues/${id}/comment`, { text: comment })
      return { success: true, data: res.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add comment' 
      }
    }
  }

  /* ======================================================
       VOTE ISSUE
    ====================================================== */
  const voteIssue = async (id, type) => {
    try {
      const res = await axios.post(`/api/issues/${id}/vote`, { type })
      return { success: true, data: res.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to vote' 
      }
    }
  }

  const value = {
    issues,
    loading,
    filters,
    socket,
    fetchIssues,
    createIssue,
    updateIssue,
    addComment,
    voteIssue,
    setFilters
  }

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  )
}

export default IssueContext
