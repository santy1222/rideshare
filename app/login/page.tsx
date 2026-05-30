'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false) }
    else router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center font-display font-semibold text-xl text-brand-500 mb-6">
          🚗 RideShare<span className="text-brand-700">.nz</span>
        </Link>
        <h1 className="font-display font-semibold text-xl text-gray-900 text-center mb-1">Bienvenido de vuelta</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Iniciá sesión para continuar</p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="text-brand-500 hover:underline">Registrate acá</Link>
        </p>
      </div>
    </div>
  )
}
