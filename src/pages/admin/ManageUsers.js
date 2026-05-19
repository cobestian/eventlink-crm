import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { supabase } from '../../config/supabase'
import toast from 'react-hot-toast'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u => {
    const matchRole = filter === 'all' || u.role === filter
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const roleColor = (role) => {
    if (role === 'organizer') return { bg: '#EEF2FF', color: '#6C63FF' }
    if (role === 'agency') return { bg: '#FFF0F3', color: '#FF6584' }
    if (role === 'attendee') return { bg: '#F0FDF4', color: '#10B981' }
    return { bg: '#F3F4F6', color: '#6B7280' }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FE' }}>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>Manage Users</h1>
          <p>{users.length} total users on the platform</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: '10px 16px',
              border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'organizer', 'agency', 'attendee'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: '1.5px solid', cursor: 'pointer', textTransform: 'capitalize',
                borderColor: filter === f ? '#6C63FF' : '#E5E7EB',
                backgroundColor: filter === f ? '#6C63FF' : 'white',
                color: filter === f ? 'white' : '#6B7280',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 24 }}><p>Loading users...</p></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24 }}>
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No users found</h3>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8F9FE', borderBottom: '2px solid #E5E7EB' }}>
                    {['User', 'Email', 'Phone', 'Role', 'Organization', 'Joined'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 13, fontWeight: 600, color: '#6B7280'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => {
                    const rc = roleColor(user.role)
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0
                            }}>
                              {user.full_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{user.full_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{user.email}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{user.phone || '-'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: 20, fontSize: 12,
                            fontWeight: 600, backgroundColor: rc.bg, color: rc.color,
                            textTransform: 'capitalize'
                          }}>{user.role}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                          {user.organization_name || '-'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                          {new Date(user.created_at).toLocaleDateString('en-GH')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageUsers