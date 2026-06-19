import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api.js'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.login(form)
      localStorage.setItem('gym_token', res.data.token)
      localStorage.setItem('gym_user', JSON.stringify(res.data.user))
      onLogin()
      window.location.replace('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">G</div>
          <h1 className="login-title">Fit<span>Pro</span> 健身房</h1>
          <p className="login-subtitle">会员管理系统</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={form.username}
              onChange={handleChange}
              placeholder="请输入用户名"
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="请输入密码"
            />
          </div>
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.15)',
              borderRadius: 8,
              color: '#EF4444',
              fontSize: 13,
              marginBottom: 16
            }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
        <div className="login-hint">
          默认账号：admin / admin123
        </div>
      </div>
    </div>
  )
}
