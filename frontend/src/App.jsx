import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Members from './pages/Members.jsx'
import Courses from './pages/Courses.jsx'
import Coaches from './pages/Coaches.jsx'
import Layout from './components/Layout.jsx'

function App() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gym_token')
    setIsAuth(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>加载中...</div>
  }

  return (
    <Routes>
      {isAuth ? (
        <>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout onLogout={() => { setIsAuth(false) }} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/coaches" element={<Coaches />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App
