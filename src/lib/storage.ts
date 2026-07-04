'use client';

import { Personaje } from '@/types/character';
import { defaultPersonaje, dbGetPersonajes, dbGetPersonaje, dbCrearPersonaje, dbActualizarPersonaje, dbEliminarPersonaje, derivarEstadoRetrato, porcentajeVida } from './db';

// Re-exportar las funciones unificadas de db.ts para mantener compatibilidad si se usaran en algún sitio
export {
  dbGetPersonajes as getPersonajes,
  dbGetPersonaje as getPersonaje,
  dbCrearPersonaje as guardarPersonaje,
  dbActualizarPersonaje as actualizarPersonaje,
  dbEliminarPersonaje as eliminarPersonaje,
  derivarEstadoRetrato,
  porcentajeVida
};
