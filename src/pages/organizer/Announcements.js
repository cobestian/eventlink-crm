import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getOrganizerEvents, getEventAttendees } from '../../services/eventService'
import { supabase } from '../../config/supabase'
import toast from 'react-hot-toast'

const TEMPLATES = [
  { icon: '📍', label: 'Venue Change', text: 'Important: The venue for this event has changed. Please check the updated location.' },
  { icon: '⏰', label: 'Time Change', text: 'Important: The event time has been updated. Please check the new schedule.' },
  { icon: '🎉', label: 'Event Reminder', text: 'Reminder: Your event is coming up soon! We look forward to seeing you there.' },
  { icon: '🚗', label: 'Parking Info', text: 'Parking is available at the venue. Please arrive early to secure a spot.' },
  { icon: '👔', label: 'Dress Code', text: 'Please note the dress code for this event is smart casual/formal.' },
  { icon: '❌', label: 'Cancellation', text: 'We regret to inform you that this event has been cancelled. We apologize for any inconvenience.' },
]

const Announcements = () => {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [attendees, setAttendees] = useState([])
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [history, setHistory] = useState([])

  const loadEvents = useCallback(async () => {
    try {
      const data = await getOrganizerEvents(profile.id)
      setEvents(data || [])
    } catch (err) {
      console.error(err)
    }
  }, [profile])

  useEffect(() => {
    if (profile) loadEvents()
  }, [profile, loadEvents])

  useEffect(() => {
    if (selectedEvent) {
      getEventAttendees(selectedEvent).then(data => setAttendees(data || []))
      loadAnnouncementHistory(selectedEvent)
    }
  }, [selectedEvent])

  const loadAnnouncementHistory = async (eventId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'announcement')
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory(data || [])
  }

  const sendAnnouncement = async () => {
  if (!selectedEvent) { toast.error('Please select an event'); return }
  if (!title.trim()) { toast.error('Please enter a title'); return }
  if (!message.trim()) { toast.error('Please enter a message'); return }
  if (attendees.length === 0) { toast.error('No attendees for this event yet'); return }

  setSending(true)
  try {
    // Send in-app notifications
    const notifications = attendees.map(a => ({
      user_id: a.attendee_id,
      title: `📢 ${title}`,
      body: message,
      type: 'announcement',
    }))
    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) throw error

    // Get attendee emails and log for email sending
    const attendeeIds = attendees.map(a => a.attendee_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email, full_name')
      .in('id', attendeeIds)

    // Log emails to be sent
    const emailLogs = (profiles || []).map(p => ({
      to_email: p.email,
      subject: `${title} — ${selectedEventData?.title}`,
      body: `Dear ${p.full_name},\n\n${message}\n\nEvent: ${selectedEventData?.title}\n\nBest regards,\nEventLink CRM`,
      status: 'sent'
    }))

    if (emailLogs.length > 0) {
      await supabase.from('email_logs').insert(emailLogs)
    }

    toast.success(`📢 Announcement sent to ${attendees.length} attendees via app & email!`)
    setSent(true)
    setTitle('')
    setMessage('')
    loadAnnouncementHistory(selectedEvent)
    setTimeout(() => setSent(false), 3000)
  } catch (err) {
    console.error(err)
    toast.error('Failed to send announcement')
  } finally {
    setSending(false)
  }
}

  const selectedEventData = events.find(e => e.id === selectedEvent)

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>
            📢 Announcements
          </h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>
            Send messages to all your event attendees
          </p>
        </div>
      </div>

      <div className="page-body">
        {/* Event selector */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Select Event</label>
            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
              <option value="">Choose an event...</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedEvent && (
          <>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{
                flex: 1, background: 'linear-gradient(135deg, #6C3FF5, #9B59B6)',
                borderRadius: 14, padding: '14px', textAlign: 'center', color: 'white'
              }}>
                <p style={{ fontSize: 26, fontWeight: 800 }}>{attendees.length}</p>
                <p style={{ fontSize: 11, opacity: 0.8, fontWeight: 700 }}>ATTENDEES</p>
              </div>
              <div style={{
                flex: 1, background: 'linear-gradient(135deg, #00C896, #6C3FF5)',
                borderRadius: 14, padding: '14px', textAlign: 'center', color: 'white'
              }}>
                <p style={{ fontSize: 26, fontWeight: 800 }}>{history.length}</p>
                <p style={{ fontSize: 11, opacity: 0.8, fontWeight: 700 }}>SENT</p>
              </div>
              <div style={{
                flex: 1, background: 'linear-gradient(135deg, #F59E0B, #FF6B6B)',
                borderRadius: 14, padding: '14px', textAlign: 'center', color: 'white'
              }}>
                <p style={{ fontSize: 16, fontWeight: 800 }}>
                  {selectedEventData?.status === 'published' ? '🟢' : '🔴'}
                </p>
                <p style={{ fontSize: 11, opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedEventData?.status}
                </p>
              </div>
            </div>

            {/* Quick templates */}
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                ⚡ Quick Templates
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TEMPLATES.map(t => (
                  <button key={t.label} onClick={() => {
                    setTitle(t.label)
                    setMessage(t.text)
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    border: '1.5px solid #E8EAFF', background: '#F8F9FF',
                    cursor: 'pointer', textAlign: 'left'
                  }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#6C3FF5' }}>{t.label}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                        {t.text.substring(0, 50)}...
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Compose */}
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
                ✍️ Compose Announcement
              </p>

              <div className="input-group">
                <label>Title</label>
                <input
                  placeholder="e.g. Venue Change Notice"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Message</label>
                <textarea
                  rows={4}
                  placeholder="Type your message to all attendees..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{
                    padding: '12px 16px', border: '1.5px solid #E8EAFF',
                    borderRadius: 12, fontSize: 14, resize: 'none',
                    width: '100%', background: '#F8F9FF'
                  }}
                />
              </div>

              {/* Preview */}
              {(title || message) && (
                <div style={{
                  background: '#EDE9FE', borderRadius: 12,
                  padding: '12px 14px', marginBottom: 16,
                  border: '1px solid #C4B5FD'
                }}>
                  <p style={{ fontSize: 11, color: '#6C3FF5', fontWeight: 700, marginBottom: 4 }}>
                    PREVIEW — What attendees will see:
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>
                    📢 {title || 'Your title'}
                  </p>
                  <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                    {message || 'Your message'}
                  </p>
                </div>
              )}

              <button
                className="btn-primary"
                onClick={sendAnnouncement}
                disabled={sending || sent}
                style={{
                  background: sent
                    ? 'linear-gradient(135deg, #00C896, #6C3FF5)'
                    : 'linear-gradient(135deg, #6C3FF5, #9B59B6)'
                }}
              >
                {sent
                  ? `✅ Sent to ${attendees.length} attendees!`
                  : sending
                  ? 'Sending...'
                  : `📢 Send to ${attendees.length} Attendee${attendees.length !== 1 ? 's' : ''}`}
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  📋 Recent Announcements
                </h2>
                {history.map(h => (
                  <div key={h.id} className="card" style={{ marginBottom: 10 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{h.title}</p>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>{h.body}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {new Date(h.created_at).toLocaleDateString('en-GH', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!selectedEvent && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <h3>Select an event</h3>
              <p>Choose an event above to send announcements to attendees</p>
            </div>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default Announcements