'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePersonaje } from '@/hooks/usePersonajes';
import { derivarEstadoRetrato, porcentajeVida } from '@/lib/db';
import { EstadoRetrato, CondicionEstado, AccionPersonaje, RasgoPersonaje, calcularModificador } from '@/types/character';
import { CONDICIONES_INFO, ATRIBUTOS_BASE } from '@/lib/constants';

const RadarHUD = dynamic(() => import('@/components/hud/RadarHUD'), { ssr: false });

export default function JugadorHUDPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { personaje } = usePersonaje(id);
  const [tabDer, setTabDer] = useState<'acciones' | 'rasgos' | 'equipo'>('acciones');

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
  const accionesActivas   = personaje.estado_especial ? accionesEspeciales : accionesNormales;

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
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: '#1c1712', background: 'rgba(6,4,2,0.92)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="connection-dot online" />
            <span className="hud-label" style={{ color: '#4a6030', fontSize: '9px' }}>ENLAZADO</span>
          </div>
          <div style={{ width: '1px', height: '12px', background: '#2e2820' }} />
          <span className="font-heading" style={{ color: '#5a4e40', fontSize: '10px', letterSpacing: '0.15em' }}>
            {personaje.nombre.toUpperCase()} · {personaje.clase.toUpperCase()} · NV.{personaje.nivel}
          </span>
          {personaje.subclase && (
            <span className="hud-label" style={{ color: '#3d3028', fontSize: '8px' }}>
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
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 p-3 border-r"
          style={{ borderColor: '#1c1712' }}>

          {/* Retrato */}
          <PortraitModule
            estadoRetrato={estadoRetrato}
            urlRetrato={urlRetrato}
            nombre={personaje.nombre}
            colorAcento={personaje.color_acento}
            estadoEspecial={personaje.estado_especial}
          />

          {/* HP */}
          <div className="p-3 stone-frame">
            <div className="flex items-center justify-between mb-2">
              <span className="hud-label" style={{ color: '#6b1818', fontSize: '9px' }}>PUNTOS DE GOLPE</span>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold" style={{ color: '#8b2020', fontSize: '16px' }}>
                  {personaje.hp}
                </span>
                <span className="font-heading" style={{ color: '#3d3028', fontSize: '10px' }}>
                  /{personaje.hp_max}
                </span>
              </div>
            </div>
            <div className="glow-bar-track h-4 relative">
              <motion.div
                className="glow-bar-fill h-full bar-hp"
                animate={{ width: `${hpPct}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
              />
              <span className="absolute right-2 top-0 bottom-0 flex items-center font-heading"
                style={{ color: 'rgba(180,160,120,0.25)', fontSize: '9px' }}>
                {Math.round(hpPct)}%
              </span>
            </div>
          </div>

          {/* Combate — CA, velocidad, iniciativa */}
          <div className="p-3 stone-frame">
            <p className="hud-label mb-2" style={{ color: '#5a4e40', fontSize: '9px' }}>COMBATE</p>
            <div className="grid grid-cols-3 gap-2">
              <StatCombate
                label={personaje.estado_especial && personaje.ca_especial ? 'CA*' : 'CA'}
                value={personaje.estado_especial && personaje.ca_especial
                  ? personaje.ca_especial
                  : personaje.ca}
                color="#7a5818"
              />
              <StatCombate label="VEL" value={`${personaje.velocidad}p`} color="#3a4870" />
              <StatCombate
                label="INIC"
                value={personaje.iniciativa >= 0 ? `+${personaje.iniciativa}` : `${personaje.iniciativa}`}
                color="#344020"
              />
            </div>
            {personaje.bonificador_ataque > 0 && (
              <div className="flex gap-2 mt-2">
                <StatCombate
                  label="BON.ATK"
                  value={`+${personaje.bonificador_ataque}`}
                  color="#6b1818"
                />
                {personaje.bonificador_magia > 0 && (
                  <StatCombate
                    label="BON.MAG"
                    value={`+${personaje.bonificador_magia}`}
                    color="#3a4870"
                  />
                )}
              </div>
            )}
            {personaje.dado_especial && (
              <div className="mt-2 px-2 py-1 text-center rounded-sm"
                style={{ background: 'rgba(107,24,24,0.1)', border: '1px solid #3d1010' }}>
                <span className="hud-label" style={{ color: '#8b2020', fontSize: '8px' }}>
                  ATK FURTIVO: {personaje.dado_especial}
                </span>
              </div>
            )}
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
                <div className="flex flex-wrap gap-1.5">
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
        <div className="flex-1 flex flex-col gap-2 p-3 min-w-0 overflow-y-auto">

          {/* Radar de atributos */}
          <div className="stone-frame overflow-hidden" style={{ minHeight: '280px' }}>
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#1c1712' }}>
              <span className="hud-label" style={{ color: '#5a4e40', fontSize: '9px' }}>ATRIBUTOS</span>
              <span className="font-heading text-sm font-bold"
                style={{ color: '#9a7020', letterSpacing: '0.06em' }}>
                {personaje.nombre}
              </span>
            </div>
            <div style={{ height: '240px' }}>
              <RadarHUD stats={personaje.estadisticas} color={personaje.color_acento} />
            </div>
          </div>

          {/* Habilidades competentes */}
          {Object.keys(personaje.habilidades).length > 0 && (
            <div className="p-3 stone-frame">
              <p className="hud-label mb-2" style={{ color: '#5a4e40', fontSize: '9px' }}>COMPETENCIAS</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(personaje.habilidades)
                  .sort((a, b) => b[1].bonus - a[1].bonus)
                  .map(([habilidad, entrada]) => (
                    <div key={habilidad} className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center text-center"
                        style={{
                          background: entrada.experto ? `${personaje.color_acento}20` : 'rgba(42,53,72,0.4)',
                          border: `1px solid ${entrada.experto ? personaje.color_acento : '#2a3548'}`,
                          fontSize: '7px',
                          color: entrada.experto ? personaje.color_acento : '#4a607d',
                        }}
                        title={entrada.experto ? 'Experto' : 'Competente'}
                      >
                        {entrada.experto ? '★' : '◆'}
                      </span>
                      <span className="font-lore text-xs truncate" style={{ color: '#7a6e60' }}>
                        {habilidad}
                      </span>
                      <span className="ml-auto font-heading text-xs font-bold flex-shrink-0"
                        style={{ color: personaje.color_acento }}>
                        {entrada.bonus >= 0 ? `+${entrada.bonus}` : `${entrada.bonus}`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Salvaciones */}
          {Object.keys(personaje.salvaciones).length > 0 && (
            <div className="p-3 stone-frame">
              <p className="hud-label mb-2" style={{ color: '#5a4e40', fontSize: '9px' }}>SALVACIONES</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(personaje.salvaciones).map(([attr, bonus]) => (
                  <div key={attr} className="flex items-center gap-1 px-2 py-1 rounded-sm"
                    style={{ background: 'rgba(42,53,72,0.3)', border: '1px solid #2a3548' }}>
                    <span className="hud-label" style={{ color: '#8fa8c8', fontSize: '9px' }}>{attr}</span>
                    <span className="font-heading font-bold" style={{ color: personaje.color_acento, fontSize: '10px' }}>
                      {bonus >= 0 ? `+${bonus}` : `${bonus}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ventajas / Desventajas */}
          {(personaje.ventajas.length > 0 || personaje.desventajas.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {personaje.ventajas.length > 0 && (
                <div className="p-3 stone-frame" style={{ borderColor: '#243018' }}>
                  <p className="hud-label mb-2" style={{ color: '#384828', fontSize: '9px' }}>VIRTUDES</p>
                  <div className="space-y-1">
                    {personaje.ventajas.map((v, i) => (
                      <div key={i} className="flex items-start gap-2"
                        style={{ color: '#7a6e60', fontSize: '12px', fontFamily: 'Crimson Pro, serif' }}>
                        <div className="w-1 h-1 flex-shrink-0 mt-1.5" style={{ background: '#344020' }} />
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
                      <div key={i} className="flex items-start gap-2"
                        style={{ color: '#7a6e60', fontSize: '12px', fontFamily: 'Crimson Pro, serif' }}>
                        <div className="w-1 h-1 flex-shrink-0 mt-1.5" style={{ background: '#4a1010' }} />
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
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 p-3 border-l overflow-y-auto"
          style={{ borderColor: '#1c1712' }}>

          {/* Tabs de la columna derecha */}
          <div className="flex gap-1 flex-shrink-0">
            {(['acciones', 'rasgos', 'equipo'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTabDer(t)}
                className="flex-1 py-1.5 hud-label transition-all cursor-pointer"
                style={{
                  background: tabDer === t ? `${personaje.color_acento}15` : 'transparent',
                  border: `1px solid ${tabDer === t ? personaje.color_acento : '#2e2820'}`,
                  color: tabDer === t ? personaje.color_acento : '#5a4e40',
                  fontSize: '8px',
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab: Acciones */}
          {tabDer === 'acciones' && (
            <div className="stone-frame overflow-hidden flex-1">
              <div className="p-3 border-b" style={{ borderColor: '#1c1712' }}>
                <div className="flex items-center justify-between">
                  <span className="hud-label" style={{ color: '#5a4e40', fontSize: '9px' }}>
                    {personaje.estado_especial ? personaje.nombre_estado_especial : 'ESTADO NORMAL'}
                  </span>
                  <span className="hud-label" style={{ color: '#3d3028', fontSize: '8px' }}>
                    {accionesActivas.length} disponibles
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {accionesActivas.length > 0 ? (
                  accionesActivas.map(accion => (
                    <ActionCard key={accion.id} accion={accion} colorAcento={personaje.color_acento} />
                  ))
                ) : (
                  <p className="font-lore text-sm text-center py-4" style={{ color: '#3d3028' }}>
                    Sin acciones para este estado.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Rasgos */}
          {tabDer === 'rasgos' && (
            <div className="space-y-2 flex-1">
              {personaje.rasgos.length > 0 ? personaje.rasgos.map(rasgo => (
                <RasgoCard key={rasgo.id} rasgo={rasgo} color={personaje.color_acento} />
              )) : (
                <p className="font-lore text-sm text-center py-8" style={{ color: '#3d3028' }}>
                  Sin rasgos registrados.
                </p>
              )}
            </div>
          )}

          {/* Tab: Equipo */}
          {tabDer === 'equipo' && (
            <div className="flex-1">
              {personaje.equipo.length > 0 ? (
                <div className="p-3 stone-frame">
                  <div className="space-y-1.5">
                    {personaje.equipo.map((item, i) => (
                      <div key={i} className="flex items-start gap-2"
                        style={{ color: '#7a6e60', fontFamily: 'Crimson Pro, serif', fontSize: '13px' }}>
                        <span style={{ color: '#5a4010', flexShrink: 0 }}>◆</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="font-lore text-sm text-center py-8" style={{ color: '#3d3028' }}>
                  Sin equipo registrado.
                </p>
              )}
              {personaje.idiomas.length > 0 && (
                <div className="mt-2 p-3 stone-frame">
                  <p className="hud-label mb-2" style={{ color: '#5a4e40', fontSize: '9px' }}>IDIOMAS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {personaje.idiomas.map((idioma, i) => (
                      <span key={i} className="hud-label px-2 py-0.5 rounded-sm"
                        style={{ background: 'rgba(90,64,16,0.08)', border: '1px solid #5a4010', color: '#7a5818', fontSize: '9px' }}>
                        {idioma}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Historia / Lore */}
              {personaje.historia && (
                <div className="mt-2">
                  <div className="p-3 border-b" style={{ borderColor: 'rgba(90,64,16,0.2)' }}>
                    <span className="hud-label" style={{ color: '#5a4010', fontSize: '9px' }}>CRÓNICA</span>
                  </div>
                  <div className="lore-box p-3 overflow-y-auto" style={{ maxHeight: '160px' }}>
                    {personaje.historia}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ PORTRAIT MODULE ═══ */
function PortraitModule({ estadoRetrato, urlRetrato, nombre, colorAcento, estadoEspecial }: {
  estadoRetrato: EstadoRetrato;
  urlRetrato: string | null;
  nombre: string;
  colorAcento: string;
  estadoEspecial: boolean;
}) {
  const isZona   = estadoRetrato === 'en_zona';
  const isShock  = estadoRetrato === 'shock';

  return (
    <motion.div
      key={estadoRetrato}
      animate={isShock ? { x: [0, -6, 6, -4, 4, -2, 2, 0], transition: { repeat: Infinity, duration: 0.35 } } : { x: 0 }}
      className="relative overflow-hidden"
      style={{
        height: '200px',
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

      <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
        <EstadoBadge estado={estadoRetrato} />
      </div>
    </motion.div>
  );
}

/* ═══ STAT COMBATE ═══ */
function StatCombate({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center p-2 rounded-sm" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
      <div className="hud-label mb-0.5" style={{ color: `${color}99`, fontSize: '7px' }}>{label}</div>
      <div className="font-heading font-bold" style={{ color, fontSize: '14px' }}>{value}</div>
    </div>
  );
}

/* ═══ ACTION CARD ═══ */
function ActionCard({ accion, colorAcento }: { accion: AccionPersonaje; colorAcento: string }) {
  const tipoColor: Record<string, string> = {
    ataque: '#6b1818', magia: '#243050', reaccion: '#243018', habilidad: '#5a4010', bonus: '#3a4870',
  };
  const color = tipoColor[accion.tipo] ?? '#3d3028';
  const colorBright: Record<string, string> = {
    ataque: '#8b2020', magia: '#3a4870', reaccion: '#344020', habilidad: '#7a5818', bonus: '#4a607d',
  };
  const bright = colorBright[accion.tipo] ?? '#5a4e40';

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 2 }}
      className="action-btn p-3"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 flex-shrink-0" style={{ background: bright }} />
        <span className="font-heading text-xs font-bold truncate" style={{ color: bright, letterSpacing: '0.06em' }}>
          {accion.nombre}
        </span>
        {accion.tirada_impactar && (
          <span className="ml-auto font-heading flex-shrink-0" style={{ color: colorAcento, fontSize: '9px' }}>
            {accion.tirada_impactar}
          </span>
        )}
      </div>
      {(accion.danio || accion.alcance || accion.tipo_danio) && (
        <div className="flex gap-2 ml-3 mb-1">
          {accion.danio && (
            <span className="hud-label" style={{ color: '#ff4444', fontSize: '8px' }}>
              ⚔ {accion.danio} {accion.tipo_danio}
            </span>
          )}
          {accion.alcance && (
            <span className="hud-label" style={{ color: '#4a607d', fontSize: '8px' }}>
              📏 {accion.alcance}
            </span>
          )}
        </div>
      )}
      {accion.descripcion && (
        <p className="font-lore ml-3 leading-relaxed" style={{ color: '#5a4e40', fontSize: '12px' }}>
          {accion.descripcion}
        </p>
      )}
      {accion.cooldown && (
        <div className="ml-3 mt-1">
          <span className="hud-label" style={{ color: '#3d5270', fontSize: '8px' }}>🔁 {accion.cooldown}</span>
        </div>
      )}
    </motion.div>
  );
}

/* ═══ RASGO CARD ═══ */
function RasgoCard({ rasgo, color }: { rasgo: RasgoPersonaje; color: string }) {
  return (
    <div className="p-3 stone-frame">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: color }} />
        <span className="font-heading text-xs font-bold" style={{ color, letterSpacing: '0.06em' }}>
          {rasgo.nombre}
        </span>
      </div>
      <p className="font-lore ml-3.5 leading-relaxed" style={{ color: '#7a6e60', fontSize: '12px' }}>
        {rasgo.descripcion}
      </p>
    </div>
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
