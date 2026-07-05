'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePersonaje, usePersonajes } from '@/hooks/usePersonajes';
import { derivarEstadoRetrato, porcentajeVida, subirRetrato } from '@/lib/db';
import { EstadoRetrato, CondicionEstado, AccionPersonaje, RasgoPersonaje, EstadisticasBase, formatModificador } from '@/types/character';
import { CONDICIONES_INFO, ATRIBUTOS_BASE } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';

const RadarHUD = dynamic(() => import('@/components/hud/RadarHUD'), { ssr: false });

export default function JugadorHUDPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { personaje, actualizar } = usePersonaje(id);
  const { personajes: party } = usePersonajes();
  
  const [modalFotosOpen, setModalFotosOpen] = useState(false);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [chatSender, setChatSender] = useState<'pj' | 'ooc'>('pj');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes iniciales
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

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    cargarMensajes();

    if (supabase) {
      // Suscripción DB
      const dbChannel = supabase
        .channel('realtime-mensajes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, (payload) => {
          setMensajes(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        })
        .subscribe();

      // Suscripción Broadcast (fallback)
      const bcChannel = supabase
        .channel('mensajes-broadcast')
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

  // Hacer scroll automático al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  if (!personaje) {
    return (
      <div className="bg-dungeon min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-lg mb-4" style={{ color: '#6b1818', letterSpacing: '0.1em' }}>
            ALMA NO ENCONTRADA
          </p>
          <button onClick={() => router.push('/jugador')} className="btn-primary px-6 py-3">
            VOLVER
          </button>
        </div>
      </div>
    );
  }

  const estadoRetrato = derivarEstadoRetrato(personaje) as EstadoRetrato;
  const urlRetrato = personaje.retratos[estadoRetrato] ?? personaje.retratos.base ?? null;
  const hpPct = porcentajeVida(personaje.hp, personaje.hp_max);

  const accionesNormales  = personaje.acciones.filter(a => a.estado === 'normal' || a.estado === 'ambos');
  const accionesEspeciales = personaje.acciones.filter(a => a.estado === 'especial' || a.estado === 'ambos');

  const rasgoEspecial = personaje.rasgos.find(r => 
    r.nombre.toLowerCase().includes(personaje.nombre_estado_especial?.toLowerCase() || '') ||
    (personaje.nombre_estado_especial?.toLowerCase() || '').includes(r.nombre.toLowerCase())
  );

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    const senderName = chatSender === 'pj' ? personaje.nombre : `OOC (${personaje.nombre})`;
    const senderAvatar = chatSender === 'pj' ? urlRetrato : null;

    const msgId = uuidv4();
    const msg = {
      id: msgId,
      sender_name: senderName,
      sender_avatar: senderAvatar,
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
      // Fallback local y emitir por broadcast
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

  return (
    <div className="bg-dungeon min-h-screen flex flex-col relative overflow-hidden">
      {/* ── Overlays de estado ── */}
      <AnimatePresence>
        {estadoRetrato === 'herido' && personaje.hp > 0 && (
          <motion.div key="vignette-rojo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="vignette-red" />
        )}
        {estadoRetrato === 'afectado' && (
          <motion.div key="vignette-verde" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="vignette-green" />
        )}
        {estadoRetrato === 'en_zona' && (
          <motion.div key="zona-flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{ boxShadow: `inset 0 0 80px ${personaje.color_acento}40` }} />
        )}
        {estadoRetrato === 'shock' && (
          <motion.div key="shock-flash" initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0, 0.5, 0], transition: { repeat: Infinity, duration: 0.2 } }}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ background: 'rgba(139,32,32,0.12)' }} />
        )}
      </AnimatePresence>

      {/* ── Barra superior ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.95)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="connection-dot online" />
            <span className="hud-label" style={{ color: '#4a6030', fontSize: '9px' }}>ENLAZADO</span>
          </div>
          <div style={{ width: '1px', height: '12px', background: '#2e2820' }} />
          <span className="font-heading text-stone-300" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
            {personaje.nombre.toUpperCase()} · {personaje.clase.toUpperCase()} · NV.{personaje.nivel}
          </span>
          {personaje.subclase && (
            <span className="hud-label text-stone-500" style={{ fontSize: '9px' }}>
              ({personaje.subclase})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <EstadoBadge estado={estadoRetrato} />
          {personaje.estado_especial && (
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="font-heading px-2 py-0.5"
              style={{
                background: `${personaje.color_acento}18`,
                border: `1px solid ${personaje.color_acento}`,
                color: personaje.color_acento,
                fontSize: '9px',
                letterSpacing: '0.12em',
              }}
            >
              ⚡ {personaje.nombre_estado_especial}
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/jugador/${id}/editar`)}
            className="btn-primary px-3 py-1.5 text-xs font-heading">
            ✎ CONFIGURAR
          </button>
          <button onClick={() => router.push('/jugador')}
            className="hud-label px-3 py-1.5 cursor-pointer hover:opacity-60 transition-opacity font-heading"
            style={{ color: '#5a4e40', fontSize: '10px' }}>
            ← SALIR
          </button>
        </div>
      </div>

      {/* ── Cuerpo principal HUD ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ COLUMNA IZQUIERDA (Atributos, Datos, Radar) ═══ */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 p-4 border-r overflow-y-auto"
          style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.4)' }}>

          {/* Retrato */}
          <PortraitModule
            estadoRetrato={estadoRetrato}
            urlRetrato={urlRetrato}
            nombre={personaje.nombre}
            colorAcento={personaje.color_acento}
            estadoEspecial={personaje.estado_especial}
            onEditPhotos={() => setModalFotosOpen(true)}
          />

          {/* Información Básica */}
          <div className="p-3 stone-frame space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="font-heading text-stone-500">RAZA</span>
              <span className="font-lore text-stone-300 font-bold">{personaje.raza}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-heading text-stone-500">CLASE</span>
              <span className="font-lore text-stone-300 font-bold">{personaje.clase}</span>
            </div>
            {personaje.subclase && (
              <div className="flex justify-between">
                <span className="font-heading text-stone-500">SUBCLASE</span>
                <span className="font-lore text-stone-300 font-bold">{personaje.subclase}</span>
              </div>
            )}
            {personaje.trasfondo && (
              <div className="flex justify-between">
                <span className="font-heading text-stone-500">TRASFONDO</span>
                <span className="font-lore text-stone-450">{personaje.trasfondo}</span>
              </div>
            )}
          </div>

          {/* Atributos y Bonificadores */}
          <div className="p-3 stone-frame">
            <div className="grid grid-cols-2 gap-3">
              {/* Modificadores */}
              <div className="space-y-2 pr-2 border-r" style={{ borderColor: 'rgba(90,64,16,0.15)' }}>
                {ATRIBUTOS_BASE.map(attr => {
                  const val = personaje.estadisticas[attr.key as keyof EstadisticasBase];
                  const mod = formatModificador(val);
                  return (
                    <div key={attr.key} className="flex items-center justify-between text-xs">
                      <span className="font-heading text-[10px] tracking-wider text-stone-500">{attr.label}</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading font-bold text-stone-200">{val}</span>
                        <span className="font-heading text-[9px] text-stone-400 font-semibold">({mod})</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bonificadores */}
              <div className="pl-2 flex flex-col justify-between text-[11px] space-y-2">
                <div>
                  <span className="font-heading text-[8px] tracking-wider text-stone-500 block">BONIFICADOR DE ATAQUE</span>
                  <span className="font-heading text-base font-bold text-red-500">+{personaje.bonificador_ataque}</span>
                </div>
                
                <div className="border-t pt-1.5" style={{ borderColor: 'rgba(90,64,16,0.1)' }}>
                  <span className="font-heading text-[8px] tracking-wider text-stone-500 block">BONIFICADOR COMPETENCIA</span>
                  <span className="font-heading text-base font-bold text-stone-300">+{personaje.bonificador_competencia}</span>
                </div>

                <div className="border-t pt-1.5" style={{ borderColor: 'rgba(90,64,16,0.1)' }}>
                  <span className="font-heading text-[8px] tracking-wider text-stone-500 block">TIRADA PARA IMPACTAR</span>
                  <div className="space-y-0.5 mt-0.5">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-stone-300 font-bold">1d20 + {personaje.bonificador_ataque}</span>
                      <span className="text-stone-500">(Normal)</span>
                    </div>
                    {personaje.ca_especial && (
                      <div className="flex justify-between text-[9px] mt-0.5">
                        <span className="text-red-400 font-bold">1d20 + {personaje.bonificador_ataque + 2}</span>
                        <span className="text-red-500">({personaje.nombre_estado_especial ? personaje.nombre_estado_especial.split(' ')[1] || 'Especial' : 'Especial'})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Radar Chart (Reintroducido) */}
          <div className="stone-frame overflow-hidden flex-shrink-0" style={{ minHeight: '260px' }}>
            <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: '#1c1712' }}>
              <span className="font-heading text-[8px] tracking-widest text-stone-500">MAPA RADIAL DE VALORES</span>
            </div>
            <div style={{ height: '220px' }}>
              <RadarHUD stats={personaje.estadisticas} color={personaje.color_acento} />
            </div>
          </div>

          {/* Habilidades competentes */}
          {Object.keys(personaje.habilidades).length > 0 && (
            <div className="p-3 stone-frame space-y-1.5 flex-shrink-0">
              <p className="font-heading text-[8px] tracking-widest text-stone-500 border-b pb-1 mb-2" style={{ borderColor: 'rgba(90,64,16,0.1)' }}>
                HABILIDADES COMPETENTES
              </p>
              <div className="space-y-1">
                {Object.entries(personaje.habilidades)
                  .sort((a, b) => b[1].bonus - a[1].bonus)
                  .map(([habilidad, entrada]) => (
                    <div key={habilidad} className="flex items-center justify-between text-xs font-lore text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] text-stone-600">•</span>
                        <span>{habilidad}</span>
                      </div>
                      <span className="font-heading font-bold" style={{ color: personaje.color_acento }}>
                        {entrada.bonus >= 0 ? `+${entrada.bonus}` : `${entrada.bonus}`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ COLUMNA CENTRAL (HP/CA Shields y Tablas de Acciones) ═══ */}
        <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto min-w-0">

          {/* Escudos/Plaquetas de HP y CA */}
          <div className="flex justify-center gap-6 flex-shrink-0">
            <div className="relative w-28 h-20 bg-stone-950/90 border border-stone-900 rounded-b-xl flex flex-col items-center justify-center shadow-lg"
              style={{ borderTop: `3px solid #8b2020` }}>
              <span className="font-heading text-[9px] tracking-widest text-stone-500">HP MÁXIMO</span>
              <span className="font-heading text-2xl font-bold text-red-500 leading-none my-1">{personaje.hp}</span>
              <span className="text-[9px] text-stone-500">/ {personaje.hp_max} PV</span>
            </div>

            <div className="relative w-28 h-20 bg-stone-950/90 border border-stone-900 rounded-b-xl flex flex-col items-center justify-center shadow-lg"
              style={{ borderTop: `3px solid #7a5818` }}>
              <span className="font-heading text-[9px] tracking-widest text-stone-500">CA NORMAL</span>
              <span className="font-heading text-2xl font-bold text-gold leading-none my-1">{personaje.ca}</span>
              <span className="text-[8px] text-stone-500">ARMADURA</span>
            </div>

            {personaje.ca_especial && (
              <div className="relative w-28 h-20 bg-stone-950/90 border border-stone-900 rounded-b-xl flex flex-col items-center justify-center shadow-lg"
                style={{ borderTop: `3px solid #a62626` }}>
                <span className="font-heading text-[9px] tracking-widest text-red-400">
                  CA {personaje.nombre_estado_especial ? personaje.nombre_estado_especial.split(' ')[1] || 'ESPECIAL' : 'ESPECIAL'}
                </span>
                <span className="font-heading text-2xl font-bold text-red-500 leading-none my-1">{personaje.ca_especial}</span>
                <span className="text-[8px] text-stone-500">MODIFICADO</span>
              </div>
            )}
          </div>

          {/* Tablas de Habilidades/Acciones */}
          <div className="stone-frame p-5 space-y-6">
            
            {/* 1. NORMAL */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: 'rgba(90,64,16,0.2)' }}>
                <h3 className="font-heading text-xs font-bold tracking-widest text-[#b8a070] flex items-center gap-2">
                  <span>⚜</span> HABILIDADES - ESTADO NORMAL
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr className="border-b border-stone-800 text-[10px] uppercase tracking-wider text-stone-500 font-heading">
                      <th className="py-2.5 px-3 border border-stone-900/60">Habilidad</th>
                      <th className="py-2.5 px-3 text-center border border-stone-900/60">Tirada para Impactar</th>
                      <th className="py-2.5 px-3 text-center border border-stone-900/60">Alcance</th>
                      <th className="py-2.5 px-3 text-center border border-stone-900/60">Daño</th>
                      <th className="py-2.5 px-3 border border-stone-900/60">Efecto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900/40">
                    {accionesNormales.map(accion => (
                      <tr key={accion.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-heading text-stone-200 text-xs border border-stone-900/60">
                          <div className="flex items-center gap-3">
                            <ActionIcon name={accion.nombre} />
                            <span className="tracking-wide uppercase font-bold text-[11px]">{accion.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-heading font-black text-stone-300 text-xs border border-stone-900/60">
                          {formatTiradaImpactar(accion.tirada_impactar)}
                        </td>
                        <td className="py-3 px-3 text-center font-lore text-stone-400 text-xs border border-stone-900/60">
                          {accion.alcance || '—'}
                        </td>
                        <td className="py-3 px-3 text-center border border-stone-900/60">
                          {accion.danio ? (
                            <div className="font-heading text-xs">
                              <span className="font-bold text-stone-300">{accion.danio}</span>
                              {accion.tipo_danio && (
                                <span className="block text-[10px] text-stone-500 leading-tight lowercase">{accion.tipo_danio}</span>
                              )}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-3 font-lore text-stone-400 text-xs leading-relaxed border border-stone-900/60">
                          {accion.descripcion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. ESPECIAL */}
            {personaje.nombre_estado_especial && (
              <div className="pt-4 border-t border-stone-900/60">
                <div className="flex items-center justify-between mb-2 pb-2">
                  <h3 className="font-heading text-xs font-bold tracking-widest text-red-500 flex items-center gap-2">
                    <span>⚡</span> HABILIDADES - {personaje.nombre_estado_especial.toUpperCase()}
                  </h3>
                </div>
                
                {rasgoEspecial && (
                  <p className="text-xs italic text-stone-400 mb-4 bg-red-950/10 p-3 border border-red-900/25 rounded-sm leading-relaxed font-lore">
                    {rasgoEspecial.descripcion}
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" style={{ minWidth: '500px' }}>
                    <thead>
                      <tr className="border-b border-stone-800 text-[10px] uppercase tracking-wider text-stone-500 font-heading">
                        <th className="py-2.5 px-3 border border-stone-900/60">Habilidad</th>
                        <th className="py-2.5 px-3 text-center border border-stone-900/60">Tirada para Impactar</th>
                        <th className="py-2.5 px-3 text-center border border-stone-900/60">Alcance</th>
                        <th className="py-2.5 px-3 text-center border border-stone-900/60">Daño</th>
                        <th className="py-2.5 px-3 border border-stone-900/60">Efecto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900/40">
                      {accionesEspeciales.map(accion => (
                        <tr key={accion.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-heading text-stone-200 text-xs border border-stone-900/60">
                            <div className="flex items-center gap-3">
                              <ActionIcon name={accion.nombre} />
                              <span className="tracking-wide uppercase font-bold text-[11px]">{accion.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-heading font-black text-stone-300 text-xs border border-stone-900/60">
                            {formatTiradaImpactar(accion.tirada_impactar)}
                          </td>
                          <td className="py-3 px-3 text-center font-lore text-stone-400 text-xs border border-stone-900/60">
                            {accion.alcance || '—'}
                          </td>
                          <td className="py-3 px-3 text-center border border-stone-900/60">
                            {accion.danio ? (
                              <div className="font-heading text-xs">
                                <span className="font-bold text-stone-300">{accion.danio}</span>
                                {accion.tipo_danio && (
                                  <span className="block text-[10px] text-stone-500 leading-tight lowercase">{accion.tipo_danio}</span>
                                )}
                              </div>
                            ) : '—'}
                          </td>
                          <td className="py-3 px-3 font-lore text-stone-400 text-xs leading-relaxed border border-stone-900/60">
                            {accion.descripcion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Rasgos y Crónica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rasgos */}
            <div className="space-y-3">
              <span className="font-heading text-[10px] tracking-widest text-stone-500 block">RASGOS RACIALES / CLASE</span>
              {personaje.rasgos.map(rasgo => (
                <div key={rasgo.id} className="p-4 stone-frame flex gap-3.5 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900/60 border border-stone-900/60 flex items-center justify-center text-[#7a5818]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2v20M2 12h20M5.75 5.75l12.5 12.5M18.25 5.75L5.75 18.25"/>
                    </svg>
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-heading text-xs font-bold uppercase tracking-wide text-stone-300">
                      {rasgo.nombre}
                    </h4>
                    <p className="font-lore text-[12px] leading-relaxed text-stone-400">
                      {rasgo.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Equipo / Crónica */}
            <div className="space-y-4">
              <div className="p-4 stone-frame">
                <span className="font-heading text-[9px] tracking-widest text-stone-500 block mb-2">EQUIPO</span>
                <div className="space-y-1">
                  {personaje.equipo.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-stone-400 font-lore">
                      <span className="text-[#7a5818]">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {personaje.historia && (
                <div className="p-4 stone-frame">
                  <span className="font-heading text-[9px] tracking-widest text-[#7a5818] block mb-2">CRÓNICA</span>
                  <div className="lore-box text-[13px] leading-relaxed text-stone-400 overflow-y-auto" style={{ maxHeight: '180px' }}>
                    {personaje.historia}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ COLUMNA DERECHA (Lista de Grupo Online y Chat de Campaña) ═══ */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 p-4 border-l overflow-hidden"
          style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.45)' }}>
          
          {/* Lista de Grupo (Party list) */}
          <div className="flex flex-col flex-1 min-h-[220px] overflow-hidden">
            <span className="font-heading text-[9px] tracking-widest text-stone-500 block mb-2">GRUPO ONLINE (TIEMPO REAL)</span>
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {party.map(p => {
                const pEstado = derivarEstadoRetrato(p) as EstadoRetrato;
                const pUrl = p.retratos[pEstado] ?? p.retratos.base ?? null;
                const pPct = porcentajeVida(p.hp, p.hp_max);
                
                return (
                  <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-sm bg-black/30 border border-stone-900/60 hover:bg-black/50 transition-colors">
                    <div className="relative w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 border"
                      style={{ borderColor: p.estado_especial ? p.color_acento : '#2e2820' }}>
                      {pUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pUrl} alt={p.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-stone-900 flex items-center justify-center text-xs text-stone-600 font-heading">
                          {p.nombre[0]}
                        </div>
                      )}
                      {p.conectado && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#76ff03] rounded-full border border-black" title="Online" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-heading text-[10px] text-stone-200 truncate font-bold uppercase tracking-wider">{p.nombre}</span>
                        <span className="text-[8px] text-stone-500 font-semibold">{p.clase}</span>
                      </div>
                      
                      {/* Barra de Vida */}
                      <div className="w-full bg-stone-950 h-1.5 rounded-sm overflow-hidden mt-1 border border-stone-900">
                        <div className="h-full transition-all duration-300"
                          style={{
                            width: `${pPct}%`,
                            background: p.hp <= 0 ? '#333' : pPct < 40 ? '#8b2020' : '#384828',
                          }} />
                      </div>
                      
                      <div className="flex justify-between text-[8px] text-stone-500 mt-0.5">
                        <span>{p.hp}/{p.hp_max} PV</span>
                        <span className="font-heading text-[7px]"
                          style={{
                            color: p.hp <= 0 ? '#ff1744' : p.estado_especial ? p.color_acento : '#76ff03'
                          }}>
                          {p.hp <= 0 ? 'CAÍDO' : p.estado_especial ? (p.nombre_estado_especial ? p.nombre_estado_especial.split(' ')[0] || 'ESPECIAL' : 'ESPECIAL') : 'VIVO'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat de Campaña (Realtime) */}
          <div className="flex flex-col h-[320px] stone-frame bg-stone-950/60 overflow-hidden">
            <div className="p-2.5 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'rgba(90,64,16,0.15)' }}>
              <span className="font-heading text-[9px] tracking-widest text-[#b8a070]">CHAT DE CAMPAÑA</span>
              <select
                value={chatSender}
                onChange={e => setChatSender(e.target.value as any)}
                className="bg-stone-900 text-stone-400 font-heading text-[8px] tracking-wider border border-stone-800 rounded-sm px-1 py-0.5 cursor-pointer outline-none"
              >
                <option value="pj">{personaje.nombre.toUpperCase()}</option>
                <option value="ooc">FUERA DE ROL</option>
              </select>
            </div>

            {/* Log de Mensajes */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {mensajes.map((m, idx) => {
                const esPj = m.sender_name === personaje.nombre;
                const esDm = m.sender_name === 'DM' || m.sender_name === 'Narrador';
                
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
                          style={{ color: esDm ? '#9a7020' : esPj ? personaje.color_acento : '#7a6e60' }}>
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
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-stone-900 border border-stone-800 rounded-sm text-xs px-2 py-1.5 text-stone-200 placeholder-stone-600 outline-none"
              />
              <button
                onClick={enviarMensaje}
                className="px-2.5 py-1.5 rounded-sm font-heading text-[10px] text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 cursor-pointer"
              >
                ENVIAR
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de edición de fotos */}
      <AnimatePresence>
        {modalFotosOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-xl stone-frame overflow-hidden flex flex-col"
              style={{ maxHeight: '85vh', background: '#0e0b07' }}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(90,64,16,0.2)' }}>
                <span className="font-heading text-sm font-bold" style={{ color: personaje.color_acento, letterSpacing: '0.1em' }}>
                  GESTIONAR RETRATOS
                </span>
                <button
                  onClick={() => setModalFotosOpen(false)}
                  className="hud-label cursor-pointer hover:opacity-70 text-xs"
                  style={{ color: '#8b2020' }}
                >
                  CERRAR ✕
                </button>
              </div>

              {/* Lista de estados */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-xs" style={{ color: '#7a6e60' }}>
                  Sube imágenes específicas para cada estado del personaje. El estado base es obligatorio, los demás son opcionales (si no los subes, se usará la imagen base).
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'base', label: 'ESTADO BASE', desc: 'Normal, HP > 40%', color: '#76ff03' },
                    { key: 'herido', label: 'HERIDO', desc: 'HP por debajo del 40%', color: '#ff1744' },
                    { key: 'afectado', label: 'AFECTADO', desc: 'Condición grave', color: '#39ff14' },
                    { key: 'inconsciente', label: 'INCONSCIENTE', desc: 'HP = 0', color: '#555' },
                    { key: 'en_zona', label: personaje.nombre_estado_especial ? personaje.nombre_estado_especial.toUpperCase() : 'ESTADO ESPECIAL', desc: 'Estado especial activado', color: '#ffffff' },
                    { key: 'shock', label: 'SHOCK / FALLO', desc: 'Backfire mágico', color: '#ff6d00' },
                  ].map(estado => {
                    const urlImg = personaje.retratos[estado.key as keyof typeof personaje.retratos];
                    return (
                      <div key={estado.key} className="rounded-sm overflow-hidden flex flex-col" style={{ border: `1px solid ${estado.color}25`, background: 'rgba(6,4,2,0.6)' }}>
                        <div className="relative h-24 bg-black/40 flex items-center justify-center overflow-hidden">
                          {urlImg ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={urlImg} alt={estado.label} className="w-full h-full object-cover" />
                              <button
                                onClick={() => {
                                  const nuevosRetratos = { ...personaje.retratos };
                                  delete nuevosRetratos[estado.key as keyof typeof nuevosRetratos];
                                  actualizar({ retratos: nuevosRetratos });
                                }}
                                disabled={estado.key === 'base'}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-sm hover:bg-red-900/90 text-white text-[10px] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Eliminar retrato"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <div className="text-center opacity-35">
                              <svg className="mx-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={estado.color} strokeWidth="1">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                              </svg>
                              <span style={{ fontSize: '8px', color: estado.color }}>SIN RETRATO</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-2 flex flex-col flex-1">
                          <span className="font-heading font-bold" style={{ color: estado.color, fontSize: '9px', letterSpacing: '0.05em' }}>
                            {estado.label}
                          </span>
                          <span className="text-[10px] mb-2" style={{ color: '#5a4e40' }}>{estado.desc}</span>
                          
                          <label className="mt-auto block text-center hud-label py-1 rounded-sm cursor-pointer hover:opacity-85 transition-opacity"
                            style={{ background: `${estado.color}15`, border: `1px solid ${estado.color}40`, color: estado.color, fontSize: '9px' }}>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await subirRetrato(personaje.id, estado.key, file);
                                    actualizar({ retratos: { ...personaje.retratos, [estado.key]: url } });
                                  } catch (err) {
                                    console.error('Error al subir retrato:', err);
                                  }
                                }
                              }}
                            />
                            {urlImg ? 'CAMBIAR' : 'SUBIR'}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ PORTRAIT MODULE ═══ */
function PortraitModule({ estadoRetrato, urlRetrato, nombre, colorAcento, estadoEspecial, onEditPhotos }: {
  estadoRetrato: EstadoRetrato;
  urlRetrato: string | null;
  nombre: string;
  colorAcento: string;
  estadoEspecial: boolean;
  onEditPhotos: () => void;
}) {
  const isZona   = estadoRetrato === 'en_zona';
  const isShock  = estadoRetrato === 'shock';

  return (
    <motion.div
      key={estadoRetrato}
      animate={isShock ? { x: [0, -6, 6, -4, 4, -2, 2, 0], transition: { repeat: Infinity, duration: 0.35 } } : { x: 0 }}
      className="relative overflow-hidden w-full h-80 flex-shrink-0"
      style={{
        border: `1px solid ${estadoEspecial ? colorAcento : '#2e2820'}`,
        boxShadow: isZona
          ? `0 0 20px ${colorAcento}60, 0 0 40px ${colorAcento}30`
          : '0 4px 20px rgba(0,0,0,0.8)',
      }}
    >
      {urlRetrato ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlRetrato}
          alt={nombre}
          className={[
            'w-full h-full object-cover portrait-frame',
            `portrait-${estadoRetrato}`,
            estadoRetrato === 'inconsciente' ? 'portrait-inconsciente' : '',
          ].filter(Boolean).join(' ')}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center stone-frame"
          style={{ borderColor: 'transparent' }}>
          <span className="font-heading text-5xl font-black" style={{ color: '#5a4010', opacity: 0.5 }}>
            {nombre[0]}
          </span>
          <span className="font-heading text-xs mt-2" style={{ color: '#3d3028', letterSpacing: '0.2em' }}>
            SIN RETRATO
          </span>
        </div>
      )}

      {isZona && (
        <motion.div
          className="absolute inset-0 pointer-events-none lightning-border"
          style={{ border: `2px solid ${colorAcento}` }}
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 z-10 flex items-center justify-between"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)' }}>
        <EstadoBadge estado={estadoRetrato} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditPhotos();
          }}
          className="hud-label px-2.5 py-1 rounded-sm cursor-pointer text-[10px] hover:scale-105 transition-all"
          style={{
            background: 'rgba(12,10,7,0.9)',
            border: `1px solid ${colorAcento}a0`,
            color: colorAcento,
          }}
        >
          📷 RETRATOS
        </button>
      </div>
    </motion.div>
  );
}

/* ═══ ESTADO BADGE ═══ */
function EstadoBadge({ estado }: { estado: EstadoRetrato }) {
  const config: Record<EstadoRetrato, { label: string; color: string }> = {
    base:         { label: 'ESTABLE',       color: '#384828' },
    herido:       { label: 'HERIDO',        color: '#6b1818' },
    afectado:     { label: 'AFECTADO',      color: '#243018' },
    inconsciente: { label: 'INCONSCIENTE',  color: '#2e2820' },
    en_zona:      { label: '✦ EN LA ZONA',  color: '#7a5818' },
    shock:        { label: '⚠ SHOCK',       color: '#5a2810' },
  };
  const c = config[estado];
  return (
    <span className="font-heading px-2 py-0.5 inline-block"
      style={{
        background: `${c.color}20`,
        border: `1px solid ${c.color}`,
        color: c.color,
        fontSize: '8px',
        letterSpacing: '0.15em',
      }}>
      {c.label}
    </span>
  );
}

/* ═══ ACCION ICON MAPPER (SVGs de alta fidelidad) ═══ */
function ActionIcon({ name }: { name: string }) {
  const nm = name.toLowerCase();
  
  if (nm.includes('espadazo') || nm.includes('ataque') || nm.includes('daga') || nm.includes('cuchillo') || nm.includes('bastón') || nm.includes('arma')) {
    return (
      <svg className="w-5 h-5 text-red-700/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <path d="M4 20l2-2-1-1-1 1v2z"/>
        <path d="M19 5l-4 4 1.5 1.5 4-4L19 5z"/>
      </svg>
    );
  }
  
  if (nm.includes('golpe') || nm.includes('aplastamiento') || nm.includes('fuerza') || nm.includes('furia')) {
    return (
      <svg className="w-5 h-5 text-red-700/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 10V5a2 2 0 0 0-4 0v5"/>
        <path d="M8 10V7a2 2 0 0 0-4 0v6c0 5 4 9 9 9h3a6 6 0 0 0 6-6v-2a2 2 0 0 0-4 0v1"/>
        <path d="M16 11V9a2 2 0 0 0-4 0v2"/>
      </svg>
    );
  }
  
  if (nm.includes('embestida') || nm.includes('carga') || nm.includes('velocidad') || nm.includes('desplazar') || nm.includes('acción astuta')) {
    return (
      <svg className="w-5 h-5 text-red-700/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8h-4l-1-3h-4v2h2v4l-4 2-1 6h2l1-4h3l1 4h2l-1-7 2-4"/>
        <circle cx="15" cy="4" r="1"/>
      </svg>
    );
  }

  if (nm.includes('devastador') || nm.includes('muerte') || nm.includes('psíquico') || nm.includes('shock') || nm.includes('veneno')) {
    return (
      <svg className="w-5 h-5 text-red-700/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 10h.01M15 10h.01"/>
        <path d="M12 2a7 7 0 0 0-7 7c0 3 2.5 5 2.5 7h9c0-2 2.5-4 2.5-7a7 7 0 0 0-7-7z"/>
        <path d="M10 22h4v-2h-4v2z"/>
      </svg>
    );
  }
  
  if (nm.includes('defensa') || nm.includes('escudo') || nm.includes('resistencia') || nm.includes('historia antigua')) {
    return (
      <svg className="w-5 h-5 text-red-700/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5 text-red-700/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

/* Helper para formatear tirada de impacto */
function formatTiradaImpactar(val?: string) {
  if (!val) return '—';
  if (val.trim().startsWith('+') || val.trim().startsWith('-')) {
    return `1d20 ${val.trim()}`;
  }
  return val;
}
