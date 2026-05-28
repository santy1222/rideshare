# 🚗 RideShare NZ

Plataforma de viajes compartidos para Nueva Zelanda.

---

## ⚡ Cómo poner esto online en 15 minutos

### Paso 1 — Configurar Supabase

1. Entrá a [supabase.com](https://supabase.com) y abrí tu proyecto
2. Andá a **SQL Editor** (menú izquierdo)
3. Copiá y pegá todo el contenido de `supabase-schema.sql`
4. Hacé clic en **Run** — esto crea todas las tablas
5. Andá a **Settings → API**
6. Copiá:
   - **Project URL** → la vas a necesitar en el paso 2
   - **anon / public key** → también la vas a necesitar

### Paso 2 — Configurar variables de entorno

1. En la carpeta del proyecto, copiá el archivo de ejemplo:
   ```
   copy .env.example .env.local
   ```
2. Abrí `.env.local` con el bloc de notas y completá:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

### Paso 3 — Probar en tu computadora (opcional pero recomendado)

Necesitás tener Node.js instalado. Descargalo de [nodejs.org](https://nodejs.org) si no lo tenés.

```bash
# En la carpeta del proyecto, abrí una terminal (cmd o PowerShell) y ejecutá:
npm install
npm run dev
```

Abrí tu navegador en `http://localhost:3000` — ¡ya debería andar!

### Paso 4 — Subir a Vercel (poner online)

**Opción A — Sin terminal (más fácil):**
1. Subí la carpeta del proyecto a un repositorio en [github.com](https://github.com)
2. Entrá a [vercel.com](https://vercel.com)
3. Hacé clic en **Add New → Project**
4. Seleccioná tu repositorio
5. En **Environment Variables** agregá:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
6. Clic en **Deploy** — en 2 minutos tenés la URL pública

**Opción B — Con terminal:**
```bash
npm install -g vercel
vercel
# Seguí las instrucciones, cuando pida variables de entorno agregá las 2 de Supabase
```

---

## 📁 Estructura del proyecto

```
rideshare-nz/
├── app/
│   ├── page.tsx          → Página principal (listado + buscador)
│   ├── trips/[id]/       → Detalle del viaje
│   ├── publish/          → Formulario publicar viaje
│   ├── profile/          → Perfil del usuario
│   ├── login/            → Iniciar sesión
│   └── register/         → Crear cuenta
├── components/
│   ├── Navbar.tsx        → Barra de navegación
│   └── TripCard.tsx      → Tarjeta de viaje
├── lib/
│   ├── supabase.ts       → Cliente de Supabase
│   └── types.ts          → Tipos TypeScript
└── supabase-schema.sql   → SQL para crear las tablas
```

---

## 🔮 Próximas funcionalidades para agregar

- Sistema de mensajes entre conductor y pasajero
- Notificaciones por email cuando alguien se suma
- Mapa con la ruta del viaje
- Verificación de número de teléfono
- Panel del conductor (ver quién pidió sumarse)
- App móvil

---

## 🛟 Soporte

Si algo no funciona, fijate en la consola del navegador (F12) y en los logs de Vercel.
