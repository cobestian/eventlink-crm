import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService'
import { formatDistanceToNow } from 'date-fns'

const NotificationBell = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(user.id)
      setNotifications(data || [])
    } catch (err) { console.error(err) }
  }, [user])

  useEffect(() => {
    if (user) loadNotifications()
  }, [user, loadNotifications])

  const unreadCount = notifications.filter(n => !n.read).length
  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  const handleOpen = () => setOpen(!open)

  const handleSelect = async (n) => {
    setSelected(n)
    if (!n.read) {
      await markAsRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'announcement': return { bg: '#EDE9FE', color: '#6C3FF5', icon: '📢' }
      case 'booking_request': return { bg: '#FEF3C7', color: '#D97706', icon: '📋' }
      case 'booking_update': return { bg: '#D1FAE5', color: '#065F46', icon: '✅' }
      case 'badge_earned': return { bg: '#FEE2E2', color: '#991B1B', icon: '🏅' }
      case 'reminder': return { bg: '#DBEAFE', color: '#1E40AF', icon: '⏰' }
      case 'followup_reminder': return { bg: '#FFF7ED', color: '#92400E', icon: '🤝' }
      default: return { bg: '#F3F4F6', color: '#6B7280', icon: '🔔' }
    }
  }

  return (
    <>
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

      {/* Full screen notification panel */}
      {open && !selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '24px 24px 0 0',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            maxWidth: 480, width: '100%', margin: '0 auto'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8EAFF' }}>
              <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  Notifications {unreadCount > 0 && (
                    <span style={{
                      marginLeft: 8, background: '#FF6B6B', color: 'white',
                      borderRadius: 20, padding: '2px 8px', fontSize: 12
                    }}>{unreadCount}</span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={{
                    background: 'none', border: 'none', color: '#6C3FF5',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}>Mark all read</button>
                )}
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {unread.length > 0 && (
                <div>
                  <p style={{
                    padding: '10px 20px 6px', fontSize: 11,
                    fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1
                  }}>Unread</p>
                  {unread.map(n => {
                    const style = getTypeColor(n.type)
                    return (
                      <div key={n.id} onClick={() => handleSelect(n)} style={{
                        padding: '14px 20px', borderBottom: '1px solid #F0F2FF',
                        backgroundColor: '#F8F9FF', cursor: 'pointer',
                        display: 'flex', gap: 12, alignItems: 'flex-start'
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          backgroundColor: style.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20
                        }}>{style.icon}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', marginBottom: 3 }}>
                            {n.title}
                          </p>
                          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.4 }}>
                            {n.body?.substring(0, 60)}{n.body?.length > 60 ? '...' : ''}
                          </p>
                          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <span style={{ color: '#6C3FF5', fontSize: 18 }}>›</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {read.length > 0 && (
                <div>
                  <p style={{
                    padding: '10px 20px 6px', fontSize: 11,
                    fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1
                  }}>Read</p>
                  {read.map(n => {
                    const style = getTypeColor(n.type)
                    return (
                      <div key={n.id} onClick={() => handleSelect(n)} style={{
                        padding: '14px 20px', borderBottom: '1px solid #F0F2FF',
                        backgroundColor: 'white', cursor: 'pointer',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        opacity: 0.7
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          backgroundColor: style.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20
                        }}>{style.icon}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: 14, color: '#6B7280', marginBottom: 3 }}>
                            {n.title}
                          </p>
                          <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.4 }}>
                            {n.body?.substring(0, 60)}{n.body?.length > 60 ? '...' : ''}
                          </p>
                          <p style={{ fontSize: 11, color: '#C4B5FD', marginTop: 4 }}>
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <span style={{ color: '#9CA3AF', fontSize: 18 }}>›</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {notifications.length === 0 && (
                <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 12 }}>🔔</p>
                  <p style={{ fontWeight: 700, fontSize: 16, color: '#1A1A2E', marginBottom: 6 }}>
                    No notifications yet
                  </p>
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                    You'll see updates and announcements here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full screen single notification view */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'white', maxWidth: 480,
          margin: '0 auto', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #6C3FF5, #9B59B6)',
            padding: '48px 20px 28px'
          }}>
            <button onClick={() => setSelected(null)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: 'white', borderRadius: 10, padding: '8px 14px',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20
            }}>← Back</button>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 12
            }}>
              {getTypeColor(selected.type).icon}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
              {selected.title}
            </h2>
          </div>

          <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
            <div style={{
              background: '#F8F9FF', borderRadius: 16, padding: '20px',
              border: '1px solid #E8EAFF', marginBottom: 20
            }}>
              <p style={{ fontSize: 15, color: '#1A1A2E', lineHeight: 1.7 }}>
                {selected.body}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 20,
                backgroundColor: getTypeColor(selected.type).bg,
                color: getTypeColor(selected.type).color,
                fontSize: 12, fontWeight: 700, textTransform: 'capitalize'
              }}>{selected.type?.replace(/_/g, ' ')}</span>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NotificationBell