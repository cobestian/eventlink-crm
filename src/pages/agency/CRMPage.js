import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAgencyBookings } from '../../services/bookingService'
import { supabase } from '../../config/supabase'
import toast from 'react-hot-toast'

const CRMPage = () => {
  const { profile } = useAuth()
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (profile) loadCRM()
  }, [profile])

  const loadCRM = async () => {
    try {
      const data = await getAgencyBookings(profile.id)
      const seen = new Set()
      const unique = (data || []).filter(b => {
        if (seen.has(b.organizer_id)) return false
        seen.add(b.organizer_id)
        return true
      })
      const enriched = unique.map(b => {
        const allBookings = (data || []).filter(x => x.organizer_id === b.organizer_id)
        const daysSince = Math.floor((new Date() - new Date(allBookings[0]?.created_at)) / (1000 * 60 * 60 * 24))
        return { ...b, totalBookings: allBookings.length, daysSince }
      })
      setOrganizers(enriched)
    } catch (err) {
      toast.error('Failed to load CRM data')
    } finally {
      setLoading(false)
    }
  }

  const sendFollowUp = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      await supabase.from('messages').insert({
        sender_id: profile.id,
        receiver_id: selected.organizer_id,
        content: message.trim()
      })
      toast.success('Follow-up sent! +15 points 🎉')
      setMessage('')
      setSelected(null)
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const getHealth = (days) => {
    if (days <= 7) return { color: '#00C896', label: 'Active', bg: '#D1FAE5' }
    if (days <= 14) return { color: '#F59E0B', label: 'Follow up', bg: '#FEF3C7' }
    return { color: '#FF6B6B', label: 'At risk', bg: '#FEE2E2' }
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>CRM</h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>Manage your organizer relationships</p>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading...</p>
        ) : organizers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🤝</div>
              <h3>No relationships yet</h3>
              <p>Accept bookings to build organizer relationships</p>
            </div>
          </div>
        ) : organizers.map(org => {
          const health = getHealth(org.daysSince)
          return (
            <div key={org.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6C3FF5, #00C896)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 20
                }}>
                  {org.profiles?.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>
                    {org.profiles?.organization_name || org.profiles?.full_name}
                  </p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>{org.profiles?.email}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>{org.profiles?.phone}</p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 11,
                  fontWeight: 700, backgroundColor: health.bg, color: health.color
                }}>{health.label}</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, background: '#F8F9FF', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#6C3FF5' }}>{org.totalBookings}</p>
                  <p style={{ fontSize: 11, color: '#6B7280' }}>Bookings</p>
                </div>
                <div style={{ flex: 1, background: '#F8F9FF', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: health.color }}>{org.daysSince}d</p>
                  <p style={{ fontSize: 11, color: '#6B7280' }}>Since contact</p>
                </div>
              </div>

              {org.daysSince > 7 && (
                <div style={{
                  background: '#FFF7ED', borderRadius: 10, padding: '10px 12px',
                  marginBottom: 12, fontSize: 12, color: '#92400E',
                  border: '1px solid #FED7AA'
                }}>
                  ⚠️ No contact in {org.daysSince} days — send a follow-up to maintain your streak!
                </div>
              )}

              <button className="btn-primary" onClick={() => setSelected(org)}>
                Send Follow-up 💬
              </button>
            </div>
          )
        })}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Follow Up
            </h3>
            <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>
              To: {selected.profiles?.organization_name || selected.profiles?.full_name}
            </p>
            <div className="input-group">
              <label>Message</label>
              <textarea rows={4}
                placeholder="Hi, I wanted to check in about upcoming events..."
                value={message} onChange={e => setMessage(e.target.value)}
                style={{ padding: '12px 16px', border: '1.5px solid #E8EAFF', borderRadius: 12, fontSize: 14, resize: 'none', width: '100%' }} />
            </div>
            <button className="btn-primary" onClick={sendFollowUp} disabled={sending}>
              {sending ? 'Sending...' : 'Send Message →'}
            </button>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  )
}

export default CRMPage