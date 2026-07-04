'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { dbCrearPersonaje, subirRetrato, defaultPersonaje } from '@/lib/db';
import { AccionPersonaje, EstadisticasBase, RasgoPersonaje, HabilidadEntrada, formatModificador } from '@/types/character';
import {
  CLASES_PERSONAJE, RAZAS_PERSONAJE, COLORES_ACENTO, ALINEAMIENTOS,
  SUBCLASES_POR_CLASE, HABILIDADES_DND, ATRIBUTOS_BASE, TIPOS_DANIO,
} from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const PASOS = [
  { id: 1, titulo: 'IDENTIDAD', desc: 'Nombre, clase y raza' },
  { id: 2, titulo: 'COMBATE',   desc: 'HP, CA y bonificadores' },
  { id: 3, titulo: 'ATRIBUTOS', desc: 'Los 6 ability scores' },
  { id: 4, titulo: 'HABILIDADES', desc: 'Competencias y salvaciones' },
  { id: 5, titulo: 'ACCIONES',  desc: 'Ataques y habilidades' },
  { id: 6, titulo: 'RASGOS',    desc: 'Rasgos, equipo e idiomas' },
  { id: 7, titulo: 'RETRATOS',  desc: 'Imágenes para cada estado' },
  { id: 8, titulo: 'LORE',      desc: 'Historia y apariencia' },
];

const ESTADOS_RETRATO = [
  { key: 'base', label: 'ESTADO BASE', desc: 'Condición normal', color: '#76ff03' },
  { key: 'herido', label: 'HERIDO', desc: 'HP < 40%', color: '#ff1744' },
  { key: 'afectado', label: 'AFECTADO', desc: 'Condición grave', color: '#39ff14' },
  { key: 'inconsciente', label: 'INCONSCIENTE', desc: 'HP = 0', color: '#555' },
  { key: 'en_zona', label: 'EN LA ZONA', desc: 'Estado especial', color: '#ffffff' },
  { key: 'shock', label: 'SHOCK', desc: 'Backfire mágico', color: '#ff6d00' },
];

export default function CrearPersonajePage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [personajeId] = useState<string>(uuidv4);

  const def = defaultPersonaje();

  const [nombre, setNombre] = useState('');
  const [clase, setClase] = useState(def.clase);
  const [subclase, setSubclase] = useState('');
  const [raza, setRaza] = useState(def.raza);
  const [trasfondo, setTrasfondo] = useState('');
  const [alineamiento, setAlineamiento] = useState('');
  const [nivel, setNivel] = useState(1);
  const [colorAcento, setColorAcento] = useState(COLORES_ACENTO[0]);

  const [hpMax, setHpMax] = useState(10);
  const [ca, setCa] = useState(10);
  const [caEspecial, setCaEspecial] = useState<number | null>(null);
  const [velocidad, setVelocidad] = useState(30);
  const [iniciativa, setIniciativa] = useState(0);
  const [bonComp, setBonComp] = useState(2);
  const [bonAtk, setBonAtk] = useState(0);
  const [bonMag, setBonMag] = useState(0);
  const [dadoEspecial, setDadoEspecial] = useState('');
  const [nombreEstadoEspecial, setNombreEstadoEspecial] = useState('ESTADO ESPECIAL');

  const [stats, setStats] = useState<EstadisticasBase>({
    fuerza: 10, destreza: 10, constitucion: 10, inteligencia: 10, sabiduria: 10, carisma: 10,
  });
  const [ventajas, setVentajas] = useState('');
  const [desventajas, setDesventajas] = useState('');

  const [habilidades, setHabilidades] = useState<Record<string, HabilidadEntrada>>({});
  const [salvaciones, setSalvaciones] = useState<Record<string, number>>({});

  const [acciones, setAcciones] = useState<AccionPersonaje[]>([]);
  const [rasgos, setRasgos] = useState<RasgoPersonaje[]>([]);
  const [equipo, setEquipo] = useState('');
  const [idiomas, setIdiomas] = useState('');

  const [retratos, setRetratos] = useState<Partial<Record<string, string>>>({});
  const [cargandoRetrato, setCargandoRetrato] = useState<string | null>(null);

  const [historia, setHistoria] = useState('');
  const [apariencia, setApariencia] = useState('');
  const [personalidad, setPersonalidad] = useState('');

  const subclases = SUBCLASES_POR_CLASE[clase] ?? [];

  const puedeAvanzar = () => {
    if (paso === 1) return nombre.trim().length >= 2;
    if (paso === 2) return hpMax > 0;
    return true;
  };

  const handleSubirRetrato = async (estadoKey: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCargandoRetrato(estadoKey);
    try {
      const url = await subirRetrato(personajeId, estadoKey, file);
      setRetratos(prev => ({ ...prev, [estadoKey]: url }));
    } finally {
      setCargandoRetrato(null);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const nuevo = await dbCrearPersonaje({
        nombre: nombre.trim(),
        clase,
        subclase,
        raza,
        trasfondo,
        alineamiento,
        nivel,
        color_acento: colorAcento,
        hp: hpMax,
        hp_max: hpMax,
        ca,
        ca_especial: caEspecial,
        velocidad,
        iniciativa,
        bonificador_competencia: bonComp,
        bonificador_ataque: bonAtk,
        bonificador_magia: bonMag,
        dado_especial: dadoEspecial || null,
        estadisticas: stats,
        habilidades,
        salvaciones,
        condiciones_activas: [],
        retrato_forzado: null,
        estado_especial: false,
        nombre_estado_especial: nombreEstadoEspecial,
        retratos: retratos as Record<string, string>,
        ventajas: ventajas.split('\n').map(s => s.trim()).filter(Boolean),
        desventajas: desventajas.split('\n').map(s => s.trim()).filter(Boolean),
        rasgos: rasgos.filter(r => r.nombre.trim()),
        acciones: acciones.filter(a => a.nombre.trim()),
        equipo: equipo.split('\n').map(s => s.trim()).filter(Boolean),
        idiomas: idiomas.split('\n').map(s => s.trim()).filter(Boolean),
        historia: historia.trim(),
        apariencia: apariencia.trim(),
        personalidad: personalidad.trim(),
      }, personajeId);
      router.push(`/jugador/${nuevo.id}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-dungeon min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.95)' }}>
        <button onClick={() => router.push('/jugador')} className="flex items-center gap-2 hud-label hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: '#5a4e40' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver
        </button>
        <span className="font-heading text-lg font-bold" style={{ color: '#9a7020', letterSpacing: '0.1em' }}>
          FORJA DE PERSONAJE
        </span>
        <div className="hud-label" style={{ color: '#5a4e40' }}>
          PASO {paso} DE {PASOS.length}
        </div>
      </div>

      {/* Indicador de pasos */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.5)' }}>
        {PASOS.map(p => (
          <button
            key={p.id}
            onClick={() => p.id < paso && setPaso(p.id)}
            className="flex-1 py-3 px-2 text-center transition-all"
            style={{
              cursor: p.id <= paso ? 'pointer' : 'not-allowed',
              background: paso === p.id ? `${colorAcento}10` : 'transparent',
              borderBottom: `2px solid ${paso === p.id ? colorAcento : p.id < paso ? '#3d3028' : 'transparent'}`,
            }}
          >
            <div className="hud-label" style={{
              color: paso === p.id ? colorAcento : p.id < paso ? '#7a6e60' : '#3d3028',
              fontSize: '8px'
            }}>
              {p.titulo}
            </div>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-start justify-center py-10 px-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {/* PASO 1: IDENTIDAD */}
            {paso === 1 && (
              <div className="space-y-6">
                <Campo label="NOMBRE DEL PERSONAJE *">
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: La Masa" className="hud-input w-full px-4 py-3 rounded-sm text-lg" maxLength={50} autoFocus />
                </Campo>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="CLASE">
                    <input type="text" value={clase} onChange={e => setClase(e.target.value)}
                      list="cls-list" className="hud-input w-full px-3 py-3 rounded-sm" />
                    <datalist id="cls-list">
                      {CLASES_PERSONAJE.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </Campo>
                  <Campo label="SUBCLASE">
                    <input type="text" value={subclase} onChange={e => setSubclase(e.target.value)}
                      list="sub-list" placeholder="Ej: Ladrón, Eldritch Knight..."
                      className="hud-input w-full px-3 py-3 rounded-sm" />
                    <datalist id="sub-list">
                      {subclases.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </Campo>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="RAZA">
                    <input type="text" value={raza} onChange={e => setRaza(e.target.value)}
                      list="raz-list" className="hud-input w-full px-3 py-3 rounded-sm" />
                    <datalist id="raz-list">
                      {RAZAS_PERSONAJE.map(r => <option key={r} value={r} />)}
                    </datalist>
                  </Campo>
                  <Campo label="ALINEAMIENTO">
                    <select value={alineamiento} onChange={e => setAlineamiento(e.target.value)}
                      className="hud-select w-full px-3 py-3 rounded-sm">
                      <option value="">Sin definir</option>
                      {ALINEAMIENTOS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </Campo>
                </div>
                <Campo label="TRASFONDO">
                  <input type="text" value={trasfondo} onChange={e => setTrasfondo(e.target.value)}
                    placeholder="Ej: Coraya Alquímica, Criminal..."
                    className="hud-input w-full px-3 py-3 rounded-sm" />
                </Campo>
                <Campo label="NIVEL">
                  <div className="flex items-center gap-4">
                    <input type="range" min={1} max={20} value={nivel} onChange={e => setNivel(Number(e.target.value))} className="flex-1" />
                    <span className="font-heading text-2xl font-bold" style={{ color: colorAcento }}>{nivel}</span>
                  </div>
                </Campo>
                <Campo label="COLOR DE ACENTO">
                  <div className="flex flex-wrap gap-3">
                    {COLORES_ACENTO.map(c => (
                      <button key={c} onClick={() => setColorAcento(c)}
                        className="w-8 h-8 rounded-sm cursor-pointer transition-transform hover:scale-110"
                        style={{
                          background: c,
                          boxShadow: colorAcento === c ? `0 0 12px ${c}` : 'none',
                          border: colorAcento === c ? '2px solid white' : '2px solid transparent',
                        }} />
                    ))}
                    <input type="color" value={colorAcento} onChange={e => setColorAcento(e.target.value)}
                      className="w-8 h-8 rounded-sm cursor-pointer" />
                  </div>
                </Campo>
              </div>
            )}

            {/* PASO 2: COMBATE */}
            {paso === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <CampoNum label="PUNTOS DE GOLPE (HP)" value={hpMax} onChange={setHpMax} color="#8b2020" min={1} />
                  <CampoNum label="CLASE DE ARMADURA (CA)" value={ca} onChange={setCa} color="#7a5818" min={1} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <CampoNum label="VELOCIDAD (pies)" value={velocidad} onChange={setVelocidad} color="#3a4870" step={5} />
                  <CampoNum label="INICIATIVA" value={iniciativa} onChange={setIniciativa} color="#344020" />
                  <CampoNum label="BON. COMPETENCIA" value={bonComp} onChange={setBonComp} color="#7a5818" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CampoNum label="BON. ATAQUE" value={bonAtk} onChange={setBonAtk} color="#6b1818" />
                  <CampoNum label="BON. MAGIA" value={bonMag} onChange={setBonMag} color="#3a4870" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="CA EN ESTADO ESPECIAL (opcional)">
                    <input type="number" value={caEspecial ?? ''}
                      onChange={e => setCaEspecial(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Ej: 16"
                      className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center" style={{ color: '#7a5818' }} />
                  </Campo>
                  <Campo label="DADO ESPECIAL (opcional)">
                    <input type="text" value={dadoEspecial} onChange={e => setDadoEspecial(e.target.value)}
                      placeholder="Ej: 2d6 (ataque furtivo)"
                      className="hud-input w-full px-3 py-3 rounded-sm" />
                  </Campo>
                </div>
                <Campo label="NOMBRE DEL ESTADO ESPECIAL">
                  <input type="text" value={nombreEstadoEspecial} onChange={e => setNombreEstadoEspecial(e.target.value)}
                    placeholder="Ej: ESTADO ENOJADO, ECO ARCANO..."
                    className="hud-input w-full px-3 py-3 rounded-sm" />
                </Campo>
              </div>
            )}

            {/* PASO 3: ATRIBUTOS */}
            {paso === 3 && (
              <div className="space-y-6">
                <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                  Los 6 atributos base de D&D 5e. Valores entre 1 y 30.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {ATRIBUTOS_BASE.map(attr => {
                    const val = stats[attr.key as keyof EstadisticasBase];
                    const mod = formatModificador(val);
                    return (
                      <div key={attr.key} className="p-4 rounded-sm"
                        style={{ background: `${attr.color}08`, border: `1px solid ${attr.color}30` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="hud-label" style={{ color: attr.color }}>{attr.label.toUpperCase()}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-xl font-bold" style={{ color: attr.color }}>{val}</span>
                            <span className="font-heading text-sm" style={{ color: `${attr.color}99` }}>({mod})</span>
                          </div>
                        </div>
                        <input type="range" min={1} max={30} value={val}
                          onChange={e => setStats(prev => ({ ...prev, [attr.key]: Number(e.target.value) }))}
                          className="w-full" />
                        <input type="number" min={1} max={30} value={val}
                          onChange={e => setStats(prev => ({ ...prev, [attr.key]: Number(e.target.value) }))}
                          className="hud-input w-full px-2 py-1 mt-2 rounded-sm font-heading text-center"
                          style={{ color: attr.color, fontSize: '14px' }} />
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="VENTAJAS (una por línea)">
                    <textarea value={ventajas} onChange={e => setVentajas(e.target.value)}
                      placeholder="Ej: Resistencia al veneno" className="hud-input w-full px-3 py-2 rounded-sm resize-none" rows={4} />
                  </Campo>
                  <Campo label="DESVENTAJAS (una por línea)">
                    <textarea value={desventajas} onChange={e => setDesventajas(e.target.value)}
                      placeholder="Ej: Miedo a la oscuridad" className="hud-input w-full px-3 py-2 rounded-sm resize-none" rows={4} />
                  </Campo>
                </div>
              </div>
            )}

            {/* PASO 4: HABILIDADES */}
            {paso === 4 && (
              <div className="space-y-4">
                <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                  Marca las habilidades competentes. Ajusta el bonificador y marca como Experto si aplica.
                </p>
                {HABILIDADES_DND.map(hab => {
                  const activa = !!habilidades[hab.nombre];
                  const entrada = habilidades[hab.nombre];
                  return (
                    <div key={hab.nombre} className="flex items-center gap-3 p-2 rounded-sm"
                      style={{
                        background: activa ? `${colorAcento}08` : 'transparent',
                        border: `1px solid ${activa ? `${colorAcento}40` : '#2e2820'}`,
                      }}>
                      <button onClick={() => {
                        const h = { ...habilidades };
                        if (h[hab.nombre]) delete h[hab.nombre];
                        else h[hab.nombre] = { bonus: 0, experto: false };
                        setHabilidades(h);
                      }}
                        className="w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer"
                        style={{
                          background: activa ? colorAcento : 'transparent',
                          border: `1px solid ${activa ? colorAcento : '#5a4e40'}`,
                          color: '#fff', fontSize: '10px',
                        }}>
                        {activa ? '✓' : ''}
                      </button>
                      <span className="font-lore text-sm flex-1" style={{ color: activa ? '#b8a070' : '#5a4e40' }}>
                        {hab.nombre}
                      </span>
                      <span className="hud-label" style={{ color: '#5a4e40', fontSize: '8px' }}>({hab.atributo})</span>
                      {activa && (
                        <>
                          <input type="number" value={entrada?.bonus ?? 0}
                            onChange={e => setHabilidades(prev => ({
                              ...prev, [hab.nombre]: { ...prev[hab.nombre], bonus: Number(e.target.value) }
                            }))}
                            className="hud-input w-14 px-1 py-1 rounded-sm font-heading text-center"
                            style={{ color: colorAcento, fontSize: '12px' }} />
                          <button onClick={() => setHabilidades(prev => ({
                            ...prev, [hab.nombre]: { ...prev[hab.nombre], experto: !prev[hab.nombre].experto }
                          }))}
                            className="px-2 py-1 rounded-sm hud-label cursor-pointer"
                            style={{
                              background: entrada?.experto ? `${colorAcento}20` : 'transparent',
                              border: `1px solid ${entrada?.experto ? colorAcento : '#3d3028'}`,
                              color: entrada?.experto ? colorAcento : '#5a4e40',
                              fontSize: '8px',
                            }}>
                            EXP
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}

                <div className="mt-6">
                  <p className="hud-label mb-3" style={{ color: '#7a6e60' }}>SALVACIONES</p>
                  <div className="grid grid-cols-3 gap-3">
                    {ATRIBUTOS_BASE.map(attr => {
                      const tiene = salvaciones[attr.label] !== undefined;
                      return (
                        <div key={attr.key} className="flex items-center gap-2 p-2 rounded-sm"
                          style={{ border: `1px solid ${tiene ? `${attr.color}60` : '#2e2820'}` }}>
                          <button onClick={() => {
                            const n = { ...salvaciones };
                            if (tiene) delete n[attr.label]; else n[attr.label] = 0;
                            setSalvaciones(n);
                          }}
                            className="w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer"
                            style={{
                              background: tiene ? attr.color : 'transparent',
                              border: `1px solid ${tiene ? attr.color : '#5a4e40'}`,
                              color: '#fff', fontSize: '8px',
                            }}>
                            {tiene ? '✓' : ''}
                          </button>
                          <span className="hud-label flex-1" style={{ color: tiene ? attr.color : '#5a4e40', fontSize: '9px' }}>
                            {attr.abr}
                          </span>
                          {tiene && (
                            <input type="number" value={salvaciones[attr.label] ?? 0}
                              onChange={e => setSalvaciones(prev => ({ ...prev, [attr.label]: Number(e.target.value) }))}
                              className="hud-input w-12 px-1 py-0.5 rounded-sm font-heading text-center"
                              style={{ color: attr.color, fontSize: '11px' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 5: ACCIONES */}
            {paso === 5 && (
              <div className="space-y-4">
                <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                  Añade ataques, hechizos y habilidades. Marca en qué estado están disponibles.
                </p>
                {acciones.map((accion, i) => (
                  <AccionEditor key={accion.id} accion={accion} index={i} colorAcento={colorAcento}
                    onChange={(id, campo, val) => setAcciones(prev => prev.map(a => a.id === id ? { ...a, [campo]: val } : a))}
                    onDelete={id => setAcciones(prev => prev.filter(a => a.id !== id))} />
                ))}
                <button onClick={() => setAcciones(prev => [...prev, {
                  id: uuidv4(), nombre: '', descripcion: '', tipo: 'ataque', icono: 'Sword',
                  estado: 'normal', tirada_impactar: '', alcance: '5 pies', danio: '', tipo_danio: '', cooldown: '',
                }])}
                  className="w-full py-3 rounded-sm cursor-pointer transition-all"
                  style={{ background: `${colorAcento}06`, border: `1px dashed ${colorAcento}40`, color: colorAcento, fontFamily: 'Cinzel, serif', fontSize: '12px' }}>
                  + AGREGAR ACCIÓN
                </button>
              </div>
            )}

            {/* PASO 6: RASGOS */}
            {paso === 6 && (
              <div className="space-y-4">
                <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                  Rasgos raciales, de clase, únicos, etc.
                </p>
                {rasgos.map((rasgo, i) => (
                  <div key={rasgo.id} className="p-4 rounded-sm" style={{ background: 'rgba(12,10,7,0.8)', border: '1px solid #2e2820' }}>
                    <div className="flex justify-between mb-3">
                      <span className="hud-label" style={{ color: colorAcento }}>RASGO {i + 1}</span>
                      <button onClick={() => setRasgos(prev => prev.filter(r => r.id !== rasgo.id))}
                        className="hud-label cursor-pointer hover:opacity-70" style={{ color: '#8b2020' }}>✕</button>
                    </div>
                    <input type="text" value={rasgo.nombre}
                      onChange={e => setRasgos(prev => prev.map(r => r.id === rasgo.id ? { ...r, nombre: e.target.value } : r))}
                      placeholder="Nombre del rasgo" className="hud-input w-full px-3 py-2 rounded-sm text-sm mb-2" />
                    <textarea value={rasgo.descripcion}
                      onChange={e => setRasgos(prev => prev.map(r => r.id === rasgo.id ? { ...r, descripcion: e.target.value } : r))}
                      placeholder="Descripción" className="hud-input w-full px-3 py-2 rounded-sm text-sm resize-none" rows={3} />
                  </div>
                ))}
                <button onClick={() => setRasgos(prev => [...prev, { id: uuidv4(), nombre: '', descripcion: '' }])}
                  className="w-full py-3 rounded-sm cursor-pointer transition-all"
                  style={{ background: `${colorAcento}06`, border: `1px dashed ${colorAcento}40`, color: colorAcento, fontFamily: 'Cinzel, serif', fontSize: '12px' }}>
                  + AGREGAR RASGO
                </button>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Campo label="EQUIPO (uno por línea)">
                    <textarea value={equipo} onChange={e => setEquipo(e.target.value)}
                      placeholder="Espada larga&#10;Escudo&#10;Cota de mallas"
                      className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm" rows={6} />
                  </Campo>
                  <Campo label="IDIOMAS (uno por línea)">
                    <textarea value={idiomas} onChange={e => setIdiomas(e.target.value)}
                      placeholder="Común&#10;Élfico"
                      className="hud-input w-full px-3 py-2 rounded-sm resize-none text-sm" rows={6} />
                  </Campo>
                </div>
              </div>
            )}

            {/* PASO 7: RETRATOS */}
            {paso === 7 && (
              <div className="space-y-4">
                <p className="font-lore text-sm" style={{ color: '#7a6e60' }}>
                  Sube imágenes para cada estado. Mínimo el retrato base.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {ESTADOS_RETRATO.map(estado => (
                    <div key={estado.key} className="rounded-sm overflow-hidden" style={{ border: `1px solid ${estado.color}30` }}>
                      <div className="relative h-40" style={{ background: 'rgba(12,10,7,0.8)' }}>
                        {retratos[estado.key] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={retratos[estado.key]} alt={estado.label} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
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
                      <label className="block p-2 cursor-pointer hover:opacity-80 transition-opacity" style={{ background: `${estado.color}08` }}>
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleSubirRetrato(estado.key, f); }} className="hidden" />
                        <div className="hud-label" style={{ color: estado.color, fontSize: '9px' }}>{estado.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#5a4e40' }}>{estado.desc}</div>
                        <div className="mt-2 hud-label text-center py-1 rounded-sm"
                          style={{ background: `${estado.color}10`, border: `1px solid ${estado.color}30`, color: estado.color, fontSize: '9px' }}>
                          {retratos[estado.key] ? 'CAMBIAR' : 'SUBIR'}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 8: LORE */}
            {paso === 8 && (
              <div className="space-y-6">
                <Campo label="HISTORIA DEL PERSONAJE">
                  <textarea value={historia} onChange={e => setHistoria(e.target.value)}
                    placeholder="¿Cuáles son sus orígenes? ¿Qué le trajo aquí?"
                    className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box" rows={8}
                    style={{ fontFamily: 'Crimson Pro, serif', fontSize: '14px', color: '#b8a070' }} />
                </Campo>
                <Campo label="DESCRIPCIÓN FÍSICA">
                  <textarea value={apariencia} onChange={e => setApariencia(e.target.value)}
                    placeholder="¿Cómo luce tu personaje?"
                    className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box" rows={5}
                    style={{ fontFamily: 'Crimson Pro, serif', fontSize: '14px', color: '#b8a070' }} />
                </Campo>
                <Campo label="PERSONALIDAD / IDEALES / VÍNCULOS / DEFECTOS">
                  <textarea value={personalidad} onChange={e => setPersonalidad(e.target.value)}
                    placeholder="Ideales, vínculos, defectos..."
                    className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box" rows={5}
                    style={{ fontFamily: 'Crimson Pro, serif', fontSize: '14px', color: '#b8a070' }} />
                </Campo>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegación */}
      <div className="sticky bottom-0 border-t flex items-center justify-between px-6 py-4"
        style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.95)' }}>
        <button onClick={() => setPaso(p => p - 1)} disabled={paso === 1}
          className="btn-primary px-6 py-3 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed">
          ← ANTERIOR
        </button>
        <div className="flex gap-2">
          {PASOS.map(p => (
            <div key={p.id} className="w-2 h-2 rounded-full transition-all"
              style={{
                background: paso === p.id ? colorAcento : paso > p.id ? '#5a4e40' : '#2e2820',
                boxShadow: paso === p.id ? `0 0 6px ${colorAcento}` : 'none',
              }} />
          ))}
        </div>
        {paso < PASOS.length ? (
          <button onClick={() => setPaso(p => p + 1)} disabled={!puedeAvanzar()}
            className="btn-primary px-6 py-3 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed">
            SIGUIENTE →
          </button>
        ) : (
          <button onClick={handleGuardar} disabled={guardando || !nombre.trim()}
            className="btn-success px-8 py-3 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed">
            {guardando ? 'CREANDO...' : '✓ CREAR PERSONAJE'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══ COMPONENTES AUXILIARES ═══ */

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="hud-label block mb-2" style={{ color: '#7a6e60' }}>{label}</label>
      {children}
    </div>
  );
}

function CampoNum({ label, value, onChange, color, min, step }: {
  label: string; value: number; onChange: (v: number) => void; color: string; min?: number; step?: number;
}) {
  return (
    <div className="p-4 rounded-sm" style={{ background: `${color}08`, border: `1px solid ${color}30` }}>
      <span className="hud-label block mb-2" style={{ color }}>{label}</span>
      <input type="number" value={value} min={min} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="hud-input w-full px-3 py-3 rounded-sm font-heading text-center"
        style={{ color, fontSize: '20px' }} />
    </div>
  );
}

function AccionEditor({ accion, index, colorAcento, onChange, onDelete }: {
  accion: AccionPersonaje; index: number; colorAcento: string;
  onChange: (id: string, campo: string, valor: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 rounded-sm" style={{ background: 'rgba(12,10,7,0.8)', border: '1px solid #2e2820' }}>
      <div className="flex justify-between mb-3">
        <span className="hud-label" style={{ color: colorAcento }}>ACCIÓN {index + 1}</span>
        <button onClick={() => onDelete(accion.id)} className="hud-label cursor-pointer hover:opacity-70" style={{ color: '#8b2020' }}>✕</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="col-span-2">
          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>NOMBRE</label>
          <input type="text" value={accion.nombre} onChange={e => onChange(accion.id, 'nombre', e.target.value)}
            placeholder="Ej: Espadazo" className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
        </div>
        <div>
          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>ESTADO</label>
          <select value={accion.estado} onChange={e => onChange(accion.id, 'estado', e.target.value)}
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
          <input type="text" value={accion.tirada_impactar ?? ''} onChange={e => onChange(accion.id, 'tirada_impactar', e.target.value)}
            placeholder="+6" className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
        </div>
        <div>
          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>ALCANCE</label>
          <input type="text" value={accion.alcance ?? ''} onChange={e => onChange(accion.id, 'alcance', e.target.value)}
            placeholder="5 pies" className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
        </div>
        <div>
          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>TIPO</label>
          <select value={accion.tipo} onChange={e => onChange(accion.id, 'tipo', e.target.value)}
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
          <input type="text" value={accion.danio ?? ''} onChange={e => onChange(accion.id, 'danio', e.target.value)}
            placeholder="2d6+3" className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
        </div>
        <div>
          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>TIPO DAÑO</label>
          <input type="text" value={accion.tipo_danio ?? ''} onChange={e => onChange(accion.id, 'tipo_danio', e.target.value)}
            list="td-list" placeholder="cortante" className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
          <datalist id="td-list">{TIPOS_DANIO.map(t => <option key={t} value={t} />)}</datalist>
        </div>
        <div>
          <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>COOLDOWN</label>
          <input type="text" value={accion.cooldown ?? ''} onChange={e => onChange(accion.id, 'cooldown', e.target.value)}
            placeholder="1/turno" className="hud-input w-full px-2 py-2 rounded-sm text-sm" />
        </div>
      </div>
      <div>
        <label className="hud-label block mb-1" style={{ color: '#7a6e60', fontSize: '9px' }}>DESCRIPCIÓN</label>
        <textarea value={accion.descripcion} onChange={e => onChange(accion.id, 'descripcion', e.target.value)}
          placeholder="Efecto de la acción" className="hud-input w-full px-3 py-2 rounded-sm text-sm resize-none" rows={2} />
      </div>
    </div>
  );
}
