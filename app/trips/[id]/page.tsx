'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import type { Trip, Review } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const cls = size === 'lg' ? 'w-14 h-14 text-base' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${cls} rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function TripDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    Promise.all([
      supabase.from('trips')
        .select('*, driver:profiles!trips_driver_id_fkey(*)')
        .eq('id', id).single(),
      supabase.from('reviews')
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
        .eq('reviewed_id', id)
        .order('created_at', { ascending: false })
        .limit(5)
    ]).then(([tripRes, reviewsRes]) => {
      if (tripRes.data) setTrip(tripRes.data as Trip)
      if (reviewsRes.data) setReviews(reviewsRes.data as Review[])
      setLoading(false)
    })
  }, [id])

  const handleRequest = async () => {
    if (!user) { router.push('/login'); return }
    setRequesting(true)
    await supabase.from('trip_requests').insert({
      trip_id: id,
      passenger_id: user.id,
      status: 'pending'
    })
    setRequesting(false)
    setRequested(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-32 bg-white rounded-xl" />
        <div className="h-48 bg-white rounded-xl" />
      </div>
    </div>
  )

  if (!trip) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Viaje no encontrado</div>
    </div>
  )

  const dateStr = new Date(trip.departure_date).toLocaleDateString('es-NZ', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const isFull = trip.seats_available === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
          ← Volver a viajes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Route hero */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-display font-semibold text-2xl text-brand-900">{trip.origin}</span>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-px bg-brand-200 relative">
                    <span className="absolute -right-1 -top-2.5 text-brand-400 text-lg">›</span>
                  </div>
                </div>
                <span className="font-display font-semibold text-2xl text-brand-900">{trip.destination}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white border border-brand-100 text-brand-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  📅 {dateStr} · {trip.departure_time.slice(0, 5)}
                </span>
                <span className="bg-white border border-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  💵 ${trip.price_per_person} NZD por persona
                </span>
                <span className="bg-white border border-brand-100 text-brand-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  💺 {trip.seats_available} {trip.seats_available === 1 ? 'lugar' : 'lugares'} disponibles
                </span>
              </div>
            </div>

            {/* Stops */}
            {trip.stops && trip.stops.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Paradas</div>
                <div className="space-y-0">
                  {[trip.origin, ...trip.stops, trip.destination].map((stop, i, arr) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex flex-col items-center w-4 pt-1">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-brand-500' : i === arr.length - 1 ? 'bg-gray-700' : 'bg-gray-300 border border-gray-400'}`} />
                        {i < arr.length - 1 && <div className="w-px h-5 bg-gray-200 mt-1" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{stop}</div>
                        <div className="text-xs text-gray-400">
                          {i === 0 ? `Salida · ${trip.departure_time.slice(0,5)}` : i === arr.length - 1 ? 'Llegada' : 'Parada intermedia'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {trip.description && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Descripción</div>
                <p className="text-sm text-gray-600 leading-relaxed">{trip.description}</p>
              </div>
            )}

            {/* Driver */}
            {trip.driver && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Conductor</div>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={trip.driver.full_name} size="lg" />
                  <div>
                    <div className="font-display font-semibold text-base text-gray-900">{trip.driver.full_name}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <span className="text-amber-400">★</span>
                      {trip.driver.rating?.toFixed(1)} · {trip.driver.trip_count} viajes
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { val: trip.driver.trip_count, label: 'Viajes' },
                    { val: `${trip.driver.rating?.toFixed(1)} ⭐`, label: 'Puntaje' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-display font-semibold text-lg text-gray-900">{s.val}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Social links */}
                <div className="flex gap-2 mb-4">
                  {trip.driver.facebook_url && (
                    <a href={trip.driver.facebook_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                      Facebook ↗
                    </a>
                  )}
                  {trip.driver.instagram_url && (
                    <a href={trip.driver.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                      Instagram ↗
                    </a>
                  )}
                </div>

                {/* Reviews */}
                {reviews.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Opiniones</div>
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Avatar name={r.reviewer?.full_name ?? '?'} size="sm" />
                              <span className="text-sm font-medium text-gray-700">{r.reviewer?.full_name}</span>
                            </div>
                            <span className="text-xs text-gray-300">
                              {new Date(r.created_at).toLocaleDateString('es-NZ', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 pl-9 leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-20">
              <div className="font-display font-semibold text-3xl text-brand-500 mb-0.5">${trip.price_per_person}</div>
              <div className="text-xs text-gray-400 mb-4">NZD por persona · gastos compartidos</div>

              {/* Seats visual */}
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Lugares</div>
              <div className="flex gap-1.5 mb-1">
                {Array.from({ length: trip.seats_total }).map((_, i) => (
                  <div key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${i < (trip.seats_total - trip.seats_available) ? 'bg-gray-100 text-gray-300' : 'bg-brand-50 text-brand-500'}`}>
                    {i < (trip.seats_total - trip.seats_available) ? '●' : '○'}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mb-4">{trip.seats_total - trip.seats_available} ocupado · {trip.seats_available} disponible</div>

              {/* Phone */}
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Contacto</div>
              {user ? (
                <div
                  onClick={() => setPhoneRevealed(true)}
                  className={`border rounded-lg p-3 mb-4 flex items-center justify-between cursor-pointer transition-colors ${phoneRevealed ? 'border-brand-200 bg-brand-50' : 'border-gray-100 hover:border-brand-200'}`}>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Teléfono del conductor</div>
                    <div className={`font-display font-semibold tracking-wide ${phoneRevealed ? 'text-brand-500' : 'text-gray-300'}`}>
                      {phoneRevealed ? (trip.driver?.phone ?? 'No registrado') : '•••• •••• ••••'}
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg">{phoneRevealed ? '🔓' : '🔒'}</span>
                </div>
              ) : (
                <Link href="/login" className="block border border-gray-100 rounded-lg p-3 mb-4 text-center text-xs text-gray-400 hover:border-brand-200 transition-colors">
                  🔒 Iniciá sesión para ver el teléfono
                </Link>
              )}

              {/* CTA */}
              {isFull ? (
                <div className="w-full py-2.5 bg-gray-100 text-gray-400 text-sm rounded-lg text-center">
                  Viaje completo
                </div>
              ) : requested ? (
                <div className="w-full py-2.5 bg-brand-50 border border-brand-100 text-brand-700 text-sm rounded-lg text-center font-medium">
                  ✅ Interés enviado al conductor
                </div>
              ) : (
                <button onClick={handleRequest} disabled={requesting}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors">
                  {requesting ? 'Enviando...' : '👋 Me interesa este viaje'}
                </button>
              )}

              <div className="text-xs text-gray-300 text-center mt-3 flex items-center justify-center gap-1">
                🛡️ Datos visibles solo para usuarios registrados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
