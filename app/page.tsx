'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import TripCard from '@/components/TripCard'
import { createClient } from '@/lib/supabase'
import type { Trip } from '@/lib/types'
import Link from 'next/link'

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')

  const supabase = createClient()

  const fetchTrips = async () => {
    setLoading(true)
    let query = supabase
      .from('trips')
      .select('*, driver:profiles!trips_driver_id_fkey(*)')
      .eq('status', 'active')
      .order('departure_date', { ascending: true })

    if (origin) query = query.ilike('origin', `%${origin}%`)
    if (destination) query = query.ilike('destination', `%${destination}%`)
    if (date) query = query.eq('departure_date', date)

    const { data } = await query
    setTrips((data as Trip[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTrips() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTrips()
  }

  const clearSearch = () => {
    setOrigin(''); setDestination(''); setDate('')
    setTimeout(fetchTrips, 0)
  }

  const isSearching = origin || destination || date

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-10 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-white border border-brand-100 rounded-full px-3 py-1 mb-4">
          🌿 Viajá juntos, compartí gastos
        </div>
        <h1 className="font-display font-semibold text-3xl text-brand-900 mb-2 leading-tight">
          Tu próximo viaje,<br />a mitad de precio
        </h1>
        <p className="text-brand-700 text-sm mb-6">Viajes compartidos por toda Nueva Zelanda</p>

        {/* Search box */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 p-3 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">Origen</label>
            <input
              value={origin} onChange={e => setOrigin(e.target.value)}
              placeholder="Auckland"
              className="px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">Destino</label>
            <input
              value={destination} onChange={e => setDestination(e.target.value)}
              placeholder="Wellington"
              className="px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">Fecha</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200"
            />
          </div>
          <button type="submit"
            className="mt-auto py-2 px-4 bg-brand-500 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            🔍 Buscar
          </button>
        </form>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 text-sm text-gray-400">
          <span>🚗 <strong className="text-gray-700">{trips.length}</strong> viajes disponibles</span>
          <span>🇳🇿 <strong className="text-gray-700">Nueva Zelanda</strong></span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base text-gray-900">
            {isSearching ? 'Resultados de búsqueda' : 'Viajes disponibles'}
          </h2>
          <div className="flex items-center gap-2">
            {isSearching && (
              <button onClick={clearSearch} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <div className="text-4xl mb-3">🚗</div>
            <div className="font-medium text-gray-500 mb-1">No hay viajes disponibles</div>
            <div className="text-sm">¿Por qué no publicás el tuyo?</div>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
          </div>
        )}

        {/* Publish CTA */}
        <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-gray-900 mb-1">¿Viajás pronto?</h3>
            <p className="text-xs text-gray-400">Publicá tu viaje y compartí gastos con otros</p>
          </div>
          <Link href="/publish"
            className="flex-shrink-0 px-4 py-2 bg-brand-500 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            + Publicar viaje
          </Link>
        </div>
      </div>
    </div>
  )
}
