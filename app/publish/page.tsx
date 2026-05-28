'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NZ_CITIES = [
  'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
  'Napier-Hastings', 'Dunedin', 'Palmerston North', 'Nelson', 'Rotorua',
  'New Plymouth', 'Whangarei', 'Invercargill', 'Whanganui', 'Gisborne',
  'Queenstown', 'Blenheim', 'Timaru', 'Greymouth', 'Masterton'
]

export default function PublishPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    origin: '', destination: '', departure_date: '',
    departure_time: '', seats_total: '3', price_per_person: '',
    description: '', stops: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUserId(data.user.id)
    })
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) { router.push('/login'); return }
    setLoading(true); setError('')

    const stopsArray = form.stops
      ? form.stops.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const { error: err } = await supabase.from('trips').insert({
      driver_id: userId,
      origin: form.origin,
      destination: form.destination,
      departure_date: form.departure_date,
      departure_time: form.departure_time,
      seats_total: parseInt(form.seats_total),
      seats_available: parseInt(form.seats_total),
      price_per_person: parseFloat(form.price_per_person),
      description: form.description || null,
      stops: stopsArray.length ? stopsArray : null,
      status: 'active'
    })

    if (err) { setError('Error al publicar el viaje. Intentá de nuevo.'); setLoading(false) }
    else router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
          ← Volver
        </Link>
        <h1 className="font-display font-semibold text-2xl text-gray-900 mb-1">Publicar viaje</h1>
        <p className="text-sm text-gray-400 mb-6">Completá los datos y encontrá compañeros de ruta</p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Origen *</label>
              <select required value={form.origin} onChange={set('origin')}
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200">
                <option value="">Seleccioná...</option>
                {NZ_CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Destino *</label>
              <select required value={form.destination} onChange={set('destination')}
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200">
                <option value="">Seleccioná...</option>
                {NZ_CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Fecha *</label>
              <input type="date" required value={form.departure_date} onChange={set('departure_date')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Hora de salida *</label>
              <input type="time" required value={form.departure_time} onChange={set('departure_time')}
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Lugares disponibles *</label>
              <select required value={form.seats_total} onChange={set('seats_total')}
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200">
                {[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Precio por persona (NZD) *</label>
              <input type="number" required min="1" max="500" step="1"
                value={form.price_per_person} onChange={set('price_per_person')}
                placeholder="Ej: 35"
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Paradas intermedias <span className="text-gray-300">(opcional, separadas por coma)</span>
            </label>
            <input value={form.stops} onChange={set('stops')}
              placeholder="Ej: Hamilton, Palmerston North"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Descripción <span className="text-gray-300">(opcional)</span>
            </label>
            <textarea value={form.description} onChange={set('description')}
              rows={3} placeholder="Contá algo del viaje: tipo de auto, música, paradas, etc."
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200 resize-none" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Publicando...' : '🚗 Publicar viaje'}
          </button>
        </form>
      </div>
    </div>
  )
}
