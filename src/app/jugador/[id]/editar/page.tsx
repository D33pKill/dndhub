'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonaje } from '@/hooks/usePersonajes';
import { subirRetrato, dbEliminarPersonaje } from '@/lib/db';
import { AccionPersonaje, EstadisticasBase } from '@/types/character';
import { CLASES_PERSONAJE, RAZAS_PERSONAJE, COLORES_ACENTO } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const ESTADOS_RETRATO = [
  { key: 'base', label: 'ESTADO BASE', desc: 'Normal (HP > 40%)', color: '#76ff03' },
  { key: 'herido', label: 'HERIDO', desc: 'HP < 40%', color: '#ff1744' },
  { key: 'afectado', label: 'AFECTADO', desc: 'Condición grave activa', color: '#39ff14' },
  { key: 'inconsciente', label: 'INCONSCIENTE', desc: 'HP = 0', color: '#555' },
  { key: 'en_zona', label: 'EN LA ZONA', desc: 'Destello Negro', color: '#ffffff' },
  { key: 'shock', label: 'SHOCK / FALLO', desc: 'Backfire mágico', color: '#ff6d00' },
];

export default function EditarPersonajePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { personaje, actualizar } = usePersonaje(id);

  const [tab, setTab] = useState<'identidad' | 'vitales' | 'stats' | 'acciones' | 'retratos' | 'lore'>('identidad');
  const [guardando, setGuardando] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [cargandoRetrato, setCargandoRetrato] = useState<string | null>(null);

  if (!personaje) {
    return (
      <div className="bg-hud min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-hud text-lg mb-4" style={{ color: '#ff1744' }}>PERSONAJE NO ENCONTRADO</p>
          <button onClick={() => router.push('/jugador')} className="btn-primary px-6 py-3 rounded-sm">VOLVER</button>
        </div>
      </div>
    );
  }

  const handleSubirRetrato = async (estadoKey: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCargandoRetrato(estadoKey);
    try {
      const url = await subirRetrato(personaje.id, estadoKey, file);
      actualizar({ retratos: { ...personaje.retratos, [estadoKey]: url } });
    } finally {
      setCargandoRetrato(null);
    }
  };

  const handleEliminarRetrato = (estadoKey: string) => {
    const nuevoRetratos = { ...personaje.retratos };
    delete nuevoRetratos[estadoKey as keyof typeof nuevoRetratos];
    actualizar({ retratos: nuevoRetratos });
  };

  const handleAgregarAccion = () => {
    const nuevaAccion: AccionPersonaje = { id: uuidv4(), nombre: '', descripcion: '', tipo: 'ataque', icono: 'Sword' };
    actualizar({ acciones: [...(personaje.acciones ?? []), nuevaAccion] });
  };

  const handleActualizarAccion = (accionId: string, campo: keyof AccionPersonaje, valor: string) => {
    actualizar({
      acciones: personaje.acciones.map(a => a.id === accionId ? { ...a, [campo]: valor } : a)
    });
  };

  const handleEliminarAccion = (accionId: string) => {
    actualizar({ acciones: personaje.acciones.filter(a => a.id !== accionId) });
  };

  const handleEliminarPersonaje = () => {
    dbEliminarPersonaje(id);
    router.push('/jugador');
  };

  const TABS = [
    { id: 'identidad', label: 'IDENTIDAD' },
    { id: 'vitales', label: 'VITALES' },
    { id: 'stats', label: 'ESTADÍSTICAS' },
    { id: 'acciones', label: 'ACCIONES' },
    { id: 'retratos', label: 'RETRATOS' },
    { id: 'lore', label: 'LORE' },
  ] as const;

  return (
    <div className="bg-hud min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#2a3548', background: 'rgba(13,17,23,0.95)' }}>
        <button onClick={() => router.push(`/jugador/${id}`)}
          className="flex items-center gap-2 hud-label hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: '#4a607d' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver al HUD
        </button>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: personaje.color_acento }} />
          <span className="font-heading text-lg font-bold" style={{ color: personaje.color_acento }}>
            EDITAR: {personaje.nombre.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => setConfirmEliminar(true)}
          className="btn-danger px-4 py-2 rounded-sm text-xs"
        >
          🗑 ELIMINAR
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#2a3548', background: 'rgba(13,17,23,0.5)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-shrink-0 px-4 py-3 hud-label transition-all cursor-pointer"
            style={{
              background: tab === t.id ? 'rgba(255,23,68,0.08)' : 'transparent',
              borderBottom: `2px solid ${tab === t.id ? '#ff1744' : 'transparent'}`,
              color: tab === t.id ? '#ff1744' : '#4a607d',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* IDENTIDAD */}
              {tab === 'identidad' && (
                <>
                  <Campo label="NOMBRE" required>
                    <input type="text" value={personaje.nombre} maxLength={50}
                      onChange={e => actualizar({ nombre: e.target.value })}
                      className="hud-input w-full px-4 py-3 rounded-sm text-lg" />
                  </Campo>
                  <div className="grid grid-cols-2 gap-4">
                    <Campo label="CLASE">
                      <input type="text" value={personaje.clase}
                        onChange={e => actualizar({ clase: e.target.value })}
                        list="clases-list"
                        className="hud-input w-full px-3 py-3 rounded-sm" />
                      <datalist id="clases-list">
                        {CLASES_PERSONAJE.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </Campo>
                    <Campo label="RAZA">
                      <input type="text" value={personaje.raza}
                        onChange={e => actualizar({ raza: e.target.value })}
                        list="razas-list"
                        className="hud-input w-full px-3 py-3 rounded-sm" />
                      <datalist id="razas-list">
                        {RAZAS_PERSONAJE.map(r => <option key={r} value={r} />)}
                      </datalist>
                    </Campo>
                  </div>
                  <Campo label="NIVEL">
                    <div className="flex items-center gap-4">
                      <input type="range" min={1} max={20} value={personaje.nivel}
                        onChange={e => actualizar({ nivel: Number(e.target.value) })}
                        className="flex-1" />
                      <span className="font-hud text-2xl font-bold" style={{ color: '#ff1744' }}>{personaje.nivel}</span>
                    </div>
                  </Campo>
                  <Campo label="COLOR DE ACENTO">
                    <div className="flex flex-wrap gap-3 items-center">
                      {COLORES_ACENTO.map(c => (
                        <button key={c} onClick={() => actualizar({ color_acento: c })}
                          className="w-8 h-8 rounded-sm cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            background: c,
                            border: personaje.color_acento === c ? '2px solid white' : '2px solid transparent',
                            boxShadow: personaje.color_acento === c ? `0 0 12px ${c}` : 'none',
                          }} />
                      ))}
                      <input type="color" value={personaje.color_acento}
                        onChange={e => actualizar({ color_acento: e.target.value })}
                        className="w-8 h-8 rounded-sm cursor-pointer" />
                    </div>
                  </Campo>
                </>
              )}

              {/* VITALES */}
              {tab === 'vitales' && (
                <>
                  {[
                    { label: 'SALUD (HP)', actual: 'hp', max: 'hp_max', color: '#ff1744' },
                    { label: 'MAGIA (MANA)', actual: 'mana', max: 'mana_max', color: '#00b0ff' },
                    { label: 'ESTAMINA', actual: 'estamina', max: 'estamina_max', color: '#76ff03' },
                  ].map(v => (
                    <div key={v.label} className="p-4 rounded-sm"
                      style={{ background: 'rgba(13,17,23,0.8)', border: `1px solid ${v.color}30` }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="hud-label" style={{ color: v.color }}>{v.label}</span>
                        <span className="font-hud text-xl font-bold" style={{ color: v.color }}>
                          {personaje[v.actual as 'hp']}/{personaje[v.max as 'hp_max']}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#4a607d', fontSize: '9px' }}>ACTUAL</label>
                          <input type="number" value={personaje[v.actual as 'hp']} min={0}
                            max={personaje[v.max as 'hp_max']}
                            onChange={e => actualizar({ [v.actual]: Number(e.target.value) })}
                            className="hud-input w-full px-3 py-2 rounded-sm font-hud text-center"
                            style={{ color: v.color }} />
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#4a607d', fontSize: '9px' }}>MÁXIMO</label>
                          <input type="number" value={personaje[v.max as 'hp_max']} min={1}
                            onChange={e => actualizar({ [v.max]: Number(e.target.value) })}
                            className="hud-input w-full px-3 py-2 rounded-sm font-hud text-center"
                            style={{ color: '#8fa8c8' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ESTADÍSTICAS */}
              {tab === 'stats' && (
                <>
                  {(Object.keys(personaje.estadisticas) as (keyof EstadisticasBase)[]).map(stat => (
                    <div key={stat}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="hud-label" style={{ color: '#8fa8c8' }}>{stat}</label>
                        <span className="font-hud text-lg font-bold" style={{ color: personaje.color_acento }}>
                          {personaje.estadisticas[stat]}
                        </span>
                      </div>
                      <input type="range" min={0} max={100} value={personaje.estadisticas[stat]}
                        onChange={e => actualizar({ estadisticas: { ...personaje.estadisticas, [stat]: Number(e.target.value) } })}
                        className="w-full" />
                      <div className="glow-bar-track h-2 mt-1">
                        <div className="glow-bar-fill h-full" style={{
                          width: `${personaje.estadisticas[stat]}%`,
                          background: personaje.color_acento,
                          boxShadow: `0 0 6px ${personaje.color_acento}`,
                        }} />
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Campo label="VENTAJAS (una por línea)">
                      <textarea
                        value={personaje.ventajas.join('\n')}
                        onChange={e => actualizar({ ventajas: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm"
                        rows={4}
                      />
                    </Campo>
                    <Campo label="DESVENTAJAS (una por línea)">
                      <textarea
                        value={personaje.desventajas.join('\n')}
                        onChange={e => actualizar({ desventajas: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm"
                        rows={4}
                      />
                    </Campo>
                  </div>
                </>
              )}

              {/* ACCIONES */}
              {tab === 'acciones' && (
                <>
                  {(personaje.acciones ?? []).map((accion, i) => (
                    <div key={accion.id} className="p-4 rounded-sm" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #2a3548' }}>
                      <div className="flex justify-between mb-3">
                        <span className="hud-label" style={{ color: personaje.color_acento }}>ACCIÓN {i + 1}</span>
                        <button onClick={() => handleEliminarAccion(accion.id)}
                          className="hud-label cursor-pointer hover:opacity-70" style={{ color: '#ff1744' }}>✕</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>NOMBRE</label>
                          <input type="text" value={accion.nombre}
                            onChange={e => handleActualizarAccion(accion.id, 'nombre', e.target.value)}
                            className="hud-input w-full px-3 py-2 rounded-sm text-sm" />
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>TIPO</label>
                          <select value={accion.tipo}
                            onChange={e => handleActualizarAccion(accion.id, 'tipo', e.target.value)}
                            className="hud-select w-full px-3 py-2 rounded-sm text-sm">
                            <option value="ataque">Ataque</option>
                            <option value="magia">Magia</option>
                            <option value="reaccion">Reacción</option>
                            <option value="habilidad">Habilidad</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>DAÑO</label>
                          <input type="text" value={accion.danio ?? ''}
                            onChange={e => handleActualizarAccion(accion.id, 'danio', e.target.value)}
                            placeholder="Ej: 2d6+3"
                            className="hud-input w-full px-3 py-2 rounded-sm text-sm" />
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>COOLDOWN</label>
                          <input type="text" value={accion.cooldown ?? ''}
                            onChange={e => handleActualizarAccion(accion.id, 'cooldown', e.target.value)}
                            placeholder="Ej: 1 turno"
                            className="hud-input w-full px-3 py-2 rounded-sm text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>DESCRIPCIÓN</label>
                        <textarea value={accion.descripcion}
                          onChange={e => handleActualizarAccion(accion.id, 'descripcion', e.target.value)}
                          className="hud-input w-full px-3 py-2 rounded-sm text-sm resize-none"
                          rows={2} />
                      </div>
                    </div>
                  ))}
                  {(personaje.acciones ?? []).length < 6 && (
                    <button onClick={handleAgregarAccion}
                      className="w-full py-3 rounded-sm cursor-pointer transition-all"
                      style={{ background: 'rgba(0,229,255,0.03)', border: '1px dashed rgba(0,229,255,0.3)', color: '#00e5ff', fontFamily: 'Orbitron, monospace', fontSize: '12px' }}>
                      + AGREGAR ACCIÓN
                    </button>
                  )}
                </>
              )}

              {/* RETRATOS */}
              {tab === 'retratos' && (
                <div className="grid grid-cols-2 gap-4">
                  {ESTADOS_RETRATO.map(estado => (
                    <div key={estado.key} className="rounded-sm overflow-hidden"
                      style={{ border: `1px solid ${estado.color}30` }}>
                      <div className="relative h-40" style={{ background: 'rgba(13,17,23,0.8)' }}>
                        {personaje.retratos[estado.key as keyof typeof personaje.retratos] ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={personaje.retratos[estado.key as keyof typeof personaje.retratos]!}
                              alt={estado.label}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleEliminarRetrato(estado.key)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-sm flex items-center justify-center cursor-pointer"
                              style={{ background: 'rgba(255,23,68,0.8)', color: '#fff', fontSize: '12px' }}
                            >✕</button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                            {cargandoRetrato === estado.key ? (
                              <div className="animate-spin w-8 h-8 border-2 rounded-full"
                                style={{ borderColor: `${estado.color}40`, borderTopColor: estado.color }} />
                            ) : (
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={estado.color} strokeWidth="1" opacity={0.3}>
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      <label className="block p-2 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: `${estado.color}08` }}>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleSubirRetrato(estado.key, f); }} />
                        <div className="hud-label" style={{ color: estado.color, fontSize: '9px' }}>{estado.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#4a607d' }}>{estado.desc}</div>
                        <div className="mt-2 text-center hud-label py-1 rounded-sm"
                          style={{ background: `${estado.color}10`, border: `1px solid ${estado.color}30`, color: estado.color, fontSize: '9px' }}>
                          {personaje.retratos[estado.key as keyof typeof personaje.retratos] ? 'CAMBIAR' : 'SUBIR'}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* LORE */}
              {tab === 'lore' && (
                <>
                  <Campo label="HISTORIA DEL PERSONAJE">
                    <textarea value={personaje.historia}
                      onChange={e => actualizar({ historia: e.target.value })}
                      className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box"
                      rows={8}
                      style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#b8a070' }}
                      placeholder="¿Cuáles son sus orígenes y motivaciones?" />
                  </Campo>
                  <Campo label="DESCRIPCIÓN FÍSICA">
                    <textarea value={personaje.apariencia}
                      onChange={e => actualizar({ apariencia: e.target.value })}
                      className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box"
                      rows={5}
                      style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#b8a070' }}
                      placeholder="Describe su aspecto físico y vestimenta" />
                  </Campo>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modal confirmar eliminar */}
      <AnimatePresence>
        {confirmEliminar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="p-8 rounded-sm text-center"
              style={{ background: 'rgba(13,17,23,0.98)', border: '1px solid #ff1744', maxWidth: '360px' }}
            >
              <p className="font-heading text-xl mb-2" style={{ color: '#ff1744' }}>¿ELIMINAR PERSONAJE?</p>
              <p className="text-sm mb-6" style={{ color: '#7a8a9a' }}>
                Esta acción eliminará permanentemente a <strong style={{ color: '#fff' }}>{personaje.nombre}</strong> y todos sus datos. No se puede deshacer.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmEliminar(false)}
                  className="btn-primary px-6 py-2 rounded-sm">CANCELAR</button>
                <button onClick={handleEliminarPersonaje}
                  className="btn-danger px-6 py-2 rounded-sm">SÍ, ELIMINAR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Campo({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>
        {label}{required && <span style={{ color: '#ff1744' }}> *</span>}
      </label>
      {children}
    </div>
  );
}
