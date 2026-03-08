import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../api/client'
import type { Restaurant } from '../types'

export default function RestaurantFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    apiClient.get<Restaurant>(`/restaurants/${id}`).then((res) => {
      const r = res.data
      setName(r.name)
      setAddress(r.address)
      setDescription(r.description ?? '')
      setPhotoUrl(r.photoUrl ?? '')
      if (r.photoUrl) setPhotoPreview(r.photoUrl)
    })
  }, [id, isEdit])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return photoUrl || null
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', photoFile)
      const res = await apiClient.post<{ url: string }>('/upload/image', form)
      return res.data.url
    } catch {
      throw new Error('Photo upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const finalPhotoUrl = await uploadPhoto()
      const payload = {
        name,
        address,
        description: description || undefined,
        photoUrl: finalPhotoUrl ?? undefined,
      }
      if (isEdit) {
        await apiClient.patch(`/restaurants/${id}`, payload)
      } else {
        await apiClient.post('/restaurants', payload)
      }
      navigate('/restaurants')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <button onClick={() => navigate('/restaurants')} style={styles.back}>← Back</button>
          <h2 style={styles.title}>{isEdit ? 'Edit Restaurant' : 'New Restaurant'}</h2>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
            placeholder="Restaurant name"
          />

          <label style={styles.label}>Address *</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={styles.input}
            placeholder="Full address"
          />

          <label style={styles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            placeholder="Short description"
          />

          <label style={styles.label}>Photo</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          {photoPreview && (
            <img src={photoPreview} alt="preview" style={styles.preview} />
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            style={styles.submit}
          >
            {uploading ? 'Uploading photo…' : loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create restaurant'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f9f9f9', display: 'flex', justifyContent: 'center', padding: '3rem 1rem', fontFamily: 'sans-serif' },
  card: { background: '#fff', borderRadius: '8px', boxShadow: '0 1px 8px rgba(0,0,0,0.1)', padding: '2rem', width: '100%', maxWidth: '520px', height: 'fit-content' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  back: { background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '0.9rem' },
  title: { margin: 0, fontSize: '1.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#333' },
  input: { padding: '0.6rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' },
  preview: { width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem' },
  submit: { marginTop: '0.5rem', padding: '0.75rem', background: '#111', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#c0392b', fontSize: '0.875rem', margin: '0 0 1rem' },
}
