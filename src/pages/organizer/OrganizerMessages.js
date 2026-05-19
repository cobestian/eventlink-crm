import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import toast from 'react-hot-toast'

const OrganizerMessages = () => {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (profile) loadConversations()
  }, [profile])

  useEffect(() => {
    if (selected) loadMessages()
  }, [selected])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name), receiver:receiver_id(full_name)')
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })
    const seen = new Set()
    const unique = (data || []).filter(m => {
      const key = [m.sender_id, m.receiver_id].sort().join('-')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    setConversations(unique)
  }

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${selected.otherId}),and(sender_id.eq.${selected.otherId},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const sendMessage = async () => {
    if (!newMsg.trim()) return
    setSending(true)
    try {
      await supabase.from('messages').insert({
        sender_id: profile.id,
        receiver_id: selected.otherId,
        content: newMsg.trim()
      })
      setNewMsg('')
      loadMessages()
    } catch (err) {
      toast.error('Failed to send')
    } finally {
      setSending(false)
    }
  }

  const getOther = (msg) => {
    if (msg.sender_id === profile.id) return { id: msg.receiver_id, name: msg.receiver?.full_name }
    return { id: msg.sender_id, name: msg.sender?.full_name }
  }

  if (selected) {
    return (
      <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div className="app-header" style={{ paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <button onClick={() => setSelected(null)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: 16
            }}>←</button>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800
            }}>{selected.name?.charAt(0)}</div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{selected.name}</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === profile.id ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px', borderRadius: 16, fontSize: 14,
                background: m.sender_id === profile.id ? 'linear-gradient(135deg, #6C3FF5, #9B59B6)' : 'white',
                color: m.sender_id === profile.id ? 'white' : '#1A1A2E',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>{m.content}</div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 16px 24px', background: 'white',
          borderTop: '1px solid #E8EAFF', display: 'flex', gap: 10
        }}>
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: '12px 16px', border: '1.5px solid #E8EAFF',
              borderRadius: 12, fontSize: 14, background: '#F8F9FF'
            }} />
          <button onClick={sendMessage} disabled={sending} style={{
            background: 'linear-gradient(135deg, #6C3FF5, #9B59B6)',
            color: 'white', border: 'none', borderRadius: 12,
            padding: '12px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 16
          }}>→</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Messages</h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>Chat with ushering agencies</p>
        </div>
      </div>

      <div className="page-body">
        {conversations.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No messages yet</h3>
              <p>Start a conversation by hiring an agency</p>
            </div>
          </div>
        ) : conversations.map(conv => {
          const other = getOther(conv)
          return (
            <div key={conv.id} onClick={() => setSelected({ otherId: other.id, name: other.name })}
              className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #6C3FF5, #9B59B6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 18
              }}>{other.name?.charAt(0)?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{other.name}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                  {conv.content?.substring(0, 35)}...
                </p>
              </div>
              <span style={{ color: '#9CA3AF', fontSize: 18 }}>›</span>
            </div>
          )
        })}
      </div>
      <Navbar />
    </div>
  )
}

export default OrganizerMessages