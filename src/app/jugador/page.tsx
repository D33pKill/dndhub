'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersonajes } from '@/hooks/usePersonajes';
import { Personaje } from '@/types/character';

export default function JugadorPage() {
  const router = useRouter();
  const { personajes } = usePersonajes();

  return (
    <div className="bg-hud min-h-screen flex flex-col items-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Cabecera */}
        <div className="text-center mb-10">
          <p className="hud-label mb-2" style={{ color: '#ff1744' }}>SELECCIÓN DE PERSONAJE</p>
          <h1 className="font-heading text-4xl font-black" style={{
            background: 'linear-gradient(135deg, #c8d0e0, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ¿Quién eres?
          </h1>
          <div className="metal-divider mt-4 w-48 mx-auto" />
        </div>

        {/* Personajes existentes */}
        {personajes.length > 0 && (
          <div className="mb-8">
            <p className="hud-label mb-4" style={{ color: '#4a607d' }}>TUS PERSONAJES</p>
            <div className="space-y-3">
              {personajes.map((p, i) => (
                <PersonajeCard key={p.id} personaje={p} delay={i * 0.08} onClick={() => router.push(`/jugador/${p.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Crear nuevo */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/jugador/crear')}
          className="w-full py-5 rounded-sm relative overflow-hidden cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(255,23,68,0.08), rgba(255,23,68,0.04))',
            border: '1px dashed rgba(255,23,68,0.4)',
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ border: '1px solid rgba(255,23,68,0.4)' }}>
              <span style={{ color: '#ff1744', fontSize: '20px', lineHeight: 1 }}>+</span>
            </div>
            <div className="text-left">
              <p className="font-hud text-sm font-bold" style={{ color: '#ff1744' }}>CREAR NUEVO PERSONAJE</p>
              <p className="font-sans text-xs" style={{ color: '#4a607d' }}>Configura tu ficha, estadísticas y retratos</p>
            </div>
          </div>
        </motion.button>

        {/* Volver */}
        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full py-2 hud-label text-center cursor-pointer hover:opacity-70 transition-opacity"
          style={{ color: '#3d5270' }}
        >
          ← Volver al inicio
        </button>
      </motion.div>
    </div>
  );
}

function PersonajeCard({ personaje, delay, onClick }: { personaje: Personaje; delay: number; onClick: () => void }) {
  const hpPct = (personaje.hp / personaje.hp_max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-sm cursor-pointer transition-all"
      style={{
        background: 'rgba(13,17,23,0.8)',
        border: `1px solid ${personaje.color_acento}40`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = personaje.color_acento;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${personaje.color_acento}20`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${personaje.color_acento}40`;
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Retrato */}
      <div className="w-14 h-14 rounded-sm overflow-hidden flex-shrink-0"
        style={{ border: `1px solid ${personaje.color_acento}` }}>
        {personaje.retratos.base ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={personaje.retratos.base} alt={personaje.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `${personaje.color_acento}15` }}>
            <span className="font-heading text-2xl font-bold" style={{ color: personaje.color_acento }}>
              {personaje.nombre[0]}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-lg font-bold truncate" style={{ color: personaje.color_acento }}>
          {personaje.nombre}
        </h3>
        <p className="hud-label" style={{ color: '#4a607d', fontSize: '10px' }}>
          {personaje.raza} · {personaje.clase} · NIVEL {personaje.nivel}
        </p>
        {/* HP bar mini */}
        <div className="mt-2 flex items-center gap-2">
          <div className="glow-bar-track flex-1 h-2">
            <div className="glow-bar-fill h-full bar-hp" style={{ width: `${hpPct}%` }} />
          </div>
          <span className="hud-label" style={{ color: '#ff1744', fontSize: '9px' }}>
            {personaje.hp}/{personaje.hp_max}
          </span>
        </div>
      </div>

      {/* Flecha */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={personaje.color_acento} strokeWidth="2" className="flex-shrink-0 opacity-60">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </motion.div>
  );
}
