// ============================================================
//  Tipos del sistema TTRPG — D&D 5e
// ============================================================

export type EstadoRetrato =
  | 'base'
  | 'herido'
  | 'afectado'
  | 'inconsciente'
  | 'en_zona'
  | 'shock';

export type CondicionEstado =
  | 'ENVENENADO'
  | 'ACELERADO'
  | 'CEGADO'
  | 'QUEMADO'
  | 'ATURDIDO'
  | 'CONCENTRADO'
  | 'MALDITO'
  | 'INVISIBLE'
  | 'PARALIZADO'
  | 'ASUSTADO';

/** Los 6 atributos base de D&D 5e */
export interface EstadisticasBase {
  fuerza:       number;
  destreza:     number;
  constitucion: number;
  inteligencia: number;
  sabiduria:    number;
  carisma:      number;
}

/** Calcula el modificador de un atributo D&D (floor((val - 10) / 2)) */
export function calcularModificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

/** Formatea el modificador con signo: +3, -1, etc. */
export function formatModificador(valor: number): string {
  const mod = calcularModificador(valor);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Habilidad con bonificador y flag de experto */
export interface HabilidadEntrada {
  bonus:   number;
  experto: boolean;
}

/** Acción / habilidad / ataque de combate */
export interface AccionPersonaje {
  id:               string;
  nombre:           string;
  descripcion:      string;
  tipo:             'ataque' | 'magia' | 'reaccion' | 'habilidad' | 'bonus';
  icono:            string;
  // Ataque D&D
  tirada_impactar?: string;  // ej: "+6" o "1d20+5"
  alcance?:         string;  // ej: "5 pies" o "20/60"
  danio?:           string;  // ej: "1d4+4"
  tipo_danio?:      string;  // ej: "perforante"
  cooldown?:        string;  // ej: "2/descanso corto"
  // Estado en el que está disponible
  estado:           'normal' | 'especial' | 'ambos';
}

/** Rasgo racial / de clase / único */
export interface RasgoPersonaje {
  id:          string;
  nombre:      string;
  descripcion: string;
}

export interface Retrato {
  base:          string;
  herido:        string;
  afectado:      string;
  inconsciente:  string;
  en_zona:       string;
  shock:         string;
}

export interface Personaje {
  id: string;

  // ── Identidad ─────────────────────────────────────────
  nombre:       string;
  clase:        string;
  subclase:     string;
  raza:         string;
  trasfondo:    string;
  alineamiento: string;
  nivel:        number;
  color_acento: string;

  // ── Vitales ───────────────────────────────────────────
  hp:     number;
  hp_max: number;

  // ── Combate ───────────────────────────────────────────
  ca:                      number;       // Clase de Armadura normal
  ca_especial:             number | null; // CA en estado especial (enojado, etc.)
  velocidad:               number;       // pies
  iniciativa:              number;       // modificador de iniciativa
  bonificador_competencia: number;       // +2, +3, etc.
  bonificador_ataque:      number;       // bonus de ataque principal
  bonificador_magia:       number;       // bonus de ataque mágico
  dado_especial:           string | null; // ej: "2d6" (ataque furtivo)

  // ── Estadísticas D&D 5e ───────────────────────────────
  estadisticas: EstadisticasBase;

  // ── Habilidades y salvaciones ─────────────────────────
  habilidades: Record<string, HabilidadEntrada>;  // "Sigilo": { bonus: 8, experto: true }
  salvaciones: Record<string, number>;             // "Destreza": 6

  // ── Sistema de condiciones ────────────────────────────
  condiciones_activas:      CondicionEstado[];
  retrato_forzado:          EstadoRetrato | null;
  estado_especial:          boolean;
  nombre_estado_especial:   string;  // ej: "ESTADO ENOJADO", "ECO ARCANO"

  // ── Retratos ──────────────────────────────────────────
  retratos: Partial<Retrato>;

  // ── Rasgos ────────────────────────────────────────────
  ventajas:    string[];
  desventajas: string[];
  rasgos:      RasgoPersonaje[];

  // ── Acciones ──────────────────────────────────────────
  acciones: AccionPersonaje[];

  // ── Equipo e idiomas ──────────────────────────────────
  equipo:   string[];
  idiomas:  string[];

  // ── Lore ──────────────────────────────────────────────
  historia:     string;
  apariencia:   string;
  personalidad: string;

  // ── Metadatos ─────────────────────────────────────────
  conectado:     boolean;
  ultimo_update: string;
}

export interface EstadoDM {
  password_verificada: boolean;
}

export interface LogAccion {
  id:               string;
  timestamp:        string;
  tipo:             'stat' | 'condicion' | 'retrato' | 'estado';
  descripcion:      string;
  personaje_id:     string;
  personaje_nombre: string;
}
