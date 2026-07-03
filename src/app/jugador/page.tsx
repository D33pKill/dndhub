'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersonajes } from '@/hooks/usePersonajes';
import { Personaje } from '@/types/character';

export default function JugadorPage() {
  const router = useRouter();
  const { personajes } = usePersonajes();

  return (
    <div className="bg-dungeon min-h-screen flex flex-col items-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-xl"
      >
        {/* Cabecera */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #7a5818)' }} />
            <span style={{ color: '#7a5818', fontSize: '10px' }}>✦</span>
            <span className="font-heading text-xs tracking-[0.35em] uppercase" style={{ color: '#7a5818' }}>
              Selección de Personaje
            </span>
            <span style={{ color: '#7a5818', fontSize: '10px' }}>✦</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #7a5818, transparent)' }} />
          </div>

          <h1 className="font-heading text-4xl font-black mb-1" style={{
            background: 'linear-gradient(180deg, #c8a048 0%, #9a7020 60%, #7a5818 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.06em',
          }}>
            ¿Quién eres?
          </h1>
          <div className="metal-divider mt-4 w-40 mx-auto" />
        </div>

        {/* Personajes existentes */}
        {personajes.length > 0 && (
          <div className="mb-6">
            <p className="hud-label mb-4" style={{ color: '#5a4e40' }}>Almas registradas</p>
            <div className="space-y-2">
              {personajes.map((p, i) => (
                <PersonajeCard
                  key={p.id}
                  personaje={p}
                  delay={i * 0.07}
                  onClick={() => router.push(`/jugador/${p.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Crear nuevo */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push('/jugador/crear')}
          className="w-full py-5 relative overflow-hidden cursor-pointer"
          style={{
            background: 'linear-gradient(160deg, rgba(19,15,11,0.9), rgba(12,10,7,0.95))',
            border: '1px dashed #3d3028',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#7a5818';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(90,64,16,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#3d3028';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-9 h-9 flex items-center justify-center"
              style={{ border: '1px solid #5a4010' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a5818" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-heading text-sm font-bold" style={{ color: '#9a7020', letterSpacing: '0.08em' }}>
                CREAR NUEVO PERSONAJE
              </p>
              <p className="font-sans text-xs mt-0.5" style={{ color: '#5a4e40', fontSize: '13px' }}>
                Forja tu identidad, estadísticas y retratos
              </p>
            </div>
          </div>
        </motion.button>

        {/* Volver */}
        <button
          onClick={() => router.push('/')}
          className="mt-5 w-full py-2 hud-label text-center cursor-pointer hover:opacity-60 transition-opacity"
          style={{ color: '#3d3028', fontSize: '10px' }}
        >
          ← Volver a la entrada
        </button>
      </motion.div>
    </div>
  );
}

function PersonajeCard({ personaje, delay, onClick }: { personaje: Personaje; delay: number; onClick: () => void }) {
  const hpPct = (personaje.hp / personaje.hp_max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.005, x: 3 }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 cursor-pointer stone-frame"
      style={{ transition: 'border-color 0.25s, box-shadow 0.25s' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#7a5818';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(90,64,16,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#3d3028';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Retrato */}
      <div className="w-14 h-14 overflow-hidden flex-shrink-0"
        style={{ border: '1px solid #3d3028' }}>
        {personaje.retratos.base ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={personaje.retratos.base} alt={personaje.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'rgba(19,15,11,0.8)' }}>
            <span className="font-heading text-2xl font-bold" style={{ color: '#9a7020' }}>
              {personaje.nombre[0]}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-base font-bold truncate mb-0.5" style={{ color: '#b88c30', letterSpacing: '0.05em' }}>
          {personaje.nombre}
        </h3>
        <p className="hud-label" style={{ color: '#5a4e40', fontSize: '9px' }}>
          {personaje.raza} · {personaje.clase} · Niv. {personaje.nivel}
        </p>
        {/* Barra de vida */}
        <div className="mt-2 flex items-center gap-2">
          <div className="glow-bar-track flex-1 h-1.5">
            <div className="glow-bar-fill h-full bar-hp" style={{ width: `${hpPct}%` }} />
          </div>
          <span className="font-heading" style={{ color: '#6b1818', fontSize: '9px', letterSpacing: '0.05em' }}>
            {personaje.hp}/{personaje.hp_max}
          </span>
        </div>
      </div>

      {/* Flecha */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#5a4010" strokeWidth="2" className="flex-shrink-0 opacity-60">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </motion.div>
  );
}
