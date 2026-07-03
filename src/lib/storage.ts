'use client';

import { Personaje } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'ttrpg_personajes';

export function getPersonajes(): Personaje[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getPersonaje(id: string): Personaje | null {
  const personajes = getPersonajes();
  return personajes.find(p => p.id === id) ?? null;
}

export function guardarPersonaje(personaje: Omit<Personaje, 'id' | 'ultimo_update' | 'conectado'>): Personaje {
  const personajes = getPersonajes();
  const nuevo: Personaje = {
    ...personaje,
    id: uuidv4(),
    conectado: true,
    ultimo_update: new Date().toISOString(),
  };
  personajes.push(nuevo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personajes));
  // Broadcast change
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(personajes) }));
  return nuevo;
}

export function actualizarPersonaje(id: string, cambios: Partial<Personaje>): Personaje | null {
  const personajes = getPersonajes();
  const idx = personajes.findIndex(p => p.id === id);
  if (idx === -1) return null;
  personajes[idx] = {
    ...personajes[idx],
    ...cambios,
    ultimo_update: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personajes));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(personajes) }));
  return personajes[idx];
}

export function eliminarPersonaje(id: string): void {
  const personajes = getPersonajes().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personajes));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(personajes) }));
}

export function imagenADataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function derivarEstadoRetrato(personaje: Personaje): string {
  if (personaje.retrato_forzado) return personaje.retrato_forzado;
  if (personaje.hp <= 0) return 'inconsciente';
  if (personaje.fallo_magico) return 'shock';
  if (personaje.destello_negro) return 'en_zona';
  const condicionesCriticas = ['ENVENENADO', 'CEGADO', 'QUEMADO', 'ATURDIDO', 'MALDITO', 'PARALIZADO'];
  if (personaje.condiciones_activas.some(c => condicionesCriticas.includes(c))) return 'afectado';
  if (personaje.hp / personaje.hp_max < 0.4) return 'herido';
  return 'base';
}

export function porcentajeVida(actual: number, maximo: number): number {
  return Math.max(0, Math.min(100, (actual / maximo) * 100));
}
