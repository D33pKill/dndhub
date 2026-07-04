import { CondicionEstado } from '@/types/character';

export const DM_PASSWORD = 'urales2163';

// ──────────────────────────────────────────────────────────
//  ATRIBUTOS D&D 5e
// ──────────────────────────────────────────────────────────

export const ATRIBUTOS_BASE = [
  { key: 'fuerza',       abr: 'FUE', label: 'Fuerza',        color: '#8b2020' },
  { key: 'destreza',     abr: 'DES', label: 'Destreza',      color: '#1a6b2a' },
  { key: 'constitucion', abr: 'CON', label: 'Constitución',  color: '#8b5010' },
  { key: 'inteligencia', abr: 'INT', label: 'Inteligencia',  color: '#243070' },
  { key: 'sabiduria',    abr: 'SAB', label: 'Sabiduría',     color: '#6a2a70' },
  { key: 'carisma',      abr: 'CAR', label: 'Carisma',       color: '#7a5818' },
] as const;

export type AtributoKey = 'fuerza' | 'destreza' | 'constitucion' | 'inteligencia' | 'sabiduria' | 'carisma';

// ──────────────────────────────────────────────────────────
//  HABILIDADES D&D 5e (con su atributo base)
// ──────────────────────────────────────────────────────────

export const HABILIDADES_DND: { nombre: string; atributo: string; abr: string }[] = [
  { nombre: 'Acrobacias',          atributo: 'DES', abr: 'ACR' },
  { nombre: 'Arcana',              atributo: 'INT', abr: 'ARC' },
  { nombre: 'Atletismo',           atributo: 'FUE', abr: 'ATL' },
  { nombre: 'Engaño',              atributo: 'CAR', abr: 'ENG' },
  { nombre: 'Historia',            atributo: 'INT', abr: 'HIS' },
  { nombre: 'Intimidación',        atributo: 'CAR', abr: 'INT' },
  { nombre: 'Interpretación',      atributo: 'CAR', abr: 'ITP' },
  { nombre: 'Investigación',       atributo: 'INT', abr: 'INV' },
  { nombre: 'Juego de Manos',      atributo: 'DES', abr: 'JDM' },
  { nombre: 'Medicina',            atributo: 'SAB', abr: 'MED' },
  { nombre: 'Naturaleza',          atributo: 'INT', abr: 'NAT' },
  { nombre: 'Ocultismo',           atributo: 'INT', abr: 'OCU' },
  { nombre: 'Percepción',          atributo: 'SAB', abr: 'PER' },
  { nombre: 'Perspicacia',         atributo: 'SAB', abr: 'PSP' },
  { nombre: 'Persuasión',          atributo: 'CAR', abr: 'PSA' },
  { nombre: 'Religión',            atributo: 'INT', abr: 'REL' },
  { nombre: 'Sigilo',              atributo: 'DES', abr: 'SIG' },
  { nombre: 'Supervivencia',       atributo: 'SAB', abr: 'SUP' },
  { nombre: 'Trato con Animales',  atributo: 'SAB', abr: 'TAN' },
];

export const ATRIBUTOS_ABREVIADOS: Record<string, string> = {
  'FUE': 'fuerza',
  'DES': 'destreza',
  'CON': 'constitucion',
  'INT': 'inteligencia',
  'SAB': 'sabiduria',
  'CAR': 'carisma',
};

// ──────────────────────────────────────────────────────────
//  CONDICIONES
// ──────────────────────────────────────────────────────────

export const CONDICIONES_INFO: Record<CondicionEstado, {
  nombre: string;
  icono: string;
  color: string;
  glow: string;
  descripcion: string;
  esCritica: boolean;
}> = {
  ENVENENADO: {
    nombre: 'Envenenado',
    icono: 'Skull',
    color: '#39ff14',
    glow: 'shadow-[0_0_12px_#39ff14]',
    descripcion: 'Sufres daño de veneno cada turno.',
    esCritica: true,
  },
  ACELERADO: {
    nombre: 'Acelerado',
    icono: 'Zap',
    color: '#00f5ff',
    glow: 'shadow-[0_0_12px_#00f5ff]',
    descripcion: 'Velocidad duplicada, acción adicional.',
    esCritica: false,
  },
  CEGADO: {
    nombre: 'Cegado',
    icono: 'EyeOff',
    color: '#9b59b6',
    glow: 'shadow-[0_0_12px_#9b59b6]',
    descripcion: 'No puedes ver. Desventaja en ataques.',
    esCritica: true,
  },
  QUEMADO: {
    nombre: 'Quemado',
    icono: 'Flame',
    color: '#ff4500',
    glow: 'shadow-[0_0_12px_#ff4500]',
    descripcion: 'En llamas. Sufres daño de fuego.',
    esCritica: true,
  },
  ATURDIDO: {
    nombre: 'Aturdido',
    icono: 'AlertCircle',
    color: '#f39c12',
    glow: 'shadow-[0_0_12px_#f39c12]',
    descripcion: 'No puedes actuar este turno.',
    esCritica: true,
  },
  CONCENTRADO: {
    nombre: 'Concentrado',
    icono: 'Brain',
    color: '#3498db',
    glow: 'shadow-[0_0_12px_#3498db]',
    descripcion: 'Manteniendo concentración en un hechizo.',
    esCritica: false,
  },
  MALDITO: {
    nombre: 'Maldito',
    icono: 'Moon',
    color: '#8e44ad',
    glow: 'shadow-[0_0_12px_#8e44ad]',
    descripcion: 'Bajo los efectos de una maldición.',
    esCritica: true,
  },
  INVISIBLE: {
    nombre: 'Invisible',
    icono: 'Ghost',
    color: '#bdc3c7',
    glow: 'shadow-[0_0_12px_#bdc3c7]',
    descripcion: 'No puedes ser visto.',
    esCritica: false,
  },
  PARALIZADO: {
    nombre: 'Paralizado',
    icono: 'Lock',
    color: '#e74c3c',
    glow: 'shadow-[0_0_12px_#e74c3c]',
    descripcion: 'No puedes moverte ni actuar.',
    esCritica: true,
  },
  ASUSTADO: {
    nombre: 'Asustado',
    icono: 'AlertTriangle',
    color: '#e67e22',
    glow: 'shadow-[0_0_12px_#e67e22]',
    descripcion: 'Desventaja en ataques cerca de la fuente del miedo.',
    esCritica: false,
  },
};

export const CONDICIONES_CRITICAS: CondicionEstado[] = [
  'ENVENENADO', 'CEGADO', 'QUEMADO', 'ATURDIDO', 'MALDITO', 'PARALIZADO'
];

// ──────────────────────────────────────────────────────────
//  COLORES DE ACENTO
// ──────────────────────────────────────────────────────────

export const COLORES_ACENTO = [
  '#8b4513', '#ff003c', '#00f5ff', '#39ff14', '#ff6600',
  '#9b59b6', '#f39c12', '#3498db', '#e74c3c', '#1abc9c',
];

// ──────────────────────────────────────────────────────────
//  CLASES Y RAZAS
// ──────────────────────────────────────────────────────────

export const CLASES_PERSONAJE = [
  'Bárbaro', 'Bardo', 'Brujo', 'Clérigo', 'Druida',
  'Explorador', 'Guerrero', 'Hechicero', 'Mago', 'Monje',
  'Paladín', 'Pícaro',
  // Clases de la partida
  'Caballero Mágico', 'Cazador de Sombras', 'Invocador', 'Nigromante'
];

export const SUBCLASES_POR_CLASE: Record<string, string[]> = {
  'Guerrero':  ['Campeón', 'Maestro de Batalla', 'Caballero Arcano (Eldritch Knight)', 'Caballero Místico'],
  'Pícaro':    ['Ladrón', 'Asesino', 'Embaucador Arcano', 'Maestro del Alma'],
  'Mago':      ['Evocación', 'Ilusión', 'Nigromancia', 'Transmutación', 'Adivinación'],
  'Clérigo':   ['Vida', 'Luz', 'Guerra', 'Naturaleza', 'Muerte'],
  'Bárbaro':   ['Berserker', 'Tótem de Bestia', 'Corazón de Tormenta'],
  'Paladín':   ['Devoción', 'Venganza', 'Los Antiguos'],
  'Druida':    ['Círculo de la Luna', 'Círculo de la Tierra'],
  'Bardo':     ['Colegio del Conocimiento', 'Colegio del Valor'],
};

export const RAZAS_PERSONAJE = [
  'Humano', 'Elfo', 'Semilelfo', 'Enano', 'Mediano', 'Gnomo',
  'Semiorco', 'Tiefling', 'Dracónido', 'Aasimar',
  // Razas de la partida
  'Renacido (Gótico)', 'Cambiaformas', 'Githyanki',
];

export const ALINEAMIENTOS = [
  'Legal Bueno', 'Neutral Bueno', 'Caótico Bueno',
  'Legal Neutral', 'Neutral', 'Caótico Neutral',
  'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado',
];

// ──────────────────────────────────────────────────────────
//  TIPOS DE DAÑO D&D
// ──────────────────────────────────────────────────────────

export const TIPOS_DANIO = [
  'cortante', 'perforante', 'contundente',
  'fuego', 'frío', 'rayo', 'trueno',
  'ácido', 'veneno', 'necrótico', 'radiante',
  'psíquico', 'fuerza',
];

// ──────────────────────────────────────────────────────────
//  ICONOS PARA ACCIONES
// ──────────────────────────────────────────────────────────

export const ICONOS_ACCION = [
  'Sword', 'Zap', 'Shield', 'Flame', 'Snowflake', 'Wind',
  'Star', 'Moon', 'Sun', 'Crosshair', 'Target', 'Dagger',
  'Wand', 'Swords', 'Axe', 'Hammer', 'ArrowUp', 'Sparkles',
  'Eye', 'Ghost', 'Lock', 'Skull', 'Heart', 'Brain',
];
