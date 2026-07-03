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
    <div className="bg-hud min-h-screen flex items-center justify-center p-4">
      {/* Fondo rojo oscuro para DM */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(60,0,0,0.3) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: shaking ? [0, -12, 12, -8, 8, -4, 4, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
        style={{
          background: 'linear-gradient(135deg, #0d1117, #131820)',
          border: '1px solid #2a3548',
          borderRadius: '4px',
          padding: '40px 36px',
        }}
      >
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-sm"
            style={{ background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff1744" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: '#ff1744' }}>
            ACCESO MAESTRO
          </h1>
          <p className="font-hud text-xs tracking-widest" style={{ color: '#4a607d' }}>
            PANEL DEL DUNGEON MASTER
          </p>
          <div className="metal-divider mt-4" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>
              Contraseña DM
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••••"
              className="hud-input w-full px-4 py-3 rounded-sm"
              style={{ fontSize: '18px', letterSpacing: '0.2em' }}
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-hud text-xs py-2 px-3 rounded-sm"
                style={{
                  background: 'rgba(255,23,68,0.1)',
                  border: '1px solid rgba(255,23,68,0.3)',
                  color: '#ff4569',
                }}
              >
                ⚠ {error}
                {intentos >= 3 && (
                  <span className="block mt-1" style={{ color: '#8fa8c8' }}>
                    Pista: es el nombre del lugar + código
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!password}
            className="btn-danger w-full py-3 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: '13px' }}
          >
            VERIFICAR IDENTIDAD
          </button>
        </form>

        {/* Volver */}
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full py-2 hud-label text-center cursor-pointer hover:opacity-70 transition-opacity"
          style={{ color: '#3d5270' }}
        >
          ← Volver a selección
        </button>

        {/* Esquinas decorativas */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: '#ff1744' }} />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: '#ff1744' }} />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l" style={{ borderColor: '#ff1744' }} />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r" style={{ borderColor: '#ff1744' }} />
      </motion.div>
    </div>
  );
}
