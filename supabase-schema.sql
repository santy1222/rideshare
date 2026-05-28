-- ============================================
-- RideShare NZ — Schema de base de datos
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- 1. Tabla de perfiles de usuario
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  avatar_url text,
  facebook_url text,
  instagram_url text,
  rating numeric(3,1) default 5.0,
  trip_count integer default 0,
  created_at timestamp with time zone default now()
);

-- 2. Tabla de viajes
create table trips (
  id uuid default gen_random_uuid() primary key,
  driver_id uuid references profiles(id) on delete cascade not null,
  origin text not null,
  destination text not null,
  departure_date date not null,
  departure_time time not null,
  seats_total integer not null check (seats_total between 1 and 8),
  seats_available integer not null check (seats_available >= 0),
  price_per_person numeric(8,2) not null,
  description text,
  stops text[],
  status text default 'active' check (status in ('active','full','cancelled','completed')),
  created_at timestamp with time zone default now()
);

-- 3. Tabla de solicitudes de pasajeros
create table trip_requests (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  passenger_id uuid references profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamp with time zone default now(),
  unique(trip_id, passenger_id)
);

-- 4. Tabla de reseñas
create table reviews (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  reviewed_id uuid references profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamp with time zone default now(),
  unique(trip_id, reviewer_id)
);

-- ============================================
-- Seguridad: Row Level Security (RLS)
-- ============================================

alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_requests enable row level security;
alter table reviews enable row level security;

-- Perfiles: todos pueden leer, solo vos podés editar el tuyo
create policy "perfiles visibles para todos" on profiles for select using (true);
create policy "usuario edita su propio perfil" on profiles for update using (auth.uid() = id);
create policy "usuario crea su propio perfil" on profiles for insert with check (auth.uid() = id);

-- Viajes: todos pueden ver los activos, solo el conductor puede crear/editar
create policy "viajes visibles para todos" on trips for select using (true);
create policy "conductor publica viajes" on trips for insert with check (auth.uid() = driver_id);
create policy "conductor edita sus viajes" on trips for update using (auth.uid() = driver_id);

-- Solicitudes: pasajero crea las suyas, conductor ve las de sus viajes
create policy "pasajero crea solicitud" on trip_requests for insert with check (auth.uid() = passenger_id);
create policy "ver solicitudes propias" on trip_requests for select using (
  auth.uid() = passenger_id or
  auth.uid() in (select driver_id from trips where id = trip_id)
);

-- Reseñas: todos pueden leer, solo usuarios autenticados crean
create policy "reseñas visibles para todos" on reviews for select using (true);
create policy "usuario autenticado puede reseñar" on reviews for insert with check (auth.uid() = reviewer_id);

-- ============================================
-- Función: actualizar rating del conductor
-- ============================================
create or replace function update_driver_rating()
returns trigger as $$
begin
  update profiles set
    rating = (
      select round(avg(rating)::numeric, 1)
      from reviews
      where reviewed_id = NEW.reviewed_id
    ),
    trip_count = (
      select count(*) from trips
      where driver_id = NEW.reviewed_id and status = 'completed'
    )
  where id = NEW.reviewed_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_new_review
after insert on reviews
for each row execute function update_driver_rating();
