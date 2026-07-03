/**
 * Capa de base de datos unificada.
 * - Si Supabase está configurado → usa Supabase (Realtime + Storage)
 * - Si no → usa localStorage como fallback
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Personaje } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

const LS_KEY = 'ttrpg_personajes';

// ═══════════════════════════════════════════════════════════
//  UTILIDADES LOCALES
// ═══════════════════════════════════════════════════════════

function lsGetAll(): Personaje[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function lsSet(personajes: Personaje[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(personajes));
  // Disparar evento para sincronizar otras pestañas
  window.dispatchEvent(
    new StorageEvent('storage', { key: LS_KEY, newValue: JSON.stringify(personajes) })
  );
}

function lsNotify() {
  window.dispatchEvent(new StorageEvent('storage', { key: LS_KEY }));
}

// ═══════════════════════════════════════════════════════════
//  CONVERSIÓN DATA URL → File (para Storage)
// ═══════════════════════════════════════════════════════════
export function imagenADataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════════════════════════
//  UPLOAD DE RETRATO (Storage o base64 fallback)
// ═══════════════════════════════════════════════════════════
export async function subirRetrato(
  personajeId: string,
  estadoKey: string,
  file: File
): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${personajeId}/${estadoKey}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('retratos')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (!uploadError) {
      const { data } = supabase.storage
        .from('retratos')
        .getPublicUrl(path);
      // Añadir timestamp para busting de caché
      return `${data.publicUrl}?t=${Date.now()}`;
    }
    // Si falla Storage, caer a base64
    console.warn('Supabase Storage error, usando base64:', uploadError.message);
  }
  // Fallback: base64
  return imagenADataURL(file);
}

// ═══════════════════════════════════════════════════════════
//  CRUD PERSONAJES
// ═══════════════════════════════════════════════════════════

export async function dbGetPersonajes(): Promise<Personaje[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('personajes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) return data as Personaje[];
    console.warn('Supabase GET error, usando localStorage:', error?.message);
  }
  return lsGetAll();
}

export async function dbGetPersonaje(id: string): Promise<Personaje | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('personajes')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) return data as Personaje;
    console.warn('Supabase GET single error:', error?.message);
  }
  return lsGetAll().find(p => p.id === id) ?? null;
}

export async function dbCrearPersonaje(
  datos: Omit<Personaje, 'id' | 'ultimo_update' | 'conectado'>,
  explicitId?: string
): Promise<Personaje> {
  const id = explicitId ?? uuidv4();
  const ahora = new Date().toISOString();

  const nuevo: Personaje = {
    ...datos,
    id,
    conectado: true,
    ultimo_update: ahora,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('personajes')
      .insert([{
        id,
        nombre: nuevo.nombre,
        clase: nuevo.clase,
        raza: nuevo.raza,
        nivel: nuevo.nivel,
        color_acento: nuevo.color_acento,
        hp: nuevo.hp,
        hp_max: nuevo.hp_max,
        mana: nuevo.mana,
        mana_max: nuevo.mana_max,
        estamina: nuevo.estamina,
        estamina_max: nuevo.estamina_max,
        estadisticas: nuevo.estadisticas,
        condiciones_activas: nuevo.condiciones_activas,
        retrato_forzado: nuevo.retrato_forzado,
        destello_negro: nuevo.destello_negro,
        fallo_magico: nuevo.fallo_magico,
        retratos: nuevo.retratos,
        ventajas: nuevo.ventajas,
        desventajas: nuevo.desventajas,
        acciones: nuevo.acciones,
        historia: nuevo.historia,
        apariencia: nuevo.apariencia,
        conectado: true,
      }])
      .select()
      .single();

    if (!error && data) {
      // Guardar también en localStorage como caché
      const todos = lsGetAll();
      lsSet([data as Personaje, ...todos]);
      return data as Personaje;
    }
    console.warn('Supabase INSERT error, guardando en localStorage:', error?.message);
  }

  // Fallback localStorage
  const todos = lsGetAll();
  lsSet([nuevo, ...todos]);
  return nuevo;
}

export async function dbActualizarPersonaje(
  id: string,
  cambios: Partial<Personaje>
): Promise<Personaje | null> {
  // Actualizar localStorage inmediatamente para UI reactiva
  const todos = lsGetAll();
  const idx = todos.findIndex(p => p.id === id);

  if (idx !== -1) {
    todos[idx] = { ...todos[idx], ...cambios, ultimo_update: new Date().toISOString() };
    lsSet(todos);
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('personajes')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) return data as Personaje;
    console.warn('Supabase UPDATE error:', error?.message);
  }

  return idx !== -1 ? todos[idx] : null;
}

export async function dbEliminarPersonaje(id: string): Promise<void> {
  // Eliminar de localStorage
  const todos = lsGetAll().filter(p => p.id !== id);
  lsSet(todos);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('personajes')
      .delete()
      .eq('id', id);

    if (error) console.warn('Supabase DELETE error:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
//  SINCRONIZACIÓN INICIAL (Supabase → localStorage)
// ═══════════════════════════════════════════════════════════
export async function sincronizarDesdeSupabase(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const { data, error } = await supabase
    .from('personajes')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && data) {
    lsSet(data as Personaje[]);
    lsNotify();
  }
}

// ═══════════════════════════════════════════════════════════
//  UTILIDADES HEREDADAS (compatibilidad)
// ═══════════════════════════════════════════════════════════
export function derivarEstadoRetrato(personaje: Personaje): string {
  if (personaje.retrato_forzado) return personaje.retrato_forzado;
  if (personaje.hp <= 0) return 'inconsciente';
  if (personaje.fallo_magico) return 'shock';
  if (personaje.destello_negro) return 'en_zona';
  const criticas = ['ENVENENADO', 'CEGADO', 'QUEMADO', 'ATURDIDO', 'MALDITO', 'PARALIZADO'];
  if (personaje.condiciones_activas.some(c => criticas.includes(c))) return 'afectado';
  if (personaje.hp / personaje.hp_max < 0.4) return 'herido';
  return 'base';
}

export function porcentajeVida(actual: number, maximo: number): number {
  return Math.max(0, Math.min(100, (actual / maximo) * 100));
}
