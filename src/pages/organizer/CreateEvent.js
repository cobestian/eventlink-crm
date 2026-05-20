import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { createEvent } from '../../services/eventService'
import toast from 'react-hot-toast'

const CreateEvent = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    event_date: '',
    end_date: '',
    max_attendees: 100,
    price: 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.venue || !form.event_date) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      await createEvent(form, profile.id)
      toast.success('Event created! 🎉')
      navigate('/organizer/events')
    } catch (err) {
      toast.error(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/organizer/events')} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: 16
          }}>←</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>Create Event</h1>
            <p style={{ opacity: 0.75, fontSize: 13 }}>Fill in your event details</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Event Title *</label>
              <input
                placeholder="e.g. Accra Business Summit 2025"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea
                rows={3}
                placeholder="Describe your event..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{
                  padding: '12px 16px', border: '1.5px solid #E8EAFF',
                  borderRadius: 12, fontSize: 14, resize: 'none',
                  width: '100%', background: '#F8F9FF'
                }}
              />
            </div>

            <div className="input-group">
              <label>Venue *</label>
              <input
                placeholder="e.g. Accra International Conference Centre"
                value={form.venue}
                onChange={e => setForm({ ...form, venue: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={e => setForm({ ...form, event_date: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>End Date & Time</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Maximum Attendees</label>
              <input
                type="number"
                min={1}
                value={form.max_attendees}
                onChange={e => setForm({ ...form, max_attendees: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="input-group">
              <label>Ticket Price (GHS) — set 0 for free event</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              />
              <span style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                💡 Set to 0 for a free event. Attendees will pay via Paystack for paid events.
              </span>
            </div>

            <div style={{
              background: '#F8F9FF', borderRadius: 12, padding: '12px 14px',
              marginBottom: 16, border: '1px solid #E8EAFF'
            }}>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                📋 <strong>Summary:</strong> {form.title || 'Your event'} at {form.venue || 'venue'} —{' '}
                {form.price > 0 ? `GHS ${form.price} per ticket` : 'Free entry'} —{' '}
                max {form.max_attendees} attendees
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Creating...' : 'Create Event 🎉'}
            </button>

          </form>
        </div>
      </div>
      <Navbar />
    </div>
  )
}

export default CreateEvent