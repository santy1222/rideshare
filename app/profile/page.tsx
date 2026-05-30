'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import TripCard from '@/components/TripCard'
import { useRouter } from 'next/navigation'
import type { Profile, Trip, Review } from '@/lib/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', facebook_url: '', instagram_url: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const uid = data.user.id

      const [profileRes, tripsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).single(),
        supabase.from('trips').select('*, driver:profiles!trips_driver_id_fkey(*)')
          .eq('driver_id', uid).order('departure_date', { ascending: false }),
        supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
          .eq('reviewed_id', uid).order('created_at', { ascending: false })
      ])

      if (profileRes.data) {
        setProfile(profileRes.data as Profile)
        setForm({
          full_name: profileRes.data.full_name ?? '',
          phone: profileRes.data.phone ?? '',
          facebook_url: profileRes.data.facebook_url ?? '',
          instagram_url: profileRes.data.instagram_url ?? '',
        })
      }
      if (tripsRes.data) setTrips(tripsRes.data as Trip[])
      if (reviewsRes.data) setReviews(reviewsRes.data as Review[])
    })
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', profile.id)
    setProfile(p => p ? { ...p, ...form } : p)
    setEditing(false); setSaving(false)
  }

  if (!profile) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-32 bg-white rounded-xl" />
      </div>
    </div>
  )

  const initials = profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Profile card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-display font-semibold">
                {initials}
              </div>
              <div>
                <h1 className="font-display font-semibold text-xl text-gray-900">{profile.full_name}</h1>
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                  <span className="text-amber-400">★</span>
                  {profile.rating?.toFixed(1)} · {profile.trip_count} viajes
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  Miembro desde {new Date(profile.created_at).toLocaleDateString('es-NZ', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)}
              className="text-xs text-brand-500 border border-brand-100 rounded-lg px-3 py-1.5 hover:bg-brand-50 transition-colors">
              {editing ? 'Cancelar' : '✏️ Editar'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3 border-t border-gray-50 pt-4">
              {[
                { k: 'full_name', label: 'Nombre completo', ph: 'Tu nombre' },
                { k: 'phone', label: 'Teléfono', ph: '+64 21 000 0000' },
                { k: 'facebook_url', label: 'Facebook', ph: 'https://facebook.com/...' },
                { k: 'instagram_url', label: 'Instagram', ph: 'https://instagram.com/...' },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{f.label}</label>
                  <input value={(form as any)[f.k]} onChange={set(f.k)} placeholder={f.ph}
                    className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
                </div>
              ))}
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-50 pt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Teléfono</div>
                <div className="text-gray-700">{profile.phone ?? 'No registrado'}</div>
              </div>
              {profile.facebook_url && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Facebook</div>
                  <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="text-brand-500 hover:underline text-xs">Ver perfil ↗</a>
                </div>
              )}
              {profile.instagram_url && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Instagram</div>
                  <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="text-brand-500 hover:underline text-xs">Ver perfil ↗</a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* My trips */}
        <div>
          <h2 className="font-display font-semibold text-base text-gray-900 mb-3">Mis viajes publicados</h2>
          {trips.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400 text-sm">
              Todavía no publicaste ningún viaje.
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map(t => <TripCard key={t.id} trip={t} />)}
            </div>
          )}
        </div>

        {/* Reviews received */}
        {reviews.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-base text-gray-900 mb-3">Opiniones recibidas</h2>
            <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
              {reviews.map(r => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                        {(r.reviewer?.full_name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{r.reviewer?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {'★'.repeat(r.rating)}<span className="text-amber-400" />
                      <span className="text-gray-300">{new Date(r.created_at).toLocaleDateString('es-NZ', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 pl-9 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
