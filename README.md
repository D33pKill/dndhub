# 🎲 TTRPG HUD — Panel Táctico de Campaña

Panel de seguimiento en tiempo real para campañas de rol de fantasía oscura. Construido con Next.js 16, Tailwind CSS v4, Framer Motion y Supabase Realtime.

## ✨ Características

- **Landing con selector de rol** — Jugador o DM
- **Panel del Jugador (HUD)** — Retrato animado, barras de vida/magia/estamina, radar de estadísticas, acciones de combate, lore
- **6 estados de retrato animados** — Base, Herido, Afectado, Inconsciente, En La Zona (Destello Negro), Shock
- **Panel del DM** — Controla HP/Mana/Estamina con sliders en tiempo real, activa condiciones, fuerza estados de retrato
- **Creación de personaje en 6 pasos** — Identidad, vitales, estadísticas, acciones, retratos, lore
- **Sincronización Realtime** — vía Supabase (o localStorage offline)

## 🚀 Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/D33pKill/dndhub.git
cd dndhub
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (ya lo tienes: **dndhud**)
2. Ve al **SQL Editor** y ejecuta el archivo:

```
supabase/migrations/001_schema_inicial.sql
```

3. Copia las credenciales desde **Settings → API**:

```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🗂 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Selector de rol (Jugador / DM) |
| `/dm/login` | Login DM (contraseña: ver configuración) |
| `/dm` | Panel Maestro — control en tiempo real |
| `/jugador` | Inicio jugador — selección de personaje |
| `/jugador/crear` | Creador de personaje (6 pasos) |
| `/jugador/[id]` | HUD del personaje |
| `/jugador/[id]/editar` | Editor de personaje |

## 🗃 Esquema de base de datos

Ver [`supabase/migrations/001_schema_inicial.sql`](./supabase/migrations/001_schema_inicial.sql)

Tabla principal: `personajes` con RLS abierta y Realtime habilitado.

## 🛠 Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **Framer Motion v11**
- **Supabase** (Realtime + Storage)
- **Recharts** (Radar chart)
