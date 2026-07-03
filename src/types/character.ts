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

export interface EstadisticasBase {
  COMBATE: number;
  VIGOR: number;
  MOVILIDAD: number;
  CARISMA: number;
  INTELECTO: number;
}

export interface AccionPersonaje {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'ataque' | 'magia' | 'reaccion' | 'habilidad';
  icono: string; // lucide icon name
  danio?: string;
  cooldown?: string;
}

export interface Retrato {
  base: string;
  herido: string;
  afectado: string;
  inconsciente: string;
  en_zona: string;
  shock: string;
}

export interface Personaje {
  id: string;
  nombre: string;
  clase: string;
  raza: string;
  nivel: number;
  // Vitales
  hp: number;
  hp_max: number;
  mana: number;
  mana_max: number;
  estamina: number;
  estamina_max: number;
  // Estadísticas radar
  estadisticas: EstadisticasBase;
  // Sistema de condiciones
  condiciones_activas: CondicionEstado[];
  retrato_forzado: EstadoRetrato | null; // DM puede forzar un estado
  destello_negro: boolean;
  fallo_magico: boolean;
  // Retratos
  retratos: Partial<Retrato>;
  // Rasgos pasivos
  ventajas: string[];
  desventajas: string[];
  // Acciones personalizadas
  acciones: AccionPersonaje[];
  // Lore
  historia: string;
  apariencia: string;
  // Conexión
  conectado: boolean;
  ultimo_update: string;
  // Color acento del jugador
  color_acento: string;
}

export interface EstadoDM {
  password_verificada: boolean;
}

export interface LogAccion {
  id: string;
  timestamp: string;
  tipo: 'stat' | 'condicion' | 'retrato' | 'estado';
  descripcion: string;
  personaje_id: string;
  personaje_nombre: string;
}
