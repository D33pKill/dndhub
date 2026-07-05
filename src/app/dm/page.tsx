'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonajes } from '@/hooks/usePersonajes';
import { dbActualizarPersonaje, porcentajeVida, derivarEstadoRetrato } from '@/lib/db';
import { Personaje, CondicionEstado, EstadoRetrato, formatModificador, EstadisticasBase } from '@/types/character';
import { CONDICIONES_INFO, ATRIBUTOS_BASE } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';

const RadarChartDM = dynamic(() => import('@/components/dm/RadarChartDM'), { ssr: false });

export default function DMPage() {
  const router = useRouter();
  const { personajes, recargar } = usePersonajes();
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState<string | null>(null);
  const [log, setLog] = useState<{ id: string; msg: string; ts: string }[]>([]);
  const [tab, setTab] = useState<'stats' | 'condiciones' | 'estados' | 'lore'>('stats');

  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [chatSender, setChatSender] = useState<'dm' | 'npc'>('dm');
  const [customNpcName, setCustomNpcName] = useState('Narrador');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('dm_auth')) {
      router.replace('/dm/login');
    }
  }, [router]);

  // Polling para refrescar almas
  useEffect(() => {
    const interval = setInterval(recargar, 2000);
    return () => clearInterval(interval);
  }, [recargar]);

  // Cargar y suscribir mensajes de chat
  const cargarMensajes = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mensajes?order=created_at.asc`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMensajes(data);
      }
    } catch (e) {
      console.warn('Error loading messages from database, using fallback', e);
    }
  };

  useEffect(() => {
    cargarMensajes();
    if (supabase) {
      const dbChannel = supabase
        .channel('realtime-mensajes-dm')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, (payload) => {
          setMensajes(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        })
        .subscribe();

      const bcChannel = supabase
        .channel('mensajes-broadcast-dm')
        .on('broadcast', { event: 'nuevo-mensaje' }, (response) => {
          setMensajes(prev => {
            if (prev.some(m => m.id === response.payload.id)) return prev;
            return [...prev, response.payload];
          });
        })
        .subscribe();

      return () => {
        supabase!.removeChannel(dbChannel);
        supabase!.removeChannel(bcChannel);
      };
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const addLog = (msg: string, nombre: string) => {
    setLog(prev => [
      { id: Date.now().toString(), msg: `[${nombre}] ${msg}`, ts: new Date().toLocaleTimeString('es') },
      ...prev.slice(0, 49)
    ]);
  };

  const pSelected = personajes.find(p => p.id === personajeSeleccionado) ?? null;

  const handleStat = (id: string, nombre: string, campo: keyof Personaje, valor: number) => {
    dbActualizarPersonaje(id, { [campo]: valor });
    addLog(`${String(campo).toUpperCase()} → ${valor}`, nombre);
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

  const toggleEstadoEspecial = (id: string, nombre: string) => {
    const p = personajes.find(x => x.id === id);
    if (!p) return;
    const nuevo = !p.estado_especial;
    dbActualizarPersonaje(id, { estado_especial: nuevo });
    addLog(`⚡ ${p.nombre_estado_especial} ${nuevo ? 'ON' : 'OFF'}`, nombre);
    recargar();
  };

  const forzarRetrato = (id: string, nombre: string, estado: EstadoRetrato | null) => {
    dbActualizarPersonaje(id, { retrato_forzado: estado });
    addLog(`Retrato forzado → ${estado ?? 'AUTO'}`, nombre);
    recargar();
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    const senderName = chatSender === 'dm' ? 'DM' : customNpcName.trim();
    const msgId = uuidv4();
    const msg = {
      id: msgId,
      sender_name: senderName,
      sender_avatar: null,
      content: nuevoMensaje.trim(),
      created_at: new Date().toISOString()
    };

    setNuevoMensaje('');

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mensajes`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          sender_name: msg.sender_name,
          sender_avatar: msg.sender_avatar,
          content: msg.content
        })
      });

      if (!res.ok) throw new Error('Database insert failed');
    } catch (err) {
      setMensajes(prev => [...prev, msg]);
      if (supabase) {
        supabase.channel('mensajes-broadcast').send({
          type: 'broadcast',
          event: 'nuevo-mensaje',
          payload: msg
        });
      }
    }
  };

  if (personajes.length === 0) {
    return (
      <div className="bg-dungeon min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <p className="font-heading text-lg mb-2" style={{ color: '#9a7020', letterSpacing: '0.1em' }}>PANEL MAESTRO</p>
          <p className="font-lore text-sm" style={{ color: '#5a4e40' }}>No hay almas registradas todavía.</p>
          <p className="font-lore text-xs mt-2" style={{ color: '#3d3028' }}>Los jugadores deben crear sus personajes primero.</p>
        </div>
        <button onClick={() => router.push('/')} className="btn-primary px-6 py-3">VOLVER AL INICIO</button>
      </div>
    );
  }

  return (
    <div className="bg-dungeon min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
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
              onToggleEstadoEspecial={toggleEstadoEspecial}
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

        {/* Columna Derecha: Crónica & Chat en Tiempo Real */}
        <div className="w-80 flex-shrink-0 border-l flex flex-col overflow-hidden"
          style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.8)' }}>
          
          {/* Log de acciones */}
          <div className="flex-1 flex flex-col overflow-hidden border-b" style={{ borderColor: '#1c1712' }}>
            <div className="p-3 border-b sticky top-0 flex-shrink-0"
              style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.98)' }}>
              <p className="hud-label" style={{ color: '#5a4e40' }}>CRÓNICA DE ACCIONES</p>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1">
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

          {/* Chat de Campaña para el DM */}
          <div className="h-[380px] flex flex-col overflow-hidden bg-stone-950/60 flex-shrink-0">
            <div className="p-2.5 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'rgba(90,64,16,0.15)' }}>
              <span className="font-heading text-[9px] tracking-widest text-[#b8a070]">CHAT DE CAMPAÑA</span>
              <div className="flex gap-1.5 items-center">
                <select
                  value={chatSender}
                  onChange={e => setChatSender(e.target.value as any)}
                  className="bg-stone-900 text-stone-400 font-heading text-[8px] tracking-wider border border-stone-800 rounded-sm px-1 py-0.5 cursor-pointer outline-none"
                >
                  <option value="dm">MAESTRO (DM)</option>
                  <option value="npc">PERSONAJE / NPC</option>
                </select>
                {chatSender === 'npc' && (
                  <input
                    type="text"
                    value={customNpcName}
                    onChange={e => setCustomNpcName(e.target.value)}
                    placeholder="Nombre NPC"
                    className="w-16 bg-stone-900 border border-stone-800 rounded-sm text-[8px] px-1 py-0.5 text-stone-300 font-heading outline-none"
                  />
                )}
              </div>
            </div>

            {/* Log de Mensajes */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {mensajes.map((m, idx) => {
                const esDm = m.sender_name === 'DM' || m.sender_name === 'Narrador' || m.sender_name.startsWith('OOC');
                
                return (
                  <div key={m.id || idx} className="flex gap-2 items-start text-xs font-lore">
                    {m.sender_avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.sender_avatar} alt={m.sender_name} className="w-6 h-6 rounded-sm object-cover flex-shrink-0 border border-stone-800" />
                    ) : (
                      <div className="w-6 h-6 rounded-sm bg-stone-900 flex items-center justify-center text-[9px] font-heading border border-stone-800 flex-shrink-0 text-stone-500">
                        {esDm ? '👑' : m.sender_name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading font-bold text-[9px] tracking-wide"
                          style={{ color: esDm ? '#9a7020' : '#7a6e60' }}>
                          {m.sender_name}
                        </span>
                        <span className="text-[7px] text-stone-600">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-stone-300 leading-normal mt-0.5 font-lore break-all">{m.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input para escribir */}
            <div className="p-2 border-t flex gap-2 flex-shrink-0" style={{ borderColor: 'rgba(90,64,16,0.15)' }}>
              <input
                type="text"
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') enviarMensaje(); }}
                placeholder="Escribe un mensaje como DM..."
                className="flex-1 bg-stone-900 border border-stone-800 rounded-sm text-xs px-2 py-1.5 text-stone-200 placeholder-stone-600 outline-none"
              />
              <button
                onClick={enviarMensaje}
                className="px-2.5 py-1.5 rounded-sm font-heading text-[10px] text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 cursor-pointer flex-shrink-0"
              >
                ENVIAR
              </button>
            </div>
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
  const estadoRetrato = derivarEstadoRetrato(personaje) as EstadoRetrato;
  const url = personaje.retratos[estadoRetrato] ?? personaje.retratos.base ?? null;

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
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0"
          style={{ border: `1px solid ${personaje.color_acento}40` }}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `${personaje.color_acento}20` }}>
              <span className="font-heading text-lg font-bold" style={{ color: personaje.color_acento }}>
                {personaje.nombre[0]}
              </span>
            </div>
          )}
        </div>
        <div>
          <span className="font-heading text-sm font-bold text-stone-200" style={{ letterSpacing: '0.05em' }}>
            {personaje.nombre}
          </span>
          <p className="hud-label text-stone-500" style={{ fontSize: '9px' }}>
            {personaje.clase} · Nivel {personaje.nivel}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-lore" style={{ color: '#7a6e60' }}>
          <span>HP: {personaje.hp}/{personaje.hp_max}</span>
          <span>{Math.round(hpPct)}%</span>
        </div>
        <div className="glow-bar-track h-2">
          <div className="glow-bar-fill h-full bar-hp" style={{ width: `${hpPct}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════ PANEL DE CONTROL INDIVIDUAL ═══════════════════ */
function DMControlPanel({
  personaje,
  tab,
  setTab,
  onStat,
  onToggleCondicion,
  onToggleEstadoEspecial,
  onForzarRetrato,
}: {
  personaje: Personaje;
  tab: 'stats' | 'condiciones' | 'estados' | 'lore';
  setTab: (t: 'stats' | 'condiciones' | 'estados' | 'lore') => void;
  onStat: (id: string, nombre: string, campo: keyof Personaje, valor: number) => void;
  onToggleCondicion: (id: string, nombre: string, cond: CondicionEstado) => void;
  onToggleEstadoEspecial: (id: string, nombre: string) => void;
  onForzarRetrato: (id: string, nombre: string, estado: EstadoRetrato | null) => void;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Cabecera personaje */}
      <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: 'rgba(90,64,16,0.1)' }}>
        <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0"
          style={{ border: `1px solid ${personaje.color_acento}40` }}>
          {personaje.retratos.base ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={personaje.retratos.base} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-stone-900" />
          )}
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-stone-200" style={{ letterSpacing: '0.06em' }}>
            {personaje.nombre}
          </h2>
          <p className="font-lore text-sm text-stone-500">
            {personaje.clase} ({personaje.subclase}) · Nivel {personaje.nivel}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: '#1c1712' }}>
        {[
          { id: 'stats', label: 'VITALES & CONTROL' },
          { id: 'condiciones', label: 'AFLICCIONES' },
          { id: 'estados', label: 'RETRATOS & ESTADOS' },
          { id: 'lore', label: 'HISTORIA' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className="px-4 py-2 font-heading text-xs tracking-wider border-b-2 cursor-pointer transition-all"
            style={{
              borderColor: tab === t.id ? personaje.color_acento : 'transparent',
              color: tab === t.id ? personaje.color_acento : '#5a4e40',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenidos */}
      <div className="space-y-6">
        {tab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control HP */}
            <div className="p-4 stone-frame space-y-4">
              <span className="font-heading text-xs font-bold text-[#b8a070]">PUNTOS DE GOLPE (HP)</span>
              <div className="flex items-center gap-4">
                <span className="font-heading text-3xl font-black text-red-500">{personaje.hp}</span>
                <span className="text-stone-600">/</span>
                <span className="font-heading text-xl text-stone-500">{personaje.hp_max} PV</span>
              </div>
              <input
                type="range"
                min={0}
                max={personaje.hp_max}
                value={personaje.hp}
                onChange={e => onStat(personaje.id, personaje.nombre, 'hp', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onStat(personaje.id, personaje.nombre, 'hp', Math.max(0, personaje.hp - 5))}
                  className="hud-label px-3 py-1 bg-black/40 border border-stone-800 text-red-500 text-xs rounded-sm cursor-pointer hover:bg-red-950/20"
                >
                  -5 HP
                </button>
                <button
                  onClick={() => onStat(personaje.id, personaje.nombre, 'hp', Math.min(personaje.hp_max, personaje.hp + 5))}
                  className="hud-label px-3 py-1 bg-black/40 border border-stone-800 text-green-500 text-xs rounded-sm cursor-pointer hover:bg-green-950/20"
                >
                  +5 HP
                </button>
                <button
                  onClick={() => onStat(personaje.id, personaje.nombre, 'hp', personaje.hp_max)}
                  className="hud-label px-3 py-1 bg-black/40 border border-stone-800 text-stone-300 text-xs rounded-sm cursor-pointer hover:bg-stone-800"
                >
                  SANAR COMPLETO
                </button>
              </div>
            </div>

            {/* Radar de Atributos del DM */}
            <div className="p-4 stone-frame">
              <span className="font-heading text-xs font-bold text-stone-500 block mb-2">DIAGRAMA DE ATRIBUTOS</span>
              <div style={{ height: '220px' }}>
                <RadarChartDM stats={personaje.estadisticas} color={personaje.color_acento} />
              </div>
            </div>
          </div>
        )}

        {tab === 'condiciones' && (
          <div className="p-4 stone-frame">
            <span className="font-heading text-xs font-bold text-stone-500 block mb-4">CONDICIONES ACTIVAS</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(CONDICIONES_INFO).map(([condKey, info]) => {
                const activa = personaje.condiciones_activas.includes(condKey as CondicionEstado);
                return (
                  <button
                    key={condKey}
                    onClick={() => onToggleCondicion(personaje.id, personaje.nombre, condKey as CondicionEstado)}
                    className="p-2.5 rounded-sm border text-left cursor-pointer transition-all text-xs flex justify-between items-center"
                    style={{
                      background: activa ? `${info.color}15` : 'rgba(12,10,7,0.4)',
                      borderColor: activa ? info.color : '#2e2820',
                      color: activa ? info.color : '#7a6e60',
                    }}
                  >
                    <span>{info.nombre}</span>
                    {activa && <span className="font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'estados' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estado especial */}
            <div className="p-4 stone-frame space-y-4">
              <span className="font-heading text-xs font-bold text-[#b8a070] block">ESTADO ESPECIAL DE CAMPAÑA</span>
              <p className="text-xs text-stone-500 font-lore leading-relaxed">
                Activa o desactiva la transformación del jugador. Esto cambiará su retrato al modo &quot;En la Zona&quot; y modificará su lista de habilidades.
              </p>
              <button
                onClick={() => onToggleEstadoEspecial(personaje.id, personaje.nombre)}
                className="w-full py-3 rounded-sm font-heading font-bold text-xs tracking-wider transition-all cursor-pointer border"
                style={{
                  background: personaje.estado_especial ? `${personaje.color_acento}20` : 'transparent',
                  borderColor: personaje.estado_especial ? personaje.color_acento : '#2e2820',
                  color: personaje.estado_especial ? personaje.color_acento : '#5a4e40',
                }}
              >
                {personaje.nombre_estado_especial.toUpperCase()}: {personaje.estado_especial ? 'ACTIVADO (ON)' : 'DESACTIVADO (OFF)'}
              </button>
            </div>

            {/* Forzar retrato */}
            <div className="p-4 stone-frame space-y-4">
              <span className="font-heading text-xs font-bold text-stone-500 block">FORZAR RETRATO ESPECÍFICO</span>
              <p className="text-xs text-stone-500 font-lore leading-relaxed">
                Sobrescribe el cálculo automático de retratos para mostrar un estado determinado en la pantalla del jugador.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onForzarRetrato(personaje.id, personaje.nombre, null)}
                  className="px-2 py-1.5 rounded-sm border text-[10px] cursor-pointer hover:bg-stone-850"
                  style={{
                    borderColor: personaje.retrato_forzado === null ? '#7a5818' : '#2e2820',
                    color: personaje.retrato_forzado === null ? '#9a7020' : '#5a4e40',
                  }}
                >
                  AUTOMÁTICO
                </button>
                {(['base', 'herido', 'afectado', 'inconsciente', 'en_zona', 'shock'] as const).map(e => (
                  <button
                    key={e}
                    onClick={() => onForzarRetrato(personaje.id, personaje.nombre, e)}
                    className="px-2 py-1.5 rounded-sm border text-[10px] cursor-pointer hover:bg-stone-850"
                    style={{
                      borderColor: personaje.retrato_forzado === e ? '#7a5818' : '#2e2820',
                      color: personaje.retrato_forzado === e ? '#9a7020' : '#5a4e40',
                    }}
                  >
                    {e.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'lore' && (
          <div className="p-4 stone-frame space-y-4">
            <span className="font-heading text-xs font-bold text-stone-500 block">CRÓNICA & LORE</span>
            {personaje.historia ? (
              <p className="font-lore text-sm text-stone-400 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                {personaje.historia}
              </p>
            ) : (
              <p className="font-lore text-sm text-stone-600">Este personaje no posee historia escrita todavía.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
