import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RideShare NZ — Compartí viajes en Nueva Zelanda',
  description: 'Encontrá o publicá viajes compartidos en Nueva Zelanda. Ahorrá en gastos y viajá acompañado.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
