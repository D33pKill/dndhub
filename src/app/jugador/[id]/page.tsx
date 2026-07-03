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
      <div className="bg-hud min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-hud text-lg mb-4" style={{ color: '#ff1744' }}>PERSONAJE NO ENCONTRADO</p>
          <button onClick={() => router.push('/jugador')} className="btn-primary px-6 py-3 rounded-sm">
            VOLVER
          </button>
        </div>
      </div>
    );
  }

  const estadoRetrato = derivarEstadoRetrato(personaje) as EstadoRetrato;
  const urlRetrato = personaje.retratos[estadoRetrato] ?? personaje.retratos.base ?? null;
  const hpPct = porcentajeVida(personaje.hp, personaje.hp_max);
  const manaPct = porcentajeVida(personaje.mana, personaje.mana_max);
  const stamPct = porcentajeVida(personaje.estamina, personaje.estamina_max);

  return (
    <div className="bg-hud min-h-screen flex flex-col relative overflow-hidden">
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
            animate={{ opacity: [0, 1, 0, 0.8, 0], transition: { repeat: Infinity, duration: 0.15 } }}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ background: 'rgba(255,100,0,0.15)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Barra superior ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: '#2a3548', background: 'rgba(8,10,14,0.9)' }}>
        {/* Conexión */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="connection-dot online" />
            <span className="hud-label" style={{ color: '#76ff03', fontSize: '10px' }}>CONECTADO</span>
          </div>
          <span className="hud-label" style={{ color: '#4a607d', fontSize: '9px' }}>|</span>
          <span className="hud-label" style={{ color: '#4a607d', fontSize: '10px' }}>
            {personaje.nombre.toUpperCase()} · {personaje.clase.toUpperCase()} · NV.{personaje.nivel}
          </span>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-2">
          <EstadoBadge estado={estadoRetrato} />
          {personaje.destello_negro && (
            <span className="hud-label px-2 py-0.5 rounded-sm"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #fff', color: '#fff', fontSize: '9px' }}>
              ⚡ DESTELLO NEGRO
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/jugador/${id}/editar`)}
            className="btn-primary px-3 py-1.5 rounded-sm text-xs">
            ✎ EDITAR
          </button>
          <button onClick={() => router.push('/jugador')}
            className="hud-label px-3 py-1.5 cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: '#3d5270' }}>
            ← SALIR
          </button>
        </div>
      </div>

      {/* ── Cuerpo principal HUD ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══ COLUMNA IZQUIERDA ═══ */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 p-3 border-r"
          style={{ borderColor: '#2a3548' }}>

          {/* Retrato */}
          <PortraitModule
            estadoRetrato={estadoRetrato}
            urlRetrato={urlRetrato}
            nombre={personaje.nombre}
            colorAcento={personaje.color_acento}
          />

          {/* Barras de vitales */}
          <div className="space-y-3 p-3 rounded-sm"
            style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #2a3548' }}>
            <VitalBar label="SALUD" value={personaje.hp} max={personaje.hp_max} pct={hpPct}
              fillClass="bar-hp" labelColor="#ff1744" />
            <VitalBar label="MAGIA" value={personaje.mana} max={personaje.mana_max} pct={manaPct}
              fillClass="bar-mana" labelColor="#00b0ff" />
            <VitalBar label="ESTAMINA" value={personaje.estamina} max={personaje.estamina_max} pct={stamPct}
              fillClass="bar-stamina" labelColor="#76ff03" />
          </div>

          {/* Condiciones activas */}
          <AnimatePresence>
            {personaje.condiciones_activas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-sm"
                style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #2a3548' }}
              >
                <p className="hud-label mb-2" style={{ color: '#4a607d', fontSize: '9px' }}>CONDICIONES ACTIVAS</p>
                <div className="flex flex-wrap gap-2">
                  {personaje.condiciones_activas.map(cond => (
                    <motion.span
                      key={cond}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="badge-condicion"
                      style={{
                        color: CONDICIONES_INFO[cond].color,
                        borderColor: CONDICIONES_INFO[cond].color,
                        background: `${CONDICIONES_INFO[cond].color}10`,
                        boxShadow: `0 0 8px ${CONDICIONES_INFO[cond].color}30`,
                      }}
                    >
                      {CONDICIONES_INFO[cond].nombre}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ COLUMNA CENTRAL ═══ */}
        <div className="flex-1 flex flex-col gap-3 p-3 min-w-0">
          {/* Radar */}
          <div className="flex-1 rounded-sm overflow-hidden"
            style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #2a3548', minHeight: '280px' }}>
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#2a3548' }}>
              <span className="hud-label" style={{ color: '#4a607d', fontSize: '10px' }}>PERFIL ESTADÍSTICO</span>
              <span className="font-heading text-sm font-bold" style={{ color: personaje.color_acento }}>
                {personaje.nombre}
              </span>
            </div>
            <div style={{ height: '260px' }}>
              <RadarHUD stats={personaje.estadisticas} color={personaje.color_acento} />
            </div>
          </div>

          {/* Ventajas / Desventajas */}
          {(personaje.ventajas.length > 0 || personaje.desventajas.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {personaje.ventajas.length > 0 && (
                <div className="p-3 rounded-sm" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #76ff0330' }}>
                  <p className="hud-label mb-2" style={{ color: '#76ff03', fontSize: '9px' }}>VENTAJAS</p>
                  <div className="space-y-1">
                    {personaje.ventajas.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#8fa8c8' }}>
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#76ff03' }} />
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {personaje.desventajas.length > 0 && (
                <div className="p-3 rounded-sm" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #ff174430' }}>
                  <p className="hud-label mb-2" style={{ color: '#ff1744', fontSize: '9px' }}>DESVENTAJAS</p>
                  <div className="space-y-1">
                    {personaje.desventajas.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#8fa8c8' }}>
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#ff1744' }} />
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
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 p-3 border-l"
          style={{ borderColor: '#2a3548' }}>

          {/* Acciones */}
          <div className="rounded-sm overflow-hidden" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid #2a3548' }}>
            <div className="p-3 border-b" style={{ borderColor: '#2a3548' }}>
              <span className="hud-label" style={{ color: '#4a607d', fontSize: '10px' }}>ACCIONES DE COMBATE</span>
            </div>
            <div className="p-3 space-y-2">
              {personaje.acciones.length > 0 ? (
                personaje.acciones.map(accion => (
                  <ActionCard key={accion.id} accion={accion} colorAcento={personaje.color_acento} />
                ))
              ) : (
                <p className="text-xs text-center py-4" style={{ color: '#3d5270' }}>
                  Sin acciones registradas.
                </p>
              )}
            </div>
          </div>

          {/* Historia */}
          {personaje.historia && (
            <div className="flex-1 rounded-sm overflow-hidden" style={{ minHeight: 0 }}>
              <div className="p-3 border-b" style={{ borderColor: 'rgba(139,100,50,0.2)' }}>
                <span className="hud-label" style={{ color: 'rgba(139,100,50,0.8)', fontSize: '10px' }}>HISTORIA</span>
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
  const isShock = estadoRetrato === 'shock';

  return (
    <motion.div
      key={estadoRetrato}
      animate={isShock ? { x: [0, -8, 8, -5, 5, -3, 3, 0], transition: { repeat: Infinity, duration: 0.3 } } : { x: 0 }}
      className="relative rounded-sm overflow-hidden"
      style={{
        height: '200px',
        border: `1px solid ${colorAcento}40`,
        boxShadow: isLightning ? '0 0 20px #fff, 0 0 40px #fff, 0 0 60px #aef' : `0 0 12px ${colorAcento}20`,
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
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: `${colorAcento}10` }}>
          <span className="font-heading text-5xl font-black" style={{ color: colorAcento, opacity: 0.4 }}>
            {nombre[0]}
          </span>
        </div>
      )}

      {/* Estado overlay */}
      {(estadoRetrato === 'herido' || estadoRetrato === 'afectado') && (
        <div className={`portrait-${estadoRetrato}`} style={{ position: 'absolute', inset: 0 }} />
      )}

      {/* Lightning border */}
      {isLightning && (
        <motion.div
          className="absolute inset-0 pointer-events-none lightning-border"
          style={{ border: '2px solid #ffffff', borderRadius: 'inherit' }}
        />
      )}

      {/* Overlay de texto estado */}
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
        <div className="flex items-center gap-1">
          <span className="font-hud font-bold" style={{ color: labelColor, fontSize: '14px' }}>{value}</span>
          <span className="font-hud" style={{ color: '#3d5270', fontSize: '10px' }}>/{max}</span>
        </div>
      </div>
      <div className="glow-bar-track h-5 relative">
        <motion.div
          className={`glow-bar-fill h-full ${fillClass}`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
        <span className="absolute right-2 top-0 bottom-0 flex items-center hud-label"
          style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

/* ═══ ACTION CARD ═══ */
function ActionCard({ accion, colorAcento }: { accion: { nombre: string; descripcion: string; tipo: string; danio?: string; cooldown?: string }; colorAcento: string }) {
  const tipoColor: Record<string, string> = {
    ataque: '#ff1744', magia: '#00b0ff', reaccion: '#76ff03', habilidad: colorAcento
  };
  const color = tipoColor[accion.tipo] ?? colorAcento;

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 2 }}
      className="action-btn rounded-sm p-3"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-5 rounded-sm flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="font-hud text-xs font-bold truncate" style={{ color }}>{accion.nombre}</span>
        {accion.danio && (
          <span className="ml-auto hud-label flex-shrink-0" style={{ color, fontSize: '9px' }}>{accion.danio}</span>
        )}
      </div>
      {accion.descripcion && (
        <p className="text-xs ml-3.5 leading-relaxed" style={{ color: '#4a607d' }}>{accion.descripcion}</p>
      )}
    </motion.div>
  );
}

/* ═══ ESTADO BADGE ═══ */
function EstadoBadge({ estado }: { estado: EstadoRetrato }) {
  const config: Record<EstadoRetrato, { label: string; color: string }> = {
    base: { label: 'ESTADO BASE', color: '#76ff03' },
    herido: { label: 'HERIDO', color: '#ff1744' },
    afectado: { label: 'AFECTADO', color: '#39ff14' },
    inconsciente: { label: 'INCONSCIENTE', color: '#555' },
    en_zona: { label: 'EN LA ZONA ⚡', color: '#ffffff' },
    shock: { label: '💥 SHOCK', color: '#ff6d00' },
  };
  const c = config[estado];
  return (
    <span className="hud-label px-2 py-0.5 rounded-sm inline-block"
      style={{
        background: `${c.color}15`,
        border: `1px solid ${c.color}50`,
        color: c.color,
        boxShadow: `0 0 8px ${c.color}30`,
        fontSize: '9px',
      }}>
      {c.label}
    </span>
  );
}
