import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getNavItems = () => {
  switch (profile?.role) {
    case 'organizer': return [
      { icon: '🏠', label: 'Home', path: '/organizer/dashboard' },
      { icon: '📅', label: 'Events', path: '/organizer/events' },
      { icon: '👔', label: 'Agencies', path: '/organizer/hire-agency' },
      { icon: '👥', label: 'Attendees', path: '/organizer/attendees' },
      { icon: '👤', label: 'Profile', path: '/profile' },
    ]
    case 'agency': return [
      { icon: '🏠', label: 'Home', path: '/agency/dashboard' },
      { icon: '📋', label: 'Bookings', path: '/agency/bookings' },
      { icon: '🤝', label: 'CRM', path: '/agency/crm' },
      { icon: '🔥', label: 'Rewards', path: '/agency/streaks' },
      { icon: '👤', label: 'Profile', path: '/profile' },
    ]
    case 'attendee': return [
      { icon: '🏠', label: 'Home', path: '/attendee/dashboard' },
      { icon: '🔍', label: 'Explore', path: '/attendee/events' },
      { icon: '🎟️', label: 'Tickets', path: '/attendee/tickets' },
      { icon: '🏅', label: 'Badges', path: '/attendee/badges' },
      { icon: '👤', label: 'Profile', path: '/profile' },
    ]
    case 'admin': return [
      { icon: '🏠', label: 'Home', path: '/admin/dashboard' },
      { icon: '👥', label: 'Users', path: '/admin/users' },
      { icon: '👤', label: 'Profile', path: '/profile' },
    ]
    default: return []
  }
}

  const navItems = getNavItems()

  const handleNav = (item) => {
  navigate(item.path)
}

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = item.path && location.pathname === item.path
        return (
          <button
            key={item.label}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNav(item)}
          >
            <div style={{
              fontSize: 22,
              padding: isActive ? '4px 12px' : '4px',
              borderRadius: 10,
              backgroundColor: isActive ? 'rgba(108,63,245,0.12)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {item.icon}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: isActive ? '#6C3FF5' : '#9CA3AF'
            }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default Navbar