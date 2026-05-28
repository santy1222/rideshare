'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-xl text-brand-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
            <circle cx="13" cy="17" r="2"/><circle cx="19" cy="17" r="2"/>
            <path d="M9 11l4-4 4 4M13 7v10M19 15v-3a2 2 0 0 0-2-2h-1"/>
          </svg>
          RideShare<span className="text-brand-700">.nz</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
            🇳🇿 Nueva Zelanda
          </span>

          {user ? (
            <>
              <Link href="/publish"
                className="text-sm px-4 py-1.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
                + Publicar viaje
              </Link>
              <Link href="/profile"
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Mi perfil
              </Link>
              <button onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/register"
                className="text-sm px-4 py-1.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
