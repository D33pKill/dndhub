'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DM_PASSWORD } from '@/lib/constants';

export default function DMLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DM_PASSWORD) {
      sessionStorage.setItem('dm_auth', 'true');
      router.push('/dm');
    } else {
      setIntentos(i => i + 1);
      setError('Contraseña incorrecta. Acceso denegado.');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setPassword('');
    }
  };

  return (
    <div className="bg-dungeon min-h-screen flex items-center justify-center p-4">

      {/* Viñeta carmesí para el DM */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(42,8,8,0.3) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: shaking ? [0, -10, 10, -7, 7, -3, 3, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm gold-frame"
        style={{ padding: '44px 36px' }}
      >
        {/* Esquinas rúnicas */}
        <div className="corner-tl" style={{ width: '16px', height: '16px', borderColor: '#7a5818' }} />
        <div className="corner-tr" style={{ width: '16px', height: '16px', borderColor: '#7a5818' }} />
        <div className="corner-bl" style={{ width: '16px', height: '16px', borderColor: '#7a5818' }} />
        <div className="corner-br" style={{ width: '16px', height: '16px', borderColor: '#7a5818' }} />

        {/* Cabecera */}
        <div className="text-center mb-8">
          {/* Icono de cerradura */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5"
            style={{ background: 'rgba(42,8,8,0.5)', border: '1px solid #4a1010' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b1818" strokeWidth="1.2">
              <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <div className="flex items-center justify-center gap-3 mb-3 opacity-50">
            <div className="h-px w-8" style={{ background: '#7a5818' }} />
            <span style={{ color: '#7a5818', fontSize: '10px' }}>⬡</span>
            <div className="h-px w-8" style={{ background: '#7a5818' }} />
          </div>

          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: '#9a7020', letterSpacing: '0.1em' }}>
            ACCESO MAESTRO
          </h1>
          <p className="font-heading text-xs tracking-[0.3em]" style={{ color: '#5a4010' }}>
            PANEL DEL DUNGEON MASTER
          </p>
          <div className="metal-divider mt-5" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="hud-label block mb-2" style={{ color: '#7a6e60' }}>
              Palabra de acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="· · · · · · · · · ·"
              className="hud-input w-full px-4 py-3"
              style={{ fontSize: '20px', letterSpacing: '0.25em', textAlign: 'center' }}
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-sans text-sm py-2 px-3"
                style={{
                  background: 'rgba(42,8,8,0.6)',
                  border: '1px solid #4a1010',
                  color: '#8b2020',
                  fontSize: '13px',
                }}
              >
                ✦ {error}
                {intentos >= 3 && (
                  <span className="block mt-1" style={{ color: '#5a4e40', fontSize: '12px' }}>
                    Pista: es el nombre del lugar + código
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!password}
            className="btn-danger w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontSize: '12px', marginTop: '8px' }}
          >
            VERIFICAR IDENTIDAD
          </button>
        </form>

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
