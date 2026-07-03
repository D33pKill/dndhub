'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar selección de rol previa si viene de raíz
  }, []);

  return (
    <div className="bg-hud min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Partículas decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Líneas decorativas laterales */}
      <div className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: 'linear-gradient(180deg, transparent, #ff1744, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-1"
        style={{ background: 'linear-gradient(180deg, transparent, #00e5ff, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-16 px-4"
      >
        {/* Logo / Título */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff1744, transparent)' }} />
          </div>
          <span className="font-hud text-xs tracking-[0.4em] uppercase relative px-4"
            style={{ color: '#ff1744' }}>
            Sistema de campaña
          </span>
        </div>

        <h1 className="font-heading text-5xl md:text-7xl font-black mb-3 tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #c8d0e0, #ffffff, #8fa8c8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px rgba(200,208,224,0.3))'
          }}>
          PANEL TÁCTICO
        </h1>
        <p className="font-hud text-sm tracking-[0.3em] uppercase"
          style={{ color: '#00e5ff' }}>
          Campaña de Fantasía Oscura
        </p>

        <div className="mt-4 metal-divider w-48 mx-auto" />
      </motion.div>

      {/* Tarjetas de selección de rol */}
      <div className="flex flex-col sm:flex-row gap-6 px-4">
        {/* JUGADOR */}
        <motion.button
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/jugador')}
          className="relative group cursor-pointer text-left"
          style={{
            width: '260px',
            background: 'linear-gradient(135deg, #0d1117, #131820)',
            border: '1px solid #2a3548',
            borderRadius: '4px',
            padding: '32px 28px',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#ff1744';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(255,23,68,0.2), inset 0 0 20px rgba(255,23,68,0.05)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#2a3548';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          {/* Icono */}
          <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-sm"
            style={{ background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff1744" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>

          <h2 className="font-hud text-xl font-bold mb-2" style={{ color: '#ff1744' }}>
            SOY JUGADOR
          </h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: '#7a8a9a' }}>
            Crea tu personaje, sube tus retratos y accede a tu panel de combate en tiempo real.
          </p>

          <div className="mt-5 flex items-center gap-2 hud-label" style={{ color: '#ff1744' }}>
            <span>Entrar al HUD</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          {/* Brillo de esquina */}
          <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle at top right, rgba(255,23,68,0.15), transparent 70%)' }} />
        </motion.button>

        {/* DM */}
        <motion.button
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dm/login')}
          className="relative group cursor-pointer text-left"
          style={{
            width: '260px',
            background: 'linear-gradient(135deg, #0d1117, #131820)',
            border: '1px solid #2a3548',
            borderRadius: '4px',
            padding: '32px 28px',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#00e5ff';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,229,255,0.2), inset 0 0 20px rgba(0,229,255,0.05)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#2a3548';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          {/* Icono */}
          <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-sm"
            style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M2 20a10 10 0 0 1 20 0"/>
              <path d="M12 14v4M8 18h8"/>
            </svg>
          </div>

          <h2 className="font-hud text-xl font-bold mb-2" style={{ color: '#00e5ff' }}>
            SOY DM
          </h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: '#7a8a9a' }}>
            Accede al panel maestro. Controla estadísticas, condiciones y estados de todos los jugadores.
          </p>

          <div className="mt-5 flex items-center gap-2 hud-label" style={{ color: '#00e5ff' }}>
            <span>Panel Maestro</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle at top right, rgba(0,229,255,0.15), transparent 70%)' }} />
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 hud-label"
        style={{ color: '#3d5270' }}
      >
        Sistema de seguimiento táctico v1.0
      </motion.p>
    </div>
  );
}
