import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAllAsRead } from '../../services/notificationService'
import { formatDistanceToNow } from 'date-fns'

const NotificationBell = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (user) loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    try {
      const data = await getNotifications(user.id)
      setNotifications(data || [])
    } catch (err) { console.error(err) }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleOpen = async () => {
    setOpen(!open)
    if (!open && unreadCount > 0) {
      await markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{
        position: 'relative', background: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12,
        width: 42, height: 42, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', fontSize: 20
      }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            backgroundColor: '#FF6B6B', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480, height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 400,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'white', borderRadius: '24px 24px 0 0',
            maxHeight: '70vh', overflowY: 'auto', padding: '20px 20px 40px'
          }}>
            <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Notifications</h3>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 24 }}>No notifications yet</p>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                padding: '12px 14px', borderRadius: 12, marginBottom: 8,
                backgroundColor: n.read ? '#F8F9FF' : '#EDE9FE',
                border: '1px solid', borderColor: n.read ? '#E8EAFF' : '#C4B5FD'
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>{n.title}</p>
                <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>{n.body}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell