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

  const handleSelect = async (n) => {
    setSelected(n)
    setOpen(false)
    if (!n.read) {
      await markAsRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getTypeStyle = (type) => {
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

  const NotificationItem = ({ n, dimmed }) => {
    const style = getTypeStyle(n.type)
    return (
      <div onClick={() => handleSelect(n)} style={{
        padding: '14px 20px',
        borderBottom: '1px solid #F0F2FF',
        backgroundColor: dimmed ? '#ffffff' : '#F8F9FF',
        cursor: 'pointer',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        opacity: dimmed ? 0.65 : 1
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          backgroundColor: style.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
        }}>{style.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', marginBottom: 3 }}>
            {n.title}
          </p>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.4 }}>
            {n.body?.substring(0, 55)}{n.body?.length > 55 ? '...' : ''}
          </p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
          </p>
        </div>
        <span style={{ color: '#9CA3AF', fontSize: 18, flexShrink: 0 }}>›</span>
      </div>
    )
  }

  return (
    <>
      {/* Bell button */}
      <button onClick={() => { setOpen(true); setSelected(null) }} style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 12, width: 42, height: 42,
        display: 'flex', alignItems: 'center',
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

      {/* Full screen overlay for notification list */}
      {open && !selected && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
        }}>
          {/* Dark backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              zIndex: 0
            }}
          />
          {/* Panel */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 480,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #6C3FF5, #9B59B6)',
              padding: '48px 20px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
                  Notifications
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none',
                    color: 'white', fontSize: 12, fontWeight: 700,
                    padding: '8px 14px', borderRadius: 10, cursor: 'pointer'
                  }}>Mark all read</button>
                )}
                <button onClick={() => setOpen(false)} style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: 'white', borderRadius: 10, padding: '8px 14px',
                  cursor: 'pointer', fontSize: 18, fontWeight: 700
                }}>✕</button>
              </div>
            </div>

            {/* Notification list */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ffffff' }}>
              {unread.length > 0 && (
                <>
                  <p style={{
                    padding: '12px 20px 6px', fontSize: 11,
                    fontWeight: 700, color: '#9CA3AF',
                    textTransform: 'uppercase', letterSpacing: 1,
                    backgroundColor: '#F8F9FF'
                  }}>🔴 Unread ({unread.length})</p>
                  {unread.map(n => <NotificationItem key={n.id} n={n} dimmed={false} />)}
                </>
              )}

              {read.length > 0 && (
                <>
                  <p style={{
                    padding: '12px 20px 6px', fontSize: 11,
                    fontWeight: 700, color: '#9CA3AF',
                    textTransform: 'uppercase', letterSpacing: 1,
                    backgroundColor: '#F8F9FF'
                  }}>✅ Read ({read.length})</p>
                  {read.map(n => <NotificationItem key={n.id} n={n} dimmed={true} />)}
                </>
              )}

              {notifications.length === 0 && (
                <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                  <p style={{ fontSize: 56, marginBottom: 16 }}>🔔</p>
                  <p style={{ fontWeight: 700, fontSize: 18, color: '#1A1A2E', marginBottom: 8 }}>
                    No notifications yet
                  </p>
                  <p style={{ fontSize: 14, color: '#9CA3AF' }}>
                    Event updates and announcements will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Single notification full screen view */}
      {selected && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #6C3FF5, #9B59B6)',
              padding: '48px 20px 32px',
              flexShrink: 0
            }}>
              <button onClick={() => { setSelected(null); setOpen(true) }} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: 'white', borderRadius: 10, padding: '8px 14px',
                cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20
              }}>← Back</button>

              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 28, marginBottom: 14
              }}>
                {getTypeStyle(selected.type).icon}
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
                {selected.title}
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
                {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
              </p>
            </div>

            <div style={{ flex: 1, padding: '28px 20px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
              <div style={{
                background: '#F8F9FF', borderRadius: 16, padding: '20px 18px',
                border: '1px solid #E8EAFF', marginBottom: 20
              }}>
                <p style={{ fontSize: 16, color: '#1A1A2E', lineHeight: 1.8 }}>
                  {selected.body}
                </p>
              </div>

              <span style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: 20,
                backgroundColor: getTypeStyle(selected.type).bg,
                color: getTypeStyle(selected.type).color,
                fontSize: 12, fontWeight: 700, textTransform: 'capitalize'
              }}>
                {selected.type?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NotificationBell