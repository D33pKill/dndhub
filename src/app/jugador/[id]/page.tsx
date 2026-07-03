'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePersonaje } from '@/hooks/usePersonajes';
import { derivarEstadoRetrato, porcentajeVida } from '@/lib/db';
import { EstadoRetrato, CondicionEstado } from '@/types/character';
import { CONDICIONES_INFO } from '@/lib/constants';

const RadarHUD = dynamic(() => import('@/components/hud/RadarHUD'), { ssr: false });

export default function JugadorHUDPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { personaje } = usePersonaje(id);

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
  const hpPct  = porcentajeVida(personaje.hp, personaje.hp_max);
  const manaPct = porcentajeVida(personaje.mana, personaje.mana_max);
  const stamPct = porcentajeVida(personaje.estamina, personaje.estamina_max);

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
        {estadoRetrato === 'shock' && (
          <motion.div
            key="shock-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0, 0.5, 0], transition: { repeat: Infinity, duration: 0.2 } }}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ background: 'rgba(139,32,32,0.12)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Barra superior ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.92)' }}>

        {/* Conexión e identidad */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="connection-dot online" />
            <span className="hud-label" style={{ color: '#4a6030', fontSize: '9px' }}>ENLAZADO</span>
          </div>
          <div style={{ width: '1px', height: '12px', background: '#2e2820' }} />
          <span className="font-heading" style={{ color: '#5a4e40', fontSize: '10px', letterSpacing: '0.15em' }}>
            {personaje.nombre.toUpperCase()} · {personaje.clase.toUpperCase()} · NV.{personaje.nivel}
          </span>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-2">
          <EstadoBadge estado={estadoRetrato} />
          {personaje.destello_negro && (
            <span className="font-heading px-2 py-0.5"
              style={{ background: 'rgba(154,112,32,0.1)', border: '1px solid #7a5818', color: '#c8a048', fontSize: '9px', letterSpacing: '0.12em' }}>
              ✦ EN LA ZONA
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/jugador/${id}/editar`)}
            className="btn-primary px-3 py-1.5 text-xs">
            ✎ EDITAR
          </button>
          <button onClick={() => router.push('/jugador')}
            className="hud-label px-3 py-1.5 cursor-pointer hover:opacity-60 transition-opacity"
            style={{ color: '#3d3028', fontSize: '10px' }}>
            ← SALIR
          </button>
        </div>
      </div>

      {/* ── Cuerpo principal HUD ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ COLUMNA IZQUIERDA ═══ */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 p-3 border-r"
          style={{ borderColor: '#1c1712' }}>

          {/* Retrato */}
          <PortraitModule
            estadoRetrato={estadoRetrato}
            urlRetrato={urlRetrato}
            nombre={personaje.nombre}
            colorAcento={personaje.color_acento}
          />

          {/* Barras de vitales */}
          <div className="space-y-3 p-3 stone-frame">
            <VitalBar label="SALUD"    value={personaje.hp}       max={personaje.hp_max}       pct={hpPct}
              fillClass="bar-hp"      labelColor="#6b1818" />
            <VitalBar label="MANÁ"     value={personaje.mana}     max={personaje.mana_max}     pct={manaPct}
              fillClass="bar-mana"    labelColor="#3a4870" />
            <VitalBar label="ESTAMINA" value={personaje.estamina} max={personaje.estamina_max} pct={stamPct}
              fillClass="bar-stamina" labelColor="#344020" />
          </div>

          {/* Condiciones activas */}
          <AnimatePresence>
            {personaje.condiciones_activas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 stone-frame"
              >
                <p className="hud-label mb-2" style={{ color: '#5a4e40', fontSize: '9px' }}>AFLICCIONES</p>
                <div className="flex flex-wrap gap-2">
                  {personaje.condiciones_activas.map(cond => (
                    <motion.span
                      key={cond}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="badge-condicion"
                      style={{
                        color: CONDICIONES_INFO[cond as CondicionEstado].color,
                        borderColor: CONDICIONES_INFO[cond as CondicionEstado].color,
                        background: `${CONDICIONES_INFO[cond as CondicionEstado].color}12`,
                      }}
                    >
                      {CONDICIONES_INFO[cond as CondicionEstado].nombre}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ COLUMNA CENTRAL ═══ */}
        <div className="flex-1 flex flex-col gap-2 p-3 min-w-0">

          {/* Radar */}
          <div className="flex-1 overflow-hidden stone-frame" style={{ minHeight: '280px' }}>
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#1c1712' }}>
              <span className="hud-label" style={{ color: '#5a4e40', fontSize: '9px' }}>PERFIL ESTADÍSTICO</span>
              <span className="font-heading text-sm font-bold" style={{ color: '#9a7020', letterSpacing: '0.06em' }}>
                {personaje.nombre}
              </span>
            </div>
            <div style={{ height: '260px' }}>
              <RadarHUD stats={personaje.estadisticas} color={personaje.color_acento} />
            </div>
          </div>

          {/* Ventajas / Desventajas */}
          {(personaje.ventajas.length > 0 || personaje.desventajas.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {personaje.ventajas.length > 0 && (
                <div className="p-3 stone-frame" style={{ borderColor: '#243018' }}>
                  <p className="hud-label mb-2" style={{ color: '#384828', fontSize: '9px' }}>VIRTUDES</p>
                  <div className="space-y-1">
                    {personaje.ventajas.map((v, i) => (
                      <div key={i} className="flex items-center gap-2" style={{ color: '#7a6e60', fontSize: '13px', fontFamily: 'Crimson Pro, serif' }}>
                        <div className="w-1 h-1 flex-shrink-0" style={{ background: '#344020' }} />
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {personaje.desventajas.length > 0 && (
                <div className="p-3 stone-frame" style={{ borderColor: '#2a0808' }}>
                  <p className="hud-label mb-2" style={{ color: '#4a1010', fontSize: '9px' }}>MALDICIONES</p>
                  <div className="space-y-1">
                    {personaje.desventajas.map((d, i) => (
                      <div key={i} className="flex items-center gap-2" style={{ color: '#7a6e60', fontSize: '13px', fontFamily: 'Crimson Pro, serif' }}>
                        <div className="w-1 h-1 flex-shrink-0" style={{ background: '#4a1010' }} />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ COLUMNA DERECHA ═══ */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 p-3 border-l"
          style={{ borderColor: '#1c1712' }}>

          {/* Acciones */}
          <div className="stone-frame overflow-hidden">
            <div className="p-3 border-b" style={{ borderColor: '#1c1712' }}>
              <span className="hud-label" style={{ color: '#5a4e40', fontSize: '9px' }}>ARTES DE COMBATE</span>
            </div>
            <div className="p-3 space-y-2">
              {personaje.acciones.length > 0 ? (
                personaje.acciones.map(accion => (
                  <ActionCard key={accion.id} accion={accion} colorAcento={personaje.color_acento} />
                ))
              ) : (
                <p className="font-lore text-sm text-center py-4" style={{ color: '#3d3028' }}>
                  Sin artes registradas.
                </p>
              )}
            </div>
          </div>

          {/* Historia / Lore */}
          {personaje.historia && (
            <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
              <div className="p-3 border-b" style={{ borderColor: 'rgba(90,64,16,0.2)' }}>
                <span className="hud-label" style={{ color: '#5a4010', fontSize: '9px' }}>CRÓNICA</span>
              </div>
              <div className="lore-box p-3 overflow-y-auto" style={{ maxHeight: '180px' }}>
                {personaje.historia}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ PORTRAIT MODULE ═══ */
function PortraitModule({ estadoRetrato, urlRetrato, nombre, colorAcento }: {
  estadoRetrato: EstadoRetrato; urlRetrato: string | null; nombre: string; colorAcento: string;
}) {
  const isLightning = estadoRetrato === 'en_zona';
  const isShock     = estadoRetrato === 'shock';

  return (
    <motion.div
      key={estadoRetrato}
      animate={isShock ? { x: [0, -6, 6, -4, 4, -2, 2, 0], transition: { repeat: Infinity, duration: 0.35 } } : { x: 0 }}
      className="relative overflow-hidden"
      style={{
        height: '200px',
        border: '1px solid #2e2820',
        boxShadow: isLightning
          ? '0 0 20px rgba(154,112,32,0.5), 0 0 40px rgba(154,112,32,0.25)'
          : '0 4px 20px rgba(0,0,0,0.8)',
      }}
    >
      {/* Imagen */}
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

      {/* Borde dorado pulsante para "en la zona" */}
      {isLightning && (
        <motion.div
          className="absolute inset-0 pointer-events-none lightning-border"
          style={{ border: '2px solid #9a7020' }}
        />
      )}

      {/* Overlay estado */}
      <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
        <EstadoBadge estado={estadoRetrato} />
      </div>
    </motion.div>
  );
}

/* ═══ VITAL BAR ═══ */
function VitalBar({ label, value, max, pct, fillClass, labelColor }: {
  label: string; value: number; max: number; pct: number; fillClass: string; labelColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="hud-label" style={{ color: labelColor, fontSize: '9px' }}>{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-heading font-bold" style={{ color: labelColor, fontSize: '14px' }}>{value}</span>
          <span className="font-heading" style={{ color: '#3d3028', fontSize: '10px' }}>/{max}</span>
        </div>
      </div>
      <div className="glow-bar-track h-5 relative">
        <motion.div
          className={`glow-bar-fill h-full ${fillClass}`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
        <span className="absolute right-2 top-0 bottom-0 flex items-center font-heading"
          style={{ color: 'rgba(180,160,120,0.25)', fontSize: '9px', letterSpacing: '0.05em' }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

/* ═══ ACTION CARD ═══ */
function ActionCard({ accion, colorAcento }: {
  accion: { nombre: string; descripcion: string; tipo: string; danio?: string; cooldown?: string };
  colorAcento: string;
}) {
  const tipoColor: Record<string, string> = {
    ataque:    '#6b1818',
    magia:     '#243050',
    reaccion:  '#243018',
    habilidad: '#5a4010',
  };
  const color = tipoColor[accion.tipo] ?? '#3d3028';
  const colorBright: Record<string, string> = {
    ataque: '#8b2020', magia: '#3a4870', reaccion: '#344020', habilidad: '#7a5818',
  };
  const bright = colorBright[accion.tipo] ?? '#5a4e40';

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 2 }}
      className="action-btn p-3"
      style={{ borderColor: `${color}` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 flex-shrink-0" style={{ background: bright }} />
        <span className="font-heading text-xs font-bold truncate" style={{ color: bright, letterSpacing: '0.06em' }}>
          {accion.nombre}
        </span>
        {accion.danio && (
          <span className="ml-auto font-heading flex-shrink-0" style={{ color: bright, fontSize: '9px' }}>
            {accion.danio}
          </span>
        )}
      </div>
      {accion.descripcion && (
        <p className="font-lore ml-3 leading-relaxed" style={{ color: '#5a4e40', fontSize: '12px' }}>
          {accion.descripcion}
        </p>
      )}
    </motion.div>
  );
}

/* ═══ ESTADO BADGE ═══ */
function EstadoBadge({ estado }: { estado: EstadoRetrato }) {
  const config: Record<EstadoRetrato, { label: string; color: string }> = {
    base:          { label: 'ESTABLE',          color: '#384828' },
    herido:        { label: 'HERIDO',            color: '#6b1818' },
    afectado:      { label: 'AFECTADO',          color: '#243018' },
    inconsciente:  { label: 'INCONSCIENTE',      color: '#2e2820' },
    en_zona:       { label: '✦ EN LA ZONA',      color: '#7a5818' },
    shock:         { label: '⚠ SHOCK',           color: '#5a2810' },
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
