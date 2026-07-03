'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="bg-dungeon min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

      {/* Partículas de polvo / ceniza flotante */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${150 + Math.random() * 50}, ${120 + Math.random() * 30}, ${60 + Math.random() * 30}, 0.35)`,
            }}
            animate={{
              y: [0, -60 - Math.random() * 80],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Viñeta perimetral */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 120px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.5)',
        }}
      />

      {/* Contenido central */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center mb-14 px-4"
      >
        {/* Ornamento superior */}
        <div className="flex items-center justify-center gap-4 mb-6 opacity-60">
          <div className="h-px w-24" style={{ background: 'linear-gradient(90deg, transparent, #7a5818)' }} />
          <span className="font-heading text-xs tracking-[0.4em] uppercase" style={{ color: '#7a5818' }}>
            ✦
          </span>
          <span className="font-heading text-xs tracking-[0.4em] uppercase" style={{ color: '#7a5818' }}>
            Crónica de campaña
          </span>
          <span className="font-heading text-xs tracking-[0.4em] uppercase" style={{ color: '#7a5818' }}>
            ✦
          </span>
          <div className="h-px w-24" style={{ background: 'linear-gradient(90deg, #7a5818, transparent)' }} />
        </div>

        <h1
          className="font-heading font-black mb-2 tracking-wider"
          style={{
            fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
            background: 'linear-gradient(180deg, #c8a048 0%, #9a7020 40%, #7a5818 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 8px rgba(90,64,16,0.4))',
            letterSpacing: '0.08em',
          }}
        >
          PANEL TÁCTICO
        </h1>
        <p
          className="font-heading text-sm tracking-[0.35em] uppercase mb-6"
          style={{ color: '#5a4010', letterSpacing: '0.4em' }}
        >
          Campaña de Fantasía Oscura
        </p>

        {/* Divider rúnico */}
        <div className="flex items-center justify-center gap-3 mb-2 opacity-50">
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #5a4010)' }} />
          <span style={{ color: '#5a4010', fontSize: '10px' }}>⬡</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #5a4010, transparent)' }} />
        </div>
      </motion.div>

      {/* Tarjetas de selección */}
      <div className="flex flex-col sm:flex-row gap-5 px-4">

        {/* JUGADOR */}
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push('/jugador')}
          className="relative group cursor-pointer text-left"
          style={{
            width: '260px',
            background: 'linear-gradient(160deg, #130f0b 0%, #0c0a07 100%)',
            border: '1px solid #3d3028',
            padding: '32px 28px',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#7a5818';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(90,64,16,0.15), inset 0 0 20px rgba(90,64,16,0.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#3d3028';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          {/* Esquinas decorativas */}
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />

          {/* Icono — Espada */}
          <div className="mb-5 flex items-center justify-center w-14 h-14"
            style={{ background: 'rgba(107,24,24,0.1)', border: '1px solid rgba(107,24,24,0.25)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b2020" strokeWidth="1.2">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
              <path d="M13 19l6-6"/>
              <path d="M2 2l20 20"/>
            </svg>
          </div>

          <h2 className="font-heading text-lg font-bold mb-2" style={{ color: '#9a7020', letterSpacing: '0.1em' }}>
            SOY JUGADOR
          </h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: '#7a6e60', fontSize: '14px' }}>
            Forja tu destino. Crea tu personaje, sube tus retratos y accede a tu panel de combate en tiempo real.
          </p>

          <div className="mt-5 flex items-center gap-2" style={{ color: '#5a4010', fontSize: '10px', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
            <span>ENTRAR AL HUD</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          {/* Brillo en hover */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle at top right, rgba(90,64,16,0.12), transparent 70%)' }} />
        </motion.button>

        {/* DM */}
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push('/dm/login')}
          className="relative group cursor-pointer text-left"
          style={{
            width: '260px',
            background: 'linear-gradient(160deg, #0c0a07 0%, #130f0b 100%)',
            border: '1px solid #3d3028',
            padding: '32px 28px',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#7a5818';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(90,64,16,0.15), inset 0 0 20px rgba(90,64,16,0.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#3d3028';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />

          {/* Icono — Calavera / Corona */}
          <div className="mb-5 flex items-center justify-center w-14 h-14"
            style={{ background: 'rgba(36,48,80,0.12)', border: '1px solid rgba(36,48,80,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3a4870" strokeWidth="1.2">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.2 6l-.8 3H9l-.8-3C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/>
              <path d="M9 18h6M10 22h4"/>
            </svg>
          </div>

          <h2 className="font-heading text-lg font-bold mb-2" style={{ color: '#9a7020', letterSpacing: '0.1em' }}>
            SOY DM
          </h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: '#7a6e60', fontSize: '14px' }}>
            El Maestro del Calabozo. Controla estadísticas, condiciones y el destino de todos los héroes.
          </p>

          <div className="mt-5 flex items-center gap-2" style={{ color: '#5a4010', fontSize: '10px', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
            <span>PANEL MAESTRO</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle at top right, rgba(36,48,80,0.1), transparent 70%)' }} />
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 flex flex-col items-center gap-1"
      >
        <div className="flex items-center gap-3 opacity-30">
          <div className="h-px w-12" style={{ background: '#5a4010' }} />
          <span className="font-heading text-xs tracking-[0.3em] uppercase" style={{ color: '#5a4010', fontSize: '8px' }}>
            v1.0 — Sistema de seguimiento táctico
          </span>
          <div className="h-px w-12" style={{ background: '#5a4010' }} />
        </div>
      </motion.div>
    </div>
  );
}
