import React from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: '📊' },
  { path: '/members', label: '会员管理', icon: '👥' },
  { path: '/courses', label: '课程排期', icon: '📅' },
  { path: '/coaches', label: '教练管理', icon: '🏋️' }
]

const titleMap = {
  '/dashboard': '数据看板',
  '/members': '会员管理',
  '/courses': '课程排期',
  '/coaches': '教练管理'
}

export default function Layout({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('gym_user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('gym_token')
    localStorage.removeItem('gym_user')
    onLogout()
    navigate('/login')
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">G</div>
          <div className="sidebar-logo-text">Fit<span>Pro</span></div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.username?.[0]?.toUpperCase() || 'A'}</div>
            <div className="user-details">
              <div className="user-name">{user.username || '管理员'}</div>
              <div className="user-role">{user.role === 'admin' ? '系统管理员' : '员工'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 退出登录
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="header">
          <h1 className="header-title">{titleMap[location.pathname] || '健身房管理系统'}</h1>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
