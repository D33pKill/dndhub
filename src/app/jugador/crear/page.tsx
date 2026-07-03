'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { dbCrearPersonaje, subirRetrato } from '@/lib/db';
import { AccionPersonaje, EstadisticasBase } from '@/types/character';
import { CLASES_PERSONAJE, RAZAS_PERSONAJE, COLORES_ACENTO, ICONOS_ACCION } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const PASOS = [
  { id: 1, titulo: 'IDENTIDAD', desc: 'Nombre, clase y raza' },
  { id: 2, titulo: 'VITALES', desc: 'HP, Magia y Estamina' },
  { id: 3, titulo: 'ESTADÍSTICAS', desc: 'Atributos base del radar' },
  { id: 4, titulo: 'ACCIONES', desc: 'Habilidades y poderes' },
  { id: 5, titulo: 'RETRATOS', desc: 'Imágenes para cada estado' },
  { id: 6, titulo: 'LORE', desc: 'Historia y apariencia' },
];

const ESTADOS_RETRATO = [
  { key: 'base', label: 'ESTADO BASE', desc: 'Condición normal, HP > 40%', color: '#76ff03' },
  { key: 'herido', label: 'HERIDO', desc: 'HP por debajo del 40%', color: '#ff1744' },
  { key: 'afectado', label: 'AFECTADO', desc: 'Bajo condición grave (veneno, ceguera...)', color: '#39ff14' },
  { key: 'inconsciente', label: 'INCONSCIENTE', desc: 'HP = 0', color: '#555' },
  { key: 'en_zona', label: 'EN LA ZONA', desc: 'Destello Negro activado', color: '#ffffff' },
  { key: 'shock', label: 'SHOCK / FALLO', desc: 'Backfire mágico', color: '#ff6d00' },
];

export default function CrearPersonajePage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  // Pre-generar ID para que los retratos puedan subirse a Storage antes de crear el personaje
  const [personajeId] = useState<string>(uuidv4);

  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [clase, setClase] = useState(CLASES_PERSONAJE[0]);
  const [clasePersonalizada, setClasePersonalizada] = useState('');
  const [raza, setRaza] = useState(RAZAS_PERSONAJE[0]);
  const [razaPersonalizada, setRazaPersonalizada] = useState('');
  const [nivel, setNivel] = useState(1);
  const [colorAcento, setColorAcento] = useState(COLORES_ACENTO[0]);
  const [ventajas, setVentajas] = useState('');
  const [desventajas, setDesventajas] = useState('');

  const [hpMax, setHpMax] = useState(100);
  const [manaMax, setManaMax] = useState(100);
  const [estaminaMax, setEstaminaMax] = useState(100);

  const [stats, setStats] = useState<EstadisticasBase>({
    COMBATE: 50, VIGOR: 50, MOVILIDAD: 50, CARISMA: 50, INTELECTO: 50
  });

  const [acciones, setAcciones] = useState<AccionPersonaje[]>([]);
  const [retratos, setRetratos] = useState<Partial<Record<string, string>>>({});
  const [cargandoRetrato, setCargandoRetrato] = useState<string | null>(null);

  const [historia, setHistoria] = useState('');
  const [apariencia, setApariencia] = useState('');

  const puedeAvanzar = () => {
    if (paso === 1) return nombre.trim().length >= 2;
    if (paso === 2) return hpMax > 0 && manaMax > 0 && estaminaMax > 0;
    return true;
  };

  const handleSubirRetrato = async (estadoKey: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCargandoRetrato(estadoKey);
    try {
      // subirRetrato usa Supabase Storage si está configurado, si no convierte a base64
      const url = await subirRetrato(personajeId, estadoKey, file);
      setRetratos(prev => ({ ...prev, [estadoKey]: url }));
    } finally {
      setCargandoRetrato(null);
    }
  };

  const agregarAccion = () => {
    setAcciones(prev => [...prev, {
      id: uuidv4(),
      nombre: '',
      descripcion: '',
      tipo: 'ataque',
      icono: 'Sword',
      danio: '',
      cooldown: '',
    }]);
  };

  const actualizarAccion = (id: string, campo: keyof AccionPersonaje, valor: string) => {
    setAcciones(prev => prev.map(a => a.id === id ? { ...a, [campo]: valor } : a));
  };

  const eliminarAccion = (id: string) => {
    setAcciones(prev => prev.filter(a => a.id !== id));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const claseReal = clase === '__custom' ? clasePersonalizada : clase;
      const razaReal = raza === '__custom' ? razaPersonalizada : raza;

      // dbCrearPersonaje guarda en Supabase + localStorage
      const nuevo = await dbCrearPersonaje({
        nombre: nombre.trim(),
        clase: claseReal,
        raza: razaReal,
        nivel,
        color_acento: colorAcento,
        hp: hpMax,
        hp_max: hpMax,
        mana: manaMax,
        mana_max: manaMax,
        estamina: estaminaMax,
        estamina_max: estaminaMax,
        estadisticas: stats,
        condiciones_activas: [],
        retrato_forzado: null,
        destello_negro: false,
        fallo_magico: false,
        retratos: retratos as Record<string, string>,
        ventajas: ventajas.split('\n').map(s => s.trim()).filter(Boolean),
        desventajas: desventajas.split('\n').map(s => s.trim()).filter(Boolean),
        acciones: acciones.filter(a => a.nombre.trim()),
        historia: historia.trim(),
        apariencia: apariencia.trim(),
      }, personajeId);
      router.push(`/jugador/${nuevo.id}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-hud min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#2a3548', background: 'rgba(13,17,23,0.95)' }}>
        <button onClick={() => router.push('/jugador')} className="flex items-center gap-2 hud-label hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: '#4a607d' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver
        </button>
        <span className="font-heading text-lg font-bold" style={{ color: '#ff1744' }}>
          CREACIÓN DE PERSONAJE
        </span>
        <div className="hud-label" style={{ color: '#4a607d' }}>
          PASO {paso} DE {PASOS.length}
        </div>
      </div>

      {/* Indicador de pasos */}
      <div className="flex border-b" style={{ borderColor: '#2a3548', background: 'rgba(13,17,23,0.5)' }}>
        {PASOS.map(p => (
          <button
            key={p.id}
            onClick={() => p.id < paso && setPaso(p.id)}
            className="flex-1 py-3 px-2 text-center transition-all"
            style={{
              cursor: p.id <= paso ? 'pointer' : 'not-allowed',
              background: paso === p.id ? 'rgba(255,23,68,0.08)' : 'transparent',
              borderBottom: `2px solid ${paso === p.id ? '#ff1744' : p.id < paso ? '#2a3548' : 'transparent'}`,
            }}
          >
            <div className="hud-label" style={{
              color: paso === p.id ? '#ff1744' : p.id < paso ? '#8fa8c8' : '#3d5270',
              fontSize: '9px'
            }}>
              {p.titulo}
            </div>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-start justify-center py-10 px-4">
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
                <div>
                  <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>NOMBRE DEL PERSONAJE *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: Vorkan el Oscuro"
                    className="hud-input w-full px-4 py-3 rounded-sm text-lg"
                    maxLength={50}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>CLASE</label>
                    <select
                      value={clase}
                      onChange={e => setClase(e.target.value)}
                      className="hud-select w-full px-3 py-3 rounded-sm"
                    >
                      {CLASES_PERSONAJE.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__custom">Personalizada...</option>
                    </select>
                    {clase === '__custom' && (
                      <input type="text" value={clasePersonalizada}
                        onChange={e => setClasePersonalizada(e.target.value)}
                        placeholder="Nombre de la clase"
                        className="hud-input w-full px-3 py-2 rounded-sm mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>RAZA</label>
                    <select
                      value={raza}
                      onChange={e => setRaza(e.target.value)}
                      className="hud-select w-full px-3 py-3 rounded-sm"
                    >
                      {RAZAS_PERSONAJE.map(r => <option key={r} value={r}>{r}</option>)}
                      <option value="__custom">Personalizada...</option>
                    </select>
                    {raza === '__custom' && (
                      <input type="text" value={razaPersonalizada}
                        onChange={e => setRazaPersonalizada(e.target.value)}
                        placeholder="Nombre de la raza"
                        className="hud-input w-full px-3 py-2 rounded-sm mt-2" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>NIVEL</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min={1} max={20} value={nivel}
                      onChange={e => setNivel(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-hud text-2xl font-bold w-10 text-center" style={{ color: '#ff1744' }}>{nivel}</span>
                  </div>
                </div>

                <div>
                  <label className="hud-label block mb-3" style={{ color: '#8fa8c8' }}>COLOR DE ACENTO</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORES_ACENTO.map(c => (
                      <button
                        key={c}
                        onClick={() => setColorAcento(c)}
                        className="w-8 h-8 rounded-sm cursor-pointer transition-transform hover:scale-110"
                        style={{
                          background: c,
                          boxShadow: colorAcento === c ? `0 0 12px ${c}, 0 0 4px ${c}` : 'none',
                          border: colorAcento === c ? `2px solid white` : '2px solid transparent',
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={colorAcento}
                      onChange={e => setColorAcento(e.target.value)}
                      className="w-8 h-8 rounded-sm cursor-pointer"
                      title="Color personalizado"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: VITALES */}
            {paso === 2 && (
              <div className="space-y-8">
                <VitalCreator
                  label="SALUD MÁXIMA (HP)"
                  value={hpMax}
                  color="#ff1744"
                  onChange={setHpMax}
                  desc="Puntos de golpe máximos. Cuánto daño puede aguantar tu personaje."
                />
                <VitalCreator
                  label="MAGIA MÁXIMA (MANA)"
                  value={manaMax}
                  color="#00b0ff"
                  onChange={setManaMax}
                  desc="Reserva de energía mágica para lanzar hechizos."
                />
                <VitalCreator
                  label="ESTAMINA MÁXIMA"
                  value={estaminaMax}
                  color="#76ff03"
                  onChange={setEstaminaMax}
                  desc="Energía física para maniobras y ataques especiales."
                />
              </div>
            )}

            {/* PASO 3: ESTADÍSTICAS */}
            {paso === 3 && (
              <div className="space-y-6">
                <p className="font-sans text-sm" style={{ color: '#7a8a9a' }}>
                  Define los 5 atributos base que aparecerán en el radar del HUD. Valor de 0 a 100.
                </p>
                {(Object.keys(stats) as (keyof EstadisticasBase)[]).map(stat => (
                  <div key={stat}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="hud-label" style={{ color: '#8fa8c8' }}>{stat}</label>
                      <span className="font-hud text-lg font-bold" style={{ color: colorAcento }}>{stats[stat]}</span>
                    </div>
                    <input
                      type="range" min={0} max={100} value={stats[stat]}
                      onChange={e => setStats(prev => ({ ...prev, [stat]: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="glow-bar-track h-2 mt-1">
                      <div className="glow-bar-fill h-full"
                        style={{ width: `${stats[stat]}%`, background: colorAcento, boxShadow: `0 0 6px ${colorAcento}` }} />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>VENTAJAS (una por línea)</label>
                    <textarea
                      value={ventajas}
                      onChange={e => setVentajas(e.target.value)}
                      placeholder="Ej: Resistencia al veneno&#10;Visión en la oscuridad"
                      className="hud-input w-full px-3 py-2 rounded-sm resize-none"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>DESVENTAJAS (una por línea)</label>
                    <textarea
                      value={desventajas}
                      onChange={e => setDesventajas(e.target.value)}
                      placeholder="Ej: Alergia a la plata&#10;Miedo a la oscuridad"
                      className="hud-input w-full px-3 py-2 rounded-sm resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4: ACCIONES */}
            {paso === 4 && (
              <div className="space-y-4">
                <p className="font-sans text-sm" style={{ color: '#7a8a9a' }}>
                  Añade hasta 6 acciones personalizadas que aparecerán como cartas en tu HUD.
                </p>
                {acciones.map((accion, i) => (
                  <AccionEditor
                    key={accion.id}
                    accion={accion}
                    index={i}
                    colorAcento={colorAcento}
                    onChange={actualizarAccion}
                    onDelete={eliminarAccion}
                  />
                ))}
                {acciones.length < 6 && (
                  <button
                    onClick={agregarAccion}
                    className="w-full py-3 rounded-sm cursor-pointer transition-all"
                    style={{
                      background: 'rgba(0,229,255,0.03)',
                      border: '1px dashed rgba(0,229,255,0.3)',
                      color: '#00e5ff',
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '12px',
                    }}
                  >
                    + AGREGAR ACCIÓN
                  </button>
                )}
                {acciones.length === 0 && (
                  <p className="text-center text-sm py-4" style={{ color: '#3d5270' }}>
                    Sin acciones. Puedes saltar este paso o agregarlas después.
                  </p>
                )}
              </div>
            )}

            {/* PASO 5: RETRATOS */}
            {paso === 5 && (
              <div className="space-y-4">
                <p className="font-sans text-sm" style={{ color: '#7a8a9a' }}>
                  Sube imágenes para cada estado de tu personaje. Mínimo el retrato base. Los demás son opcionales — si no los tienes, se usará el estado base.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {ESTADOS_RETRATO.map(estado => (
                    <RetratoUploader
                      key={estado.key}
                      estadoKey={estado.key}
                      label={estado.label}
                      desc={estado.desc}
                      color={estado.color}
                      imagen={retratos[estado.key]}
                      cargando={cargandoRetrato === estado.key}
                      onSubir={handleSubirRetrato}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* PASO 6: LORE */}
            {paso === 6 && (
              <div className="space-y-6">
                <div>
                  <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>HISTORIA DEL PERSONAJE</label>
                  <textarea
                    value={historia}
                    onChange={e => setHistoria(e.target.value)}
                    placeholder="¿Cuáles son sus orígenes? ¿Qué le trajo aquí? ¿Cuáles son sus motivaciones?"
                    className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box"
                    rows={8}
                    style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#b8a070' }}
                  />
                </div>
                <div>
                  <label className="hud-label block mb-2" style={{ color: '#8fa8c8' }}>DESCRIPCIÓN FÍSICA</label>
                  <textarea
                    value={apariencia}
                    onChange={e => setApariencia(e.target.value)}
                    placeholder="¿Cómo luce tu personaje? Describe su apariencia física, vestimenta y rasgos distintivos."
                    className="hud-input w-full px-4 py-3 rounded-sm resize-none lore-box"
                    rows={5}
                    style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#b8a070' }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegación */}
      <div className="sticky bottom-0 border-t flex items-center justify-between px-6 py-4"
        style={{ borderColor: '#2a3548', background: 'rgba(8,10,14,0.95)' }}>
        <button
          onClick={() => setPaso(p => p - 1)}
          disabled={paso === 1}
          className="btn-primary px-6 py-3 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← ANTERIOR
        </button>

        <div className="flex gap-2">
          {PASOS.map(p => (
            <div
              key={p.id}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: paso === p.id ? '#ff1744' : paso > p.id ? '#4a607d' : '#2a3548',
                boxShadow: paso === p.id ? '0 0 6px #ff1744' : 'none',
              }}
            />
          ))}
        </div>

        {paso < PASOS.length ? (
          <button
            onClick={() => setPaso(p => p + 1)}
            disabled={!puedeAvanzar()}
            className="btn-primary px-6 py-3 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            SIGUIENTE →
          </button>
        ) : (
          <button
            onClick={handleGuardar}
            disabled={guardando || !nombre.trim()}
            className="btn-success px-8 py-3 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {guardando ? 'CREANDO...' : '✓ CREAR PERSONAJE'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══ VITAL CREATOR ═══ */
function VitalCreator({ label, value, color, onChange, desc }: {
  label: string; value: number; color: string; onChange: (v: number) => void; desc: string;
}) {
  return (
    <div className="p-4 rounded-sm" style={{ background: 'rgba(13,17,23,0.8)', border: `1px solid ${color}30` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="hud-label" style={{ color }}>{label}</span>
        <span className="font-hud text-2xl font-bold" style={{ color }}>{value}</span>
      </div>
      <p className="text-xs mb-3" style={{ color: '#4a607d' }}>{desc}</p>
      <div className="flex items-center gap-4">
        <input
          type="range" min={1} max={999} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number" value={value} min={1} max={999}
          onChange={e => onChange(Number(e.target.value))}
          className="hud-input w-20 px-2 py-2 text-center rounded-sm font-hud"
          style={{ color, fontSize: '16px' }}
        />
      </div>
    </div>
  );
}

/* ═══ ACCION EDITOR ═══ */
function AccionEditor({ accion, index, colorAcento, onChange, onDelete }: {
  accion: AccionPersonaje; index: number; colorAcento: string;
  onChange: (id: string, campo: keyof AccionPersonaje, valor: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 rounded-sm" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #2a3548' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="hud-label" style={{ color: colorAcento }}>ACCIÓN {index + 1}</span>
        <button onClick={() => onDelete(accion.id)} className="hud-label cursor-pointer hover:opacity-70" style={{ color: '#ff1744' }}>
          ✕ ELIMINAR
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>NOMBRE</label>
          <input
            type="text"
            value={accion.nombre}
            onChange={e => onChange(accion.id, 'nombre', e.target.value)}
            placeholder="Ej: Golpe de Espada"
            className="hud-input w-full px-3 py-2 rounded-sm text-sm"
          />
        </div>
        <div>
          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>TIPO</label>
          <select
            value={accion.tipo}
            onChange={e => onChange(accion.id, 'tipo', e.target.value)}
            className="hud-select w-full px-3 py-2 rounded-sm text-sm"
          >
            <option value="ataque">Ataque</option>
            <option value="magia">Magia</option>
            <option value="reaccion">Reacción</option>
            <option value="habilidad">Habilidad</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>DAÑO / EFECTO</label>
          <input type="text" value={accion.danio ?? ''}
            onChange={e => onChange(accion.id, 'danio', e.target.value)}
            placeholder="Ej: 2d6+3" className="hud-input w-full px-3 py-2 rounded-sm text-sm" />
        </div>
        <div>
          <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>COOLDOWN</label>
          <input type="text" value={accion.cooldown ?? ''}
            onChange={e => onChange(accion.id, 'cooldown', e.target.value)}
            placeholder="Ej: 1 turno" className="hud-input w-full px-3 py-2 rounded-sm text-sm" />
        </div>
      </div>
      <div>
        <label className="hud-label block mb-1" style={{ color: '#8fa8c8', fontSize: '9px' }}>DESCRIPCIÓN</label>
        <textarea
          value={accion.descripcion}
          onChange={e => onChange(accion.id, 'descripcion', e.target.value)}
          placeholder="¿Qué hace esta acción?"
          className="hud-input w-full px-3 py-2 rounded-sm text-sm resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}

/* ═══ RETRATO UPLOADER ═══ */
function RetratoUploader({ estadoKey, label, desc, color, imagen, cargando, onSubir }: {
  estadoKey: string; label: string; desc: string; color: string;
  imagen?: string; cargando: boolean;
  onSubir: (key: string, file: File) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSubir(estadoKey, file);
  };

  return (
    <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${color}30` }}>
      {/* Preview */}
      <div className="relative h-40" style={{ background: 'rgba(13,17,23,0.8)' }}>
        {imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagen} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-2">
            {cargando ? (
              <div className="animate-spin w-8 h-8 border-2 rounded-full"
                style={{ borderColor: `${color}40`, borderTopColor: color }} />
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" opacity={0.4}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span className="hud-label" style={{ color: `${color}80`, fontSize: '9px' }}>Sin imagen</span>
              </>
            )}
          </div>
        )}
        {imagen && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="hud-label" style={{ color }}>CAMBIAR</span>
          </div>
        )}
      </div>
      {/* Info y botón */}
      <label className="block p-2 cursor-pointer hover:opacity-80 transition-opacity"
        style={{ background: `${color}08` }}>
        <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
        <div className="hud-label" style={{ color, fontSize: '9px' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: '#4a607d' }}>{desc}</div>
        <div className="mt-2 hud-label text-center py-1 rounded-sm"
          style={{ background: `${color}10`, border: `1px solid ${color}30`, color, fontSize: '9px' }}>
          {imagen ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN'}
        </div>
      </label>
    </div>
  );
}
