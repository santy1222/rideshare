export interface Profile {
  id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  rating: number
  trip_count: number
  created_at: string
}

export interface Trip {
  id: string
  driver_id: string
  origin: string
  destination: string
  departure_date: string
  departure_time: string
  seats_total: number
  seats_available: number
  price_per_person: number
  description: string | null
  stops: string[] | null
  status: 'active' | 'full' | 'cancelled' | 'completed'
  created_at: string
  driver?: Profile
}

export interface Review {
  id: string
  trip_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string
  created_at: string
  reviewer?: Profile
}

export interface TripRequest {
  id: string
  trip_id: string
  passenger_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  passenger?: Profile
  trip?: Trip
}
