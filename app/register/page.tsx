'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', facebook_url: '', instagram_url: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Error al registrarse')
      setLoading(false); return
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: form.full_name,
      phone: form.phone || null,
      facebook_url: form.facebook_url || null,
      instagram_url: form.instagram_url || null,
      rating: 5.0,
      trip_count: 0,
    })

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center font-display font-semibold text-xl text-brand-500 mb-6">
          🚗 RideShare<span className="text-brand-700">.nz</span>
        </Link>
        <h1 className="font-display font-semibold text-xl text-gray-900 text-center mb-1">Creá tu cuenta</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Gratis y en menos de 2 minutos</p>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Nombre completo *</label>
            <input required value={form.full_name} onChange={set('full_name')} placeholder="Tu nombre"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email *</label>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="tu@email.com"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Contraseña *</label>
            <input type="password" required value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Teléfono (NZ) *</label>
            <input required value={form.phone} onChange={set('phone')} placeholder="+64 21 000 0000"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Facebook (opcional)</label>
            <input value={form.facebook_url} onChange={set('facebook_url')} placeholder="https://facebook.com/tu-perfil"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Instagram (opcional)</label>
            <input value={form.instagram_url} onChange={set('instagram_url')} placeholder="https://instagram.com/tu-usuario"
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-200" />
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-brand-500 hover:underline">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
