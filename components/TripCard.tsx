import Link from 'next/link'
import type { Trip } from '@/lib/types'

function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-xs text-gray-400">
      <span className="text-amber-400">★</span>
      {rating.toFixed(1)}
    </span>
  )
}

export default function TripCard({ trip }: { trip: Trip }) {
  const isFull = trip.seats_available === 0
  const isLow = trip.seats_available === 1

  const date = new Date(trip.departure_date)
  const dateStr = date.toLocaleDateString('es-NZ', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className={`bg-white border rounded-xl p-4 hover:border-brand-200 hover:-translate-y-0.5 transition-all cursor-pointer ${isFull ? 'opacity-60' : 'border-gray-100'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="font-display font-semibold text-lg text-gray-900">{trip.origin}</span>
            <div className="flex flex-col items-center flex-1 max-w-[70px]">
              <div className="w-full h-px bg-gray-200 relative">
                <span className="absolute -right-1 -top-[5px] text-gray-300 text-base">›</span>
              </div>
            </div>
            <span className="font-display font-semibold text-lg text-gray-900">{trip.destination}</span>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <div className="font-display font-semibold text-xl text-brand-500">${trip.price_per_person}</div>
            <div className="text-xs text-gray-400">NZD / persona</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={trip.driver?.full_name ?? '?'} />
            <div>
              <div className="text-sm font-medium text-gray-800">{trip.driver?.full_name ?? 'Conductor'}</div>
              <Stars rating={trip.driver?.rating ?? 5} />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>📅 {dateStr}</span>
            <span>🕐 {trip.departure_time.slice(0, 5)}</span>
            {isFull ? (
              <span className="bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5 font-medium">Completo</span>
            ) : isLow ? (
              <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5 font-medium">1 lugar</span>
            ) : (
              <span className="bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5 font-medium">{trip.seats_available} lugares</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
