'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonajes, usePersonaje } from '@/hooks/usePersonajes';
import { dbActualizarPersonaje, porcentajeVida } from '@/lib/db';
import { Personaje, CondicionEstado, EstadoRetrato } from '@/types/character';
import { CONDICIONES_INFO, CONDICIONES_CRITICAS } from '@/lib/constants';
import dynamic from 'next/dynamic';

const RadarChartDM = dynamic(() => import('@/components/dm/RadarChartDM'), { ssr: false });

export default function DMPage() {
  const router = useRouter();
  const { personajes, recargar } = usePersonajes();
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState<string | null>(null);
  const [log, setLog] = useState<{ id: string; msg: string; ts: string }[]>([]);
  const [tab, setTab] = useState<'stats' | 'condiciones' | 'estados' | 'lore'>('stats');

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('dm_auth')) {
      router.replace('/dm/login');
    }
  }, [router]);

  // Polling cada 2 seg para refrescar
  useEffect(() => {
    const interval = setInterval(recargar, 2000);
    return () => clearInterval(interval);
  }, [recargar]);

  const addLog = (msg: string, nombre: string) => {
    setLog(prev => [
      { id: Date.now().toString(), msg: `[${nombre}] ${msg}`, ts: new Date().toLocaleTimeString('es') },
      ...prev.slice(0, 49)
    ]);
  };

  const pSelected = personajes.find(p => p.id === personajeSeleccionado) ?? null;

  const handleStat = (id: string, nombre: string, campo: keyof Personaje, valor: number) => {
    dbActualizarPersonaje(id, { [campo]: valor });
    addLog(`${campo.toUpperCase()} → ${valor}`, nombre);
    recargar();
  };

  const toggleCondicion = (id: string, nombre: string, cond: CondicionEstado) => {
    const p = personajes.find(x => x.id === id);
    if (!p) return;
    const tiene = p.condiciones_activas.includes(cond);
    const nuevas = tiene
      ? p.condiciones_activas.filter(c => c !== cond)
      : [...p.condiciones_activas, cond];
    dbActualizarPersonaje(id, { condiciones_activas: nuevas });
    addLog(`${tiene ? '✗' : '✓'} ${CONDICIONES_INFO[cond].nombre}`, nombre);
    recargar();
  };

  const toggleBoolean = (id: string, nombre: string, campo: 'destello_negro' | 'fallo_magico') => {
    const p = personajes.find(x => x.id === id);
    if (!p) return;
    const nuevo = !p[campo];
    dbActualizarPersonaje(id, { [campo]: nuevo });
    addLog(`${campo === 'destello_negro' ? '⚡ Destello Negro' : '💥 Fallo Mágico'} ${nuevo ? 'ON' : 'OFF'}`, nombre);
    recargar();
  };

  const forzarRetrato = (id: string, nombre: string, estado: EstadoRetrato | null) => {
    dbActualizarPersonaje(id, { retrato_forzado: estado });
    addLog(`Retrato forzado → ${estado ?? 'AUTO'}`, nombre);
    recargar();
  };

  if (personajes.length === 0) {
    return (
      <div className="bg-dungeon min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <p className="font-heading text-lg mb-2" style={{ color: '#9a7020', letterSpacing: '0.1em' }}>PANEL MAESTRO</p>
          <p className="font-sans text-sm" style={{ color: '#5a4e40' }}>No hay almas registradas todavía.</p>
          <p className="font-sans text-xs mt-2" style={{ color: '#3d3028' }}>Los jugadores deben crear sus personajes primero.</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="btn-primary px-6 py-3"
        >
          VOLVER AL INICIO
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dungeon min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.95)' }}>
        <div className="flex items-center gap-3">
          <div className="connection-dot online" />
          <span className="font-heading text-base font-bold" style={{ color: '#9a7020', letterSpacing: '0.1em' }}>PANEL MAESTRO</span>
          <span className="font-heading px-2 py-0.5" style={{ background: 'rgba(90,64,16,0.1)', border: '1px solid #5a4010', color: '#7a5818', fontSize: '9px', letterSpacing: '0.15em' }}>
            DM
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hud-label" style={{ color: '#5a4e40' }}>{personajes.length} ALMA{personajes.length !== 1 ? 'S' : ''} ACTIVA{personajes.length !== 1 ? 'S' : ''}</span>
          <button onClick={() => router.push('/')} className="btn-primary px-3 py-1.5 text-xs">
            SALIR
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Columna izquierda: tarjetas de jugadores */}
        <div className="w-72 flex-shrink-0 border-r overflow-y-auto p-4 space-y-3"
          style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.6)' }}>
          <p className="hud-label mb-4" style={{ color: '#5a4e40' }}>ALMAS EN JUEGO</p>
          {personajes.map(p => (
            <PlayerCardDM
              key={p.id}
              personaje={p}
              seleccionado={personajeSeleccionado === p.id}
              onClick={() => setPersonajeSeleccionado(prev => prev === p.id ? null : p.id)}
            />
          ))}
        </div>

        {/* Panel central/derecho */}
        <div className="flex-1 overflow-y-auto">
          {pSelected ? (
            <DMControlPanel
              personaje={pSelected}
              tab={tab}
              setTab={setTab}
              onStat={handleStat}
              onToggleCondicion={toggleCondicion}
              onToggleBoolean={toggleBoolean}
              onForzarRetrato={forzarRetrato}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center" style={{ color: '#3d3028' }}>
                <svg className="mx-auto mb-4 opacity-20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="8" r="4"/><path d="M2 20a10 10 0 0 1 20 0"/>
                </svg>
                <p className="font-heading text-sm" style={{ letterSpacing: '0.1em' }}>Selecciona un alma para controlarla</p>
              </div>
            </div>
          )}
        </div>

        {/* Log de acciones */}
        <div className="w-60 flex-shrink-0 border-l overflow-y-auto"
          style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.8)' }}>
          <div className="p-3 border-b sticky top-0"
            style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.98)' }}>
            <p className="hud-label" style={{ color: '#5a4e40' }}>CRÓNICA DE ACCIONES</p>
          </div>
          <div className="p-3 space-y-2">
            {log.length === 0 && (
              <p className="font-lore text-sm" style={{ color: '#3d3028' }}>Sin acciones todavía.</p>
            )}
            {log.map(entry => (
              <div key={entry.id} style={{ color: '#7a6e60' }}>
                <span className="font-heading" style={{ color: '#3d3028', fontSize: '8px', letterSpacing: '0.1em' }}>{entry.ts}</span>
                <p style={{ fontSize: '12px', fontFamily: 'Crimson Pro, serif' }}>{entry.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ TARJETA MINI JUGADOR ═══════════════════ */
function PlayerCardDM({ personaje, seleccionado, onClick }: {
  personaje: Personaje;
  seleccionado: boolean;
  onClick: () => void;
}) {
  const hpPct = porcentajeVida(personaje.hp, personaje.hp_max);
  const manaPct = porcentajeVida(personaje.mana, personaje.mana_max);
  const stamPct = porcentajeVida(personaje.estamina, personaje.estamina_max);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="cursor-pointer p-3 transition-all stone-frame"
      style={{
        borderColor: seleccionado ? '#7a5818' : '#2e2820',
        background: seleccionado ? 'rgba(90,64,16,0.06)' : undefined,
        boxShadow: seleccionado ? '0 0 16px rgba(90,64,16,0.12)' : 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Retrato mini */}
        <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0"
          style={{ border: `1px solid ${personaje.color_acento}40` }}>
          {personaje.retratos.base ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={personaje.retratos.base} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `${personaje.color_acento}20` }}>
              <span className="font-heading text-lg font-bold" style={{ color: personaje.color_acento }}>
                {personaje.nombre[0]}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-bold truncate" style={{ color: personaje.color_acento }}>
            {personaje.nombre}
          </p>
          <p className="hud-label truncate" style={{ color: '#4a607d', fontSize: '9px' }}>
            {personaje.clase} · Nv.{personaje.nivel}
          </p>
        </div>
        {/* Condiciones dot */}
        {personaje.condiciones_activas.length > 0 && (
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff1744', boxShadow: '0 0 6px #ff1744' }} />
        )}
      </div>

      {/* Barras mini */}
      <div className="space-y-1.5">
        <MiniBar pct={hpPct} color="#ff1744" label="HP" />
        <MiniBar pct={manaPct} color="#00b0ff" label="MP" />
        <MiniBar pct={stamPct} color="#76ff03" label="ST" />
      </div>

      {/* Condiciones activas */}
      {personaje.condiciones_activas.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {personaje.condiciones_activas.map(c => (
            <span key={c} className="hud-label px-1 py-0.5 rounded-sm"
              style={{
                background: `${CONDICIONES_INFO[c].color}15`,
                border: `1px solid ${CONDICIONES_INFO[c].color}40`,
                color: CONDICIONES_INFO[c].color,
                fontSize: '8px',
              }}>
              {CONDICIONES_INFO[c].nombre.slice(0, 6).toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MiniBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hud-label w-4 flex-shrink-0" style={{ color: '#4a607d', fontSize: '8px' }}>{label}</span>
      <div className="glow-bar-track flex-1 h-1.5">
        <div className="glow-bar-fill h-full"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 4px ${color}` }} />
      </div>
      <span className="hud-label w-6 text-right flex-shrink-0" style={{ color, fontSize: '8px' }}>{Math.round(pct)}%</span>
    </div>
  );
}

/* ═══════════════════ PANEL CONTROL DM ═══════════════════ */
function DMControlPanel({ personaje, tab, setTab, onStat, onToggleCondicion, onToggleBoolean, onForzarRetrato }: {
  personaje: Personaje;
  tab: string;
  setTab: (t: 'stats' | 'condiciones' | 'estados' | 'lore') => void;
  onStat: (id: string, nombre: string, campo: keyof Personaje, valor: number) => void;
  onToggleCondicion: (id: string, nombre: string, cond: CondicionEstado) => void;
  onToggleBoolean: (id: string, nombre: string, campo: 'destello_negro' | 'fallo_magico') => void;
  onForzarRetrato: (id: string, nombre: string, estado: EstadoRetrato | null) => void;
}) {
  const hpPct = porcentajeVida(personaje.hp, personaje.hp_max);
  const manaPct = porcentajeVida(personaje.mana, personaje.mana_max);
  const stamPct = porcentajeVida(personaje.estamina, personaje.estamina_max);

  const TABS = [
    { id: 'stats', label: 'VITALES' },
    { id: 'condiciones', label: 'CONDICIONES' },
    { id: 'estados', label: 'ESTADOS' },
    { id: 'lore', label: 'LORE & STATS' },
  ] as const;

  return (
    <div className="p-6 max-w-3xl">
      {/* Header personaje */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0"
          style={{ border: `1px solid ${personaje.color_acento}` }}>
          {personaje.retratos.base ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={personaje.retratos.base} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `${personaje.color_acento}20` }}>
              <span className="font-heading text-2xl font-bold" style={{ color: personaje.color_acento }}>
                {personaje.nombre[0]}
              </span>
            </div>
          )}
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold" style={{ color: '#b88c30', letterSpacing: '0.06em' }}>
            {personaje.nombre}
          </h2>
          <p className="hud-label" style={{ color: '#5a4e40' }}>
            {personaje.raza} · {personaje.clase} · Nivel {personaje.nivel}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <div
            className="px-3 py-1 font-heading"
            style={{
              background: personaje.destello_negro ? 'rgba(154,112,32,0.1)' : 'rgba(12,10,7,0.8)',
              border: `1px solid ${personaje.destello_negro ? '#9a7020' : '#2e2820'}`,
              color: personaje.destello_negro ? '#c8a048' : '#3d3028',
              fontSize: '9px',
              letterSpacing: '0.12em',
            }}
          >
            ❖ DESTELLO NEGRO
          </div>
          <div
            className="px-3 py-1 font-heading"
            style={{
              background: personaje.fallo_magico ? 'rgba(90,40,16,0.1)' : 'rgba(12,10,7,0.8)',
              border: `1px solid ${personaje.fallo_magico ? '#5a2810' : '#2e2820'}`,
              color: personaje.fallo_magico ? '#8b4820' : '#3d3028',
              fontSize: '9px',
              letterSpacing: '0.12em',
            }}
          >
            ☠ FALLO MÁGICO
          </div>
        </div>
      </div>

      <div className="metal-divider mb-4" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 hud-label transition-all"
            style={{
              background: tab === t.id ? 'rgba(90,64,16,0.12)' : 'transparent',
              border: `1px solid ${tab === t.id ? '#7a5818' : '#2e2820'}`,
              color: tab === t.id ? '#b88c30' : '#5a4e40',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Vitales */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <StatSlider
            label="SALUD (HP)"
            value={personaje.hp}
            max={personaje.hp_max}
            color="#6b1818"
            colorClass="hp-slider"
            pct={hpPct}
            onChange={v => onStat(personaje.id, personaje.nombre, 'hp', v)}
            onChangeMax={v => onStat(personaje.id, personaje.nombre, 'hp_max', v)}
          />
          <StatSlider
            label="MANÁ"
            value={personaje.mana}
            max={personaje.mana_max}
            color="#3a4870"
            colorClass="mana-slider"
            pct={manaPct}
            onChange={v => onStat(personaje.id, personaje.nombre, 'mana', v)}
            onChangeMax={v => onStat(personaje.id, personaje.nombre, 'mana_max', v)}
          />
          <StatSlider
            label="ESTAMINA"
            value={personaje.estamina}
            max={personaje.estamina_max}
            color="#344020"
            colorClass="stamina-slider"
            pct={stamPct}
            onChange={v => onStat(personaje.id, personaje.nombre, 'estamina', v)}
            onChangeMax={v => onStat(personaje.id, personaje.nombre, 'estamina_max', v)}
          />
        </div>
      )}

      {/* Tab: Condiciones */}
      {tab === 'condiciones' && (
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(CONDICIONES_INFO) as CondicionEstado[]).map(cond => {
            const info = CONDICIONES_INFO[cond];
            const activa = personaje.condiciones_activas.includes(cond);
            return (
              <motion.button
                key={cond}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggleCondicion(personaje.id, personaje.nombre, cond)}
                className="p-3 text-left transition-all cursor-pointer stone-frame"
                style={{
                  borderColor: activa ? '#7a5818' : '#2e2820',
                  background: activa ? 'rgba(90,64,16,0.08)' : undefined,
                  boxShadow: activa ? '0 0 12px rgba(90,64,16,0.15)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5"
                    style={{ background: activa ? '#9a7020' : '#3d3028' }} />
                  <span className="hud-label" style={{ color: activa ? '#b88c30' : '#5a4e40' }}>
                    {info.nombre.toUpperCase()}
                  </span>
                </div>
                <p className="font-lore ml-3" style={{ color: '#5a4e40', fontSize: '12px' }}>{info.descripcion}</p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Tab: Estados especiales */}
      {tab === 'estados' && (
        <div className="space-y-6">
          {/* Destello Negro / Fallo Mágico */}
          <div>
            <p className="hud-label mb-3" style={{ color: '#4a607d' }}>ESTADOS ESPECIALES</p>
            <div className="grid grid-cols-2 gap-3">
              <BigToggle
                label="⚡ DESTELLO NEGRO"
                desc="El personaje entra en un estado de poder absoluto."
                activo={personaje.destello_negro}
                color="#ffffff"
                onClick={() => onToggleBoolean(personaje.id, personaje.nombre, 'destello_negro')}
              />
              <BigToggle
                label="💥 FALLO MÁGICO"
                desc="Backfire mágico. El personaje sufre consecuencias caóticas."
                activo={personaje.fallo_magico}
                color="#ff6d00"
                onClick={() => onToggleBoolean(personaje.id, personaje.nombre, 'fallo_magico')}
              />
            </div>
          </div>

          {/* Forzar retrato */}
          <div>
            <p className="hud-label mb-3" style={{ color: '#4a607d' }}>FORZAR ESTADO DE RETRATO</p>
            <div className="grid grid-cols-3 gap-2">
              {(['base', 'herido', 'afectado', 'inconsciente', 'en_zona', 'shock'] as EstadoRetrato[]).map(estado => (
                <button
                  key={estado}
                  onClick={() => onForzarRetrato(personaje.id, personaje.nombre,
                    personaje.retrato_forzado === estado ? null : estado)}
                  className="py-2 px-3 rounded-sm hud-label transition-all cursor-pointer"
                  style={{
                    background: personaje.retrato_forzado === estado ? 'rgba(0,229,255,0.1)' : 'rgba(13,17,23,0.8)',
                    border: `1px solid ${personaje.retrato_forzado === estado ? '#00e5ff' : '#2a3548'}`,
                    color: personaje.retrato_forzado === estado ? '#00e5ff' : '#4a607d',
                  }}
                >
                  {estado.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => onForzarRetrato(personaje.id, personaje.nombre, null)}
                className="py-2 px-3 rounded-sm hud-label transition-all cursor-pointer col-span-3"
                style={{
                  background: !personaje.retrato_forzado ? 'rgba(118,255,3,0.05)' : 'rgba(13,17,23,0.8)',
                  border: `1px solid ${!personaje.retrato_forzado ? '#76ff03' : '#2a3548'}`,
                  color: !personaje.retrato_forzado ? '#76ff03' : '#4a607d',
                }}
              >
                AUTO (Sin Forzar)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Lore & Stats */}
      {tab === 'lore' && (
        <div className="space-y-6">
          {/* Estadísticas radar */}
          <div>
            <p className="hud-label mb-3" style={{ color: '#4a607d' }}>ESTADÍSTICAS BASE</p>
            <div className="h-64">
              <RadarChartDM stats={personaje.estadisticas} color={personaje.color_acento} />
            </div>
          </div>

          {/* Historia */}
          <div>
            <p className="hud-label mb-2" style={{ color: '#4a607d' }}>HISTORIA DEL PERSONAJE</p>
            <div className="lore-box p-4 rounded-sm" style={{ maxHeight: '160px' }}>
              {personaje.historia || <span style={{ color: '#3d5270' }}>Sin historia registrada.</span>}
            </div>
          </div>

          {/* Apariencia */}
          <div>
            <p className="hud-label mb-2" style={{ color: '#4a607d' }}>APARIENCIA</p>
            <div className="lore-box p-4 rounded-sm" style={{ maxHeight: '100px' }}>
              {personaje.apariencia || <span style={{ color: '#3d5270' }}>Sin descripción.</span>}
            </div>
          </div>

          {/* Acciones */}
          {personaje.acciones?.length > 0 && (
            <div>
              <p className="hud-label mb-3" style={{ color: '#4a607d' }}>ACCIONES DISPONIBLES</p>
              <div className="space-y-2">
                {personaje.acciones.map(a => (
                  <div key={a.id} className="p-3 rounded-sm"
                    style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #2a3548' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-hud text-sm font-bold" style={{ color: personaje.color_acento }}>{a.nombre}</span>
                      <span className="hud-label px-2 py-0.5 rounded-sm"
                        style={{ background: 'rgba(42,53,72,0.5)', color: '#4a607d' }}>
                        {a.tipo}
                      </span>
                      {a.danio && <span className="hud-label" style={{ color: '#ff1744' }}>⚔ {a.danio}</span>}
                    </div>
                    <p className="text-xs" style={{ color: '#7a8a9a' }}>{a.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatSlider({ label, value, max, color, colorClass, pct, onChange, onChangeMax }: {
  label: string; value: number; max: number; color: string; colorClass: string;
  pct: number; onChange: (v: number) => void; onChangeMax: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="hud-label" style={{ color }}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-hud text-xl font-bold" style={{ color }}>{value}</span>
          <span className="font-hud text-sm" style={{ color: '#4a607d' }}>/ {max}</span>
        </div>
      </div>
      <div className="glow-bar-track h-4 mb-3">
        <div className="glow-bar-fill h-full"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <div className="flex items-center gap-3">
        <span className="hud-label w-14" style={{ color: '#4a607d' }}>ACTUAL</span>
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`flex-1 ${colorClass}`}
        />
        <input
          type="number"
          value={value}
          min={0}
          max={max}
          onChange={e => onChange(Number(e.target.value))}
          className="hud-input w-16 px-2 py-1 text-center rounded-sm font-hud"
          style={{ color, fontSize: '14px' }}
        />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="hud-label w-14" style={{ color: '#4a607d' }}>MÁXIMO</span>
        <input
          type="number"
          value={max}
          min={1}
          max={999}
          onChange={e => onChangeMax(Number(e.target.value))}
          className="hud-input w-24 px-2 py-1 text-center rounded-sm font-hud ml-auto"
          style={{ color: '#8fa8c8', fontSize: '14px' }}
        />
      </div>
    </div>
  );
}

function BigToggle({ label, desc, activo, color, onClick }: {
  label: string; desc: string; activo: boolean; color: string; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="p-4 rounded-sm text-left w-full cursor-pointer transition-all"
      style={{
        background: activo ? `${color}10` : 'rgba(13,17,23,0.8)',
        border: `1px solid ${activo ? color : '#2a3548'}`,
        boxShadow: activo ? `0 0 20px ${color}25` : 'none',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-sm"
          style={{ background: activo ? color : '#3d5270', boxShadow: activo ? `0 0 8px ${color}` : 'none' }} />
        <span className="font-hud text-sm font-bold" style={{ color: activo ? color : '#4a607d' }}>{label}</span>
      </div>
      <p className="text-xs ml-5" style={{ color: '#4a607d' }}>{desc}</p>
    </motion.button>
  );
}
