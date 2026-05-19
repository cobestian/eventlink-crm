import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getOrganizerEvents, getEventAttendees, checkInAttendee } from '../../services/eventService'
import toast from 'react-hot-toast'

const AttendeeList = () => {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) getOrganizerEvents(profile.id).then(setEvents)
  }, [profile])

  useEffect(() => {
    if (selectedEvent) {
      setLoading(true)
      getEventAttendees(selectedEvent).then(data => {
        setAttendees(data || [])
        setLoading(false)
      })
    }
  }, [selectedEvent])

  const handleCheckIn = async (rsvpId) => {
    try {
      await checkInAttendee(rsvpId)
      toast.success('Attendee checked in! ✅')
      getEventAttendees(selectedEvent).then(setAttendees)
    } catch (err) {
      toast.error('Check-in failed')
    }
  }

  const checkedIn = attendees.filter(a => a.checked_in).length

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Attendees</h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>Track and check in attendees</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Select Event</label>
            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
              <option value="">Choose an event to view attendees...</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedEvent && (
          <>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              {[
                { label: 'Total RSVPs', value: attendees.length, icon: '👥', bg: 'linear-gradient(135deg, #6C3FF5, #9B59B6)' },
                { label: 'Checked In', value: checkedIn, icon: '✅', bg: 'linear-gradient(135deg, #00C896, #6C3FF5)' },
                { label: 'Pending', value: attendees.length - checkedIn, icon: '⏳', bg: 'linear-gradient(135deg, #F59E0B, #FF6B6B)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: s.bg, borderRadius: 16, padding: '16px 12px',
                  textAlign: 'center', color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <p style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</p>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</p>
                  <p style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading...</p>
            ) : attendees.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No attendees yet</h3>
                  <p>Attendees will appear here once they RSVP</p>
                </div>
              </div>
            ) : attendees.map(a => (
              <div key={a.id} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6C3FF5, #FF6B6B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 16
                }}>
                  {a.profiles?.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{a.profiles?.full_name}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{a.profiles?.email}</p>
                  {a.profiles?.phone && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{a.profiles?.phone}</p>}
                </div>
                {a.checked_in ? (
                  <span style={{
                    padding: '6px 14px', borderRadius: 20,
                    background: '#D1FAE5', color: '#065F46', fontSize: 12, fontWeight: 700
                  }}>✅ In</span>
                ) : (
                  <button onClick={() => handleCheckIn(a.id)} style={{
                    padding: '8px 14px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #00C896, #6C3FF5)',
                    color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}>Check In</button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default AttendeeList