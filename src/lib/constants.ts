import { CondicionEstado } from '@/types/character';

export const DM_PASSWORD = 'urales2163';

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

export const COLORES_ACENTO = [
  '#ff003c', '#00f5ff', '#39ff14', '#ff6600', '#9b59b6',
  '#f39c12', '#3498db', '#e74c3c', '#1abc9c', '#e91e63'
];

export const CLASES_PERSONAJE = [
  'Guerrero', 'Mago', 'Pícaro', 'Clérigo', 'Paladín', 'Guardabosques',
  'Bárbaro', 'Bardo', 'Hechicero', 'Brujo', 'Monje', 'Druida',
  'Caballero Arcano', 'Cazador de Sombras', 'Invocador', 'Nigromante'
];

export const RAZAS_PERSONAJE = [
  'Humano', 'Elfo', 'Enano', 'Mediano', 'Gnomo', 'Semiorco',
  'Semielfo', 'Tiefling', 'Draconido', 'Aasimar', 'Cambiaformas', 'Githyanki'
];

export const ICONOS_ACCION = [
  'Sword', 'Zap', 'Shield', 'Flame', 'Snowflake', 'Wind',
  'Star', 'Moon', 'Sun', 'Crosshair', 'Target', 'Dagger',
  'Wand', 'Swords', 'Axe', 'Hammer', 'ArrowUp', 'Sparkles'
];
