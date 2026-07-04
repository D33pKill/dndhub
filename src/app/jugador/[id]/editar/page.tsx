'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonaje } from '@/hooks/usePersonajes';
import { subirRetrato, dbEliminarPersonaje } from '@/lib/db';
import { AccionPersonaje, EstadisticasBase, RasgoPersonaje, HabilidadEntrada, calcularModificador, formatModificador } from '@/types/character';
import {
  CLASES_PERSONAJE, RAZAS_PERSONAJE, COLORES_ACENTO, ALINEAMIENTOS,
  SUBCLASES_POR_CLASE, HABILIDADES_DND, ATRIBUTOS_BASE, TIPOS_DANIO,
} from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const ESTADOS_RETRATO = [
  { key: 'base', label: 'ESTADO BASE', desc: 'Condición normal, HP > 40%', color: '#76ff03' },
  { key: 'herido', label: 'HERIDO', desc: 'HP por debajo del 40%', color: '#ff1744' },
  { key: 'afectado', label: 'AFECTADO', desc: 'Bajo condición grave', color: '#39ff14' },
  { key: 'inconsciente', label: 'INCONSCIENTE', desc: 'HP = 0', color: '#555' },
  { key: 'en_zona', label: 'EN LA ZONA', desc: 'Estado especial activado', color: '#ffffff' },
  { key: 'shock', label: 'SHOCK / FALLO', desc: 'Backfire mágico', color: '#ff6d00' },
];

export default function EditarPersonajePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { personaje, actualizar } = usePersonaje(id);

  const [tab, setTab] = useState<'identidad' | 'combate' | 'stats' | 'habilidades' | 'acciones' | 'rasgos' | 'retratos' | 'lore'>('identidad');
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [cargandoRetrato, setCargandoRetrato] = useState<string | null>(null);

  if (!personaje) {
    return (
      <div className="bg-dungeon min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-lg mb-4" style={{ color: '#6b1818', letterSpacing: '0.1em' }}>PERSONAJE NO ENCONTRADO</p>
          <button onClick={() => router.push('/jugador')} className="btn-primary px-6 py-3">VOLVER</button>
        </div>
      </div>
    );
  }

  const subclases = SUBCLASES_POR_CLASE[personaje.clase] ?? [];

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
    const nuevaAccion: AccionPersonaje = {
      id: uuidv4(), nombre: '', descripcion: '', tipo: 'ataque', icono: 'Sword',
      estado: 'normal', tirada_impactar: '', alcance: '5 pies', danio: '', tipo_danio: '', cooldown: '',
    };
    actualizar({ acciones: [...(personaje.acciones ?? []), nuevaAccion] });
  };

  const handleActualizarAccion = (accionId: string, campo: string, valor: string) => {
    actualizar({
      acciones: personaje.acciones.map(a => a.id === accionId ? { ...a, [campo]: valor } : a)
    });
  };

  const handleAgregarRasgo = () => {
    const nuevo: RasgoPersonaje = { id: uuidv4(), nombre: '', descripcion: '' };
    actualizar({ rasgos: [...(personaje.rasgos ?? []), nuevo] });
  };

  const handleActualizarRasgo = (rasgoId: string, campo: string, valor: string) => {
    actualizar({
      rasgos: personaje.rasgos.map(r => r.id === rasgoId ? { ...r, [campo]: valor } : r)
    });
  };

  const handleToggleHabilidad = (nombre: string) => {
    const habs = { ...personaje.habilidades };
    if (habs[nombre]) {
      delete habs[nombre];
    } else {
      habs[nombre] = { bonus: 0, experto: false };
    }
    actualizar({ habilidades: habs });
  };

  const handleHabilidadBonus = (nombre: string, bonus: number) => {
    const habs = { ...personaje.habilidades };
    if (habs[nombre]) {
      habs[nombre] = { ...habs[nombre], bonus };
    }
    actualizar({ habilidades: habs });
  };

  const handleHabilidadExperto = (nombre: string) => {
    const habs = { ...personaje.habilidades };
    if (habs[nombre]) {
      habs[nombre] = { ...habs[nombre], experto: !habs[nombre].experto };
    }
    actualizar({ habilidades: habs });
  };

  const handleEliminarPersonaje = () => {
    dbEliminarPersonaje(id);
    router.push('/jugador');
  };

  const TABS = [
    { id: 'identidad',   label: 'IDENTIDAD' },
    { id: 'combate',     label: 'COMBATE' },
    { id: 'stats',       label: 'ATRIBUTOS' },
    { id: 'habilidades', label: 'HABILIDADES' },
    { id: 'acciones',    label: 'ACCIONES' },
    { id: 'rasgos',      label: 'RASGOS' },
    { id: 'retratos',    label: 'RETRATOS' },
    { id: 'lore',        label: 'LORE' },
  ] as const;

  return (
    <div className="bg-dungeon min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.95)' }}>
        <button onClick={() => router.push(`/jugador/${id}`)}
          className="flex items-center gap-2 hud-label hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: '#5a4e40' }}>
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
        <button onClick={() => setConfirmEliminar(true)} className="btn-danger px-4 py-2 rounded-sm text-xs">
          🗑 ELIMINAR
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.5)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-shrink-0 px-4 py-3 hud-label transition-all cursor-pointer"
            style={{
              background: tab === t.id ? `${personaje.color_acento}12` : 'transparent',
              borderBottom: `2px solid ${tab === t.id ? personaje.color_acento : 'transparent'}`,
              color: tab === t.id ? personaje.color_acento : '#5a4e40',
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
              {/* ═══ IDENTIDAD ═══ */}
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
                    <Campo label="SUBCLASE">
                      <input type="text" value={personaje.subclase}
                        onChange={e => actualizar({ subclase: e.target.value })}
                        list="subclases-list"
                        className="hud-input w-full px-3 py-3 rounded-sm" />
                      <datalist id="subclases-list">
                        {subclases.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </Campo>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Campo label="RAZA">
                      <input type="text" value={personaje.raza}
                        onChange={e => actualizar({ raza: e.target.value })}
                        list="razas-list"
                        className="hud-input w-full px-3 py-3 rounded-sm" />
                      <datalist id="razas-list">
                        {RAZAS_PERSONAJE.map(r => <option key={r} value={r} />)}
                      </datalist>
                    </Campo>
                    <Campo label="ALINEAMIENTO">
                      <select value={personaje.alineamiento}
                        onChange={e => actualizar({ alineamiento: e.target.value })}
                        className="hud-select w-full px-3 py-3 rounded-sm">
                        <option value="">Sin definir</option>
                        {ALINEAMIENTOS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </Campo>
                  </div>
                  <Campo label="TRASFONDO">
                    <input type="text" value={personaje.trasfondo}
                      onChange={e => actualizar({ trasfondo: e.target.value })}
                      placeholder="Ej: Noble, Criminal, Soldado..."
                      className="hud-input w-full px-3 py-3 rounded-sm" />
                  </Campo>
                  <Campo label="NIVEL">
                    <div className="flex items-center gap-4">
                      <input type="range" min={1} max={20} value={personaje.nivel}
                        onChange={e => actualizar({ nivel: Number(e.target.value) })}
                        className="flex-1" />
                      <span className="font-heading text-2xl font-bold" style={{ color: personaje.color_acento }}>{personaje.nivel}</span>
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

              {/* ═══ COMBATE ═══ */}
              {tab === 'combate' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Campo label="HP ACTUAL">
                      <input type="number" value={personaje.hp} min={0} max={personaje.hp_max}
                        onChange={e => actualizar({ hp: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#8b2020', fontSize: '18px' }} />
                    </Campo>
                    <Campo label="HP MÁXIMO">
                      <input type="number" value={personaje.hp_max} min={1}
                        onChange={e => actualizar({ hp_max: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#8fa8c8', fontSize: '18px' }} />
                    </Campo>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Campo label="CLASE DE ARMADURA">
                      <input type="number" value={personaje.ca} min={1}
                        onChange={e => actualizar({ ca: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#7a5818', fontSize: '18px' }} />
                    </Campo>
                    <Campo label="VELOCIDAD (pies)">
                      <input type="number" value={personaje.velocidad} min={0} step={5}
                        onChange={e => actualizar({ velocidad: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#3a4870', fontSize: '18px' }} />
                    </Campo>
                    <Campo label="INICIATIVA">
                      <input type="number" value={personaje.iniciativa}
                        onChange={e => actualizar({ iniciativa: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#344020', fontSize: '18px' }} />
                    </Campo>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Campo label="BON. COMPETENCIA">
                      <input type="number" value={personaje.bonificador_competencia}
                        onChange={e => actualizar({ bonificador_competencia: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#7a5818', fontSize: '18px' }} />
                    </Campo>
                    <Campo label="BON. ATAQUE">
                      <input type="number" value={personaje.bonificador_ataque}
                        onChange={e => actualizar({ bonificador_ataque: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#6b1818', fontSize: '18px' }} />
                    </Campo>
                    <Campo label="BON. MAGIA">
                      <input type="number" value={personaje.bonificador_magia}
                        onChange={e => actualizar({ bonificador_magia: Number(e.target.value) })}
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#3a4870', fontSize: '18px' }} />
                    </Campo>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Campo label="CA ESTADO ESPECIAL (opcional)">
                      <input type="number" value={personaje.ca_especial ?? ''}
                        onChange={e => actualizar({ ca_especial: e.target.value ? Number(e.target.value) : null })}
                        placeholder="Ej: 16"
                        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
                        style={{ color: '#7a5818' }} />
                    </Campo>
                    <Campo label="DADO ESPECIAL (opcional)">
                      <input type="text" value={personaje.dado_especial ?? ''}
                        onChange={e => actualizar({ dado_especial: e.target.value || null })}
                        placeholder="Ej: 2d6 (ataque furtivo)"
                        className="hud-input w-full px-3 py-3 rounded-sm" />
                    </Campo>
                  </div>
                  <Campo label="NOMBRE DEL ESTADO ESPECIAL">
                    <input type="text" value={personaje.nombre_estado_especial}
                      onChange={e => actualizar({ nombre_estado_especial: e.target.value })}
                      placeholder="Ej: ESTADO ENOJADO, ECO ARCANO..."
                      className="hud-input w-full px-3 py-3 rounded-sm" />
                  </Campo>
                </>
              )}

              {/* ═══ ATRIBUTOS ═══ */}
              {tab === 'stats' && (
                <>
                  <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                    Los 6 atributos base de D&D 5e. El modificador se calcula automáticamente.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {ATRIBUTOS_BASE.map(attr => {
                      const val = personaje.estadisticas[attr.key as keyof EstadisticasBase];
                      const mod = formatModificador(val);
                      return (
                        <div key={attr.key} className="p-4 rounded-sm"
                          style={{ background: `${attr.color}10`, border: `1px solid ${attr.color}40` }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="hud-label" style={{ color: attr.color }}>{attr.label.toUpperCase()}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-heading text-xl font-bold" style={{ color: attr.color }}>{val}</span>
                              <span className="font-heading text-sm" style={{ color: `${attr.color}99` }}>({mod})</span>
                            </div>
                          </div>
                          <input type="range" min={1} max={30} value={val}
                            onChange={e => actualizar({
                              estadisticas: { ...personaje.estadisticas, [attr.key]: Number(e.target.value) }
                            })}
                            className="w-full" />
                          <input type="number" min={1} max={30} value={val}
                            onChange={e => actualizar({
                              estadisticas: { ...personaje.estadisticas, [attr.key]: Number(e.target.value) }
                            })}
                            className="hud-input w-full px-2 py-1 mt-2 rounded-sm font-heading text-center"
                            style={{ color: attr.color, fontSize: '14px' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Campo label="VIRTUDES / VENTAJAS (una por línea)">
                      <textarea
                        value={personaje.ventajas.join('\n')}
                        onChange={e => actualizar({ ventajas: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm"
                        rows={4} />
                    </Campo>
                    <Campo label="MALDICIONES / DESVENTAJAS (una por línea)">
                      <textarea
                        value={personaje.desventajas.join('\n')}
                        onChange={e => actualizar({ desventajas: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm"
                        rows={4} />
                    </Campo>
                  </div>
                </>
              )}

              {/* ═══ HABILIDADES ═══ */}
              {tab === 'habilidades' && (
                <>
                  <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                    Marca las habilidades en las que tu personaje es competente. Ajusta el bonificador y marca como Experto si tiene doble competencia.
                  </p>
                  <div className="space-y-2">
                    {HABILIDADES_DND.map(hab => {
                      const activa = !!personaje.habilidades[hab.nombre];
                      const entrada = personaje.habilidades[hab.nombre];
                      return (
                        <div key={hab.nombre} className="flex items-center gap-3 p-2 rounded-sm"
                          style={{
                            background: activa ? `${personaje.color_acento}08` : 'transparent',
                            border: `1px solid ${activa ? `${personaje.color_acento}40` : '#2e2820'}`,
                          }}>
                          <button
                            onClick={() => handleToggleHabilidad(hab.nombre)}
                            className="w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer"
                            style={{
                              background: activa ? personaje.color_acento : 'transparent',
                              border: `1px solid ${activa ? personaje.color_acento : '#5a4e40'}`,
                              color: '#fff', fontSize: '10px',
                            }}>
                            {activa ? '✓' : ''}
                          </button>
                          <span className="font-lore text-sm flex-1" style={{ color: activa ? '#b8a070' : '#5a4e40' }}>
                            {hab.nombre}
                          </span>
                          <span className="hud-label flex-shrink-0" style={{ color: '#5a4e40', fontSize: '8px' }}>
                            ({hab.atributo})
                          </span>
                          {activa && (
                            <>
                              <input type="number" value={entrada?.bonus ?? 0}
                                onChange={e => handleHabilidadBonus(hab.nombre, Number(e.target.value))}
                                className="hud-input w-14 px-1 py-1 rounded-sm font-heading text-center"
                                style={{ color: personaje.color_acento, fontSize: '12px' }} />
                              <button
                                onClick={() => handleHabilidadExperto(hab.nombre)}
                                className="px-2 py-1 rounded-sm hud-label cursor-pointer"
                                style={{
                                  background: entrada?.experto ? `${personaje.color_acento}20` : 'transparent',
                                  border: `1px solid ${entrada?.experto ? personaje.color_acento : '#3d3028'}`,
                                  color: entrada?.experto ? personaje.color_acento : '#5a4e40',
                                  fontSize: '8px',
                                }}>
                                EXP
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Salvaciones */}
                  <div className="mt-6">
                    <p className="hud-label mb-3" style={{ color: '#7a6e60' }}>SALVACIONES COMPETENTES</p>
                    <div className="grid grid-cols-3 gap-3">
                      {ATRIBUTOS_BASE.map(attr => {
                        const tieneGuardado = personaje.salvaciones[attr.label] !== undefined;
                        return (
                          <div key={attr.key} className="flex items-center gap-2 p-2 rounded-sm"
                            style={{ border: `1px solid ${tieneGuardado ? `${attr.color}60` : '#2e2820'}` }}>
                            <button
                              onClick={() => {
                                const nuevas = { ...personaje.salvaciones };
                                if (tieneGuardado) { delete nuevas[attr.label]; }
                                else { nuevas[attr.label] = 0; }
                                actualizar({ salvaciones: nuevas });
                              }}
                              className="w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer"
                              style={{
                                background: tieneGuardado ? attr.color : 'transparent',
                                border: `1px solid ${tieneGuardado ? attr.color : '#5a4e40'}`,
                                color: '#fff', fontSize: '8px',
                              }}>
                              {tieneGuardado ? '✓' : ''}
                            </button>
                            <span className="hud-label flex-1" style={{ color: tieneGuardado ? attr.color : '#5a4e40', fontSize: '9px' }}>
                              {attr.abr}
                            </span>
                            {tieneGuardado && (
                              <input type="number" value={personaje.salvaciones[attr.label] ?? 0}
                                onChange={e => actualizar({
                                  salvaciones: { ...personaje.salvaciones, [attr.label]: Number(e.target.value) }
                                })}
                                className="hud-input w-12 px-1 py-0.5 rounded-sm font-heading text-center"
                                style={{ color: attr.color, fontSize: '11px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ═══ ACCIONES ═══ */}
              {tab === 'acciones' && (
                <>
                  {(personaje.acciones ?? []).map((accion, i) => (
                    <div key={accion.id} className="p-4 rounded-sm" style={{ background: 'rgba(12,10,7,0.8)', border: '1px solid #2e2820' }}>
                      <div className="flex justify-between mb-3">
                        <span className="hud-label" style={{ color: personaje.color_acento }}>ACCIÓN {i + 1}</span>
                        <button onClick={() => actualizar({ acciones: personaje.acciones.filter(a => a.id !== accion.id) })}
                          className="hud-label cursor-pointer hover:opacity-70" style={{ color: '#8b2020' }}>✕</button>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="col-span-2">
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>NOMBRE</label>
                          <input type="text" value={accion.nombre}
                            onChange={e => handleActualizarAccion(accion.id, 'nombre', e.target.value)}
                            className="hud-input w-full px-3 py-2 rounded-sm text-sm" />
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>ESTADO</label>
                          <select value={accion.estado}
                            onChange={e => handleActualizarAccion(accion.id, 'estado', e.target.value)}
                            className="hud-select w-full px-2 py-2 rounded-sm text-sm">
                            <option value="normal">Normal</option>
                            <option value="especial">Especial</option>
                            <option value="ambos">Ambos</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>TIRADA IMPACTAR</label>
                          <input type="text" value={accion.tirada_impactar ?? ''}
                            onChange={e => handleActualizarAccion(accion.id, 'tirada_impactar', e.target.value)}
                            placeholder="Ej: +6"
                            className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>ALCANCE</label>
                          <input type="text" value={accion.alcance ?? ''}
                            onChange={e => handleActualizarAccion(accion.id, 'alcance', e.target.value)}
                            placeholder="Ej: 5 pies"
                            className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>TIPO</label>
                          <select value={accion.tipo}
                            onChange={e => handleActualizarAccion(accion.id, 'tipo', e.target.value)}
                            className="hud-select w-full px-2 py-2 rounded-sm text-sm">
                            <option value="ataque">Ataque</option>
                            <option value="magia">Magia</option>
                            <option value="reaccion">Reacción</option>
                            <option value="habilidad">Habilidad</option>
                            <option value="bonus">Acción Bonus</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>DAÑO</label>
                          <input type="text" value={accion.danio ?? ''}
                            onChange={e => handleActualizarAccion(accion.id, 'danio', e.target.value)}
                            placeholder="Ej: 2d6+3"
                            className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>TIPO DAÑO</label>
                          <input type="text" value={accion.tipo_danio ?? ''}
                            onChange={e => handleActualizarAccion(accion.id, 'tipo_danio', e.target.value)}
                            list="tipos-danio-list"
                            placeholder="Ej: cortante"
                            className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
                          <datalist id="tipos-danio-list">
                            {TIPOS_DANIO.map(t => <option key={t} value={t} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>COOLDOWN</label>
                          <input type="text" value={accion.cooldown ?? ''}
                            onChange={e => handleActualizarAccion(accion.id, 'cooldown', e.target.value)}
                            placeholder="Ej: 1/turno"
                            className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>DESCRIPCIÓN / EFECTO</label>
                        <textarea value={accion.descripcion}
                          onChange={e => handleActualizarAccion(accion.id, 'descripcion', e.target.value)}
                          className="hud-input w-full px-3 py-2 rounded-sm text-sm resize-none" rows={2} />
                      </div>
                    </div>
                  ))}
                  <button onClick={handleAgregarAccion}
                    className="w-full py-3 rounded-sm cursor-pointer transition-all"
                    style={{ background: `${personaje.color_acento}06`, border: `1px dashed ${personaje.color_acento}40`, color: personaje.color_acento, fontFamily: 'Cinzel, serif', fontSize: '12px' }}>
                    + AGREGAR ACCIÓN
                  </button>
                </>
              )}

              {/* ═══ RASGOS ═══ */}
              {tab === 'rasgos' && (
                <>
                  <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                    Rasgos raciales, de clase, únicos. Ej: &quot;Eco Arcano&quot;, &quot;Experto del disfraz&quot;, etc.
                  </p>
                  {(personaje.rasgos ?? []).map((rasgo, i) => (
                    <div key={rasgo.id} className="p-4 rounded-sm" style={{ background: 'rgba(12,10,7,0.8)', border: '1px solid #2e2820' }}>
                      <div className="flex justify-between mb-3">
                        <span className="hud-label" style={{ color: personaje.color_acento }}>RASGO {i + 1}</span>
                        <button onClick={() => actualizar({ rasgos: personaje.rasgos.filter(r => r.id !== rasgo.id) })}
                          className="hud-label cursor-pointer hover:opacity-70" style={{ color: '#8b2020' }}>✕</button>
                      </div>
                      <Campo label="NOMBRE">
                        <input type="text" value={rasgo.nombre}
                          onChange={e => handleActualizarRasgo(rasgo.id, 'nombre', e.target.value)}
                          className="hud-input w-full px-3 py-2 rounded-sm text-sm" />
                      </Campo>
                      <Campo label="DESCRIPCIÓN">
                        <textarea value={rasgo.descripcion}
                          onChange={e => handleActualizarRasgo(rasgo.id, 'descripcion', e.target.value)}
                          className="hud-input w-full px-3 py-2 rounded-sm text-sm resize-none mt-2" rows={3} />
                      </Campo>
                    </div>
                  ))}
                  <button onClick={handleAgregarRasgo}
                    className="w-full py-3 rounded-sm cursor-pointer transition-all"
                    style={{ background: `${personaje.color_acento}06`, border: `1px dashed ${personaje.color_acento}40`, color: personaje.color_acento, fontFamily: 'Cinzel, serif', fontSize: '12px' }}>
                    + AGREGAR RASGO
                  </button>

                  {/* Equipo e Idiomas */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Campo label="EQUIPO (uno por línea)">
                      <textarea
                        value={personaje.equipo.join('\n')}
                        onChange={e => actualizar({ equipo: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm"
                        rows={6}
                        placeholder="Espada larga&#10;Escudo&#10;Cota de mallas" />
                    </Campo>
                    <Campo label="IDIOMAS (uno por línea)">
                      <textarea
                        value={personaje.idiomas.join('\n')}
                        onChange={e => actualizar({ idiomas: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm"
                        rows={6}
                        placeholder="Común&#10;Élfico" />
                    </Campo>
                  </div>
                </>
              )}

              {/* ═══ RETRATOS ═══ */}
              {tab === 'retratos' && (
                <div className="grid grid-cols-2 gap-4">
                  {ESTADOS_RETRATO.map(estado => (
                    <div key={estado.key} className="rounded-sm overflow-hidden"
                      style={{ border: `1px solid ${estado.color}30` }}>
                      <div className="relative h-40" style={{ background: 'rgba(12,10,7,0.8)' }}>
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
                              style={{ background: 'rgba(139,32,32,0.8)', color: '#fff', fontSize: '12px' }}
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
                        <div className="text-xs mt-0.5" style={{ color: '#5a4e40' }}>{estado.desc}</div>
                        <div className="mt-2 text-center hud-label py-1 rounded-sm"
                          style={{ background: `${estado.color}10`, border: `1px solid ${estado.color}30`, color: estado.color, fontSize: '9px' }}>
                          {personaje.retratos[estado.key as keyof typeof personaje.retratos] ? 'CAMBIAR' : 'SUBIR'}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══ LORE ═══ */}
              {tab === 'lore' && (
                <>
                  <Campo label="HISTORIA DEL PERSONAJE">
                    <textarea value={personaje.historia}
                      onChange={e => actualizar({ historia: e.target.value })}
                      className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box"
                      rows={8}
                      style={{ fontFamily: 'Crimson Pro, serif', fontSize: '14px', color: '#b8a070' }}
                      placeholder="¿Cuáles son sus orígenes y motivaciones?" />
                  </Campo>
                  <Campo label="DESCRIPCIÓN FÍSICA">
                    <textarea value={personaje.apariencia}
                      onChange={e => actualizar({ apariencia: e.target.value })}
                      className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box"
                      rows={5}
                      style={{ fontFamily: 'Crimson Pro, serif', fontSize: '14px', color: '#b8a070' }}
                      placeholder="Describe su aspecto físico y vestimenta" />
                  </Campo>
                  <Campo label="PERSONALIDAD / IDEALES / VÍNCULOS / DEFECTOS">
                    <textarea value={personaje.personalidad}
                      onChange={e => actualizar({ personalidad: e.target.value })}
                      className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box"
                      rows={5}
                      style={{ fontFamily: 'Crimson Pro, serif', fontSize: '14px', color: '#b8a070' }}
                      placeholder="Ideales, vínculos, defectos..." />
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
              className="p-8 rounded-sm text-center stone-frame"
              style={{ maxWidth: '360px' }}
            >
              <p className="font-heading text-xl mb-2" style={{ color: '#8b2020' }}>¿ELIMINAR PERSONAJE?</p>
              <p className="font-lore text-sm mb-6" style={{ color: '#7a6e60' }}>
                Esta acción eliminará permanentemente a <strong style={{ color: '#b8a070' }}>{personaje.nombre}</strong> y todos sus datos.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmEliminar(false)} className="btn-primary px-6 py-2 rounded-sm">CANCELAR</button>
                <button onClick={handleEliminarPersonaje} className="btn-danger px-6 py-2 rounded-sm">SÍ, ELIMINAR</button>
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
      <label className="hud-label block mb-2" style={{ color: '#7a6e60' }}>
        {label}{required && <span style={{ color: '#8b2020' }}> *</span>}
      </label>
      {children}
    </div>
  );
}
