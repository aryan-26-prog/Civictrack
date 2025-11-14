// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token") || null)

  /* -----------------------------------------------------
     1️⃣ SETUP AXIOS TOKEN WHEN APP STARTS
  ----------------------------------------------------- */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [token])

  /* -----------------------------------------------------
     2️⃣ VERIFY STORED TOKEN
  ----------------------------------------------------- */
  const verifyToken = async () => {
    try {
      const res = await axios.get('/api/auth/verify')
      if (res.data.success) {
        setUser(res.data.user)
      } else {
        logout()
      }
    } catch (err) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  /* -----------------------------------------------------
     3️⃣ LOGIN
  ----------------------------------------------------- */
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password })

      if (!res.data.success) {
        return { success: false, message: res.data.message }
      }

      const { token: newToken, user: loggedUser } = res.data

      // Save token
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      setToken(newToken)
      setUser(loggedUser)

      return { success: true, user: loggedUser }

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials"
      }
    }
  }

  /* -----------------------------------------------------
     4️⃣ REGISTER
  ----------------------------------------------------- */
  const register = async (data) => {
    try {
      const res = await axios.post('/api/auth/register', data)

      if (!res.data.success) {
        return { success: false, message: res.data.message }
      }

      const { token: newToken, user: newUser } = res.data

      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      setToken(newToken)
      setUser(newUser)

      return { success: true, user: newUser }

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  /* -----------------------------------------------------
     5️⃣ LOGOUT
  ----------------------------------------------------- */
  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  /* -----------------------------------------------------
     CONTEXT VALUE
  ----------------------------------------------------- */
  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
