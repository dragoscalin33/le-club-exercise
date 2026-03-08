import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import type { Restaurant } from '../types'

export default function RestaurantsPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRestaurants = () => {
    setLoading(true)
    apiClient
      .get<Restaurant[]>('/restaurants')
      .then((res) => setRestaurants(res.data))
      .catch(() => setError('Failed to load restaurants'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchRestaurants, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this restaurant?')) return
    try {
      await apiClient.delete(`/restaurants/${id}`)
      setRestaurants((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert('Failed to delete restaurant')
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Le Club — Restaurants</h1>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user?.email}</span>
          <button onClick={() => navigate('/restaurants/new')} style={styles.btnPrimary}>
            + New
          </button>
          <button onClick={logout} style={styles.btnGhost}>
            Logout
          </button>
        </div>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={{ padding: '2rem' }}>Loading…</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Photo</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Created by</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    No restaurants yet.
                  </td>
                </tr>
              ) : (
                restaurants.map((r) => (
                  <tr key={r.id} style={styles.tr}>
                    <td style={styles.td}>
                      {r.photoUrl ? (
                        <img src={r.photoUrl} alt={r.name} style={styles.thumb} />
                      ) : (
                        <div style={styles.noPhoto}>—</div>
                      )}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{r.name}</td>
                    <td style={styles.td}>{r.address}</td>
                    <td style={styles.td}>{r.description ?? '—'}</td>
                    <td style={styles.td}>{r.createdBy?.email ?? '—'}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => navigate(`/restaurants/${r.id}/edit`)}
                        style={styles.btnSmall}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{ ...styles.btnSmall, ...styles.btnDanger }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f9f9' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: '#111',
    color: '#fff',
  },
  title: { margin: 0, fontSize: '1.25rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userEmail: { fontSize: '0.875rem', opacity: 0.7 },
  btnPrimary: {
    padding: '0.5rem 1rem',
    background: '#fff',
    color: '#111',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnGhost: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: { color: '#c0392b', padding: '1rem 2rem' },
  tableWrapper: { padding: '2rem', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  th: { padding: '0.75rem 1rem', background: '#f0f0f0', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e0e0e0' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', verticalAlign: 'middle' },
  thumb: { width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px' },
  noPhoto: { width: '56px', height: '56px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' },
  btnSmall: { padding: '0.3rem 0.75rem', marginRight: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', background: '#fff' },
  btnDanger: { borderColor: '#e74c3c', color: '#e74c3c' },
}
