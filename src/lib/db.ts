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
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(personajes));
    // Disparar evento para sincronizar otras pestañas
    window.dispatchEvent(
      new StorageEvent('storage', { key: LS_KEY, newValue: JSON.stringify(personajes) })
    );
  } catch (e) {
    // Si falla (quota), intentar limpiar y notificar igualmente
    console.warn('localStorage write failed:', e);
    lsNotify();
  }
}

/**
 * Guarda en localStorage omitting los retratos base64 (pueden ser muy grandes).
 * Las URLs de Supabase Storage son strings cortos y se pueden guardar sin problema.
 * Los data: URLs (base64) se descartan para evitar QuotaExceededError.
 */
function lsSetSafe(personajes: Personaje[]) {
  const limpios = personajes.map(p => ({
    ...p,
    retratos: Object.fromEntries(
      Object.entries(p.retratos ?? {}).map(([k, v]) => [
        k,
        // Conservar URLs de Supabase Storage; descartar data:image base64
        typeof v === 'string' && v.startsWith('data:') ? '' : v,
      ])
    ),
  }));
  lsSet(limpios);
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
      return `${data.publicUrl}?t=${Date.now()}`;
    }
    console.warn('Supabase Storage error, usando base64:', uploadError.message);
  }
  return imagenADataURL(file);
}

// ═══════════════════════════════════════════════════════════
//  VALORES POR DEFECTO
// ═══════════════════════════════════════════════════════════
export function defaultPersonaje(): Omit<Personaje, 'id' | 'ultimo_update' | 'conectado'> {
  return {
    nombre: '',
    clase: 'Guerrero',
    subclase: '',
    raza: 'Humano',
    trasfondo: '',
    alineamiento: 'Neutral',
    nivel: 1,
    color_acento: '#8b4513',
    hp: 10,
    hp_max: 10,
    ca: 10,
    ca_especial: null,
    velocidad: 30,
    iniciativa: 0,
    bonificador_competencia: 2,
    bonificador_ataque: 0,
    bonificador_magia: 0,
    dado_especial: null,
    estadisticas: {
      fuerza: 10,
      destreza: 10,
      constitucion: 10,
      inteligencia: 10,
      sabiduria: 10,
      carisma: 10,
    },
    habilidades: {},
    salvaciones: {},
    condiciones_activas: [],
    retrato_forzado: null,
    estado_especial: false,
    nombre_estado_especial: 'ESTADO ESPECIAL',
    retratos: {},
    ventajas: [],
    desventajas: [],
    rasgos: [],
    acciones: [],
    equipo: [],
    idiomas: [],
    historia: '',
    apariencia: '',
    personalidad: '',
  };
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
    const payload = {
      id,
      nombre:                  nuevo.nombre,
      clase:                   nuevo.clase,
      subclase:                nuevo.subclase,
      raza:                    nuevo.raza,
      trasfondo:               nuevo.trasfondo,
      alineamiento:            nuevo.alineamiento,
      nivel:                   nuevo.nivel,
      color_acento:            nuevo.color_acento,
      hp:                      nuevo.hp,
      hp_max:                  nuevo.hp_max,
      ca:                      nuevo.ca,
      ca_especial:             nuevo.ca_especial,
      velocidad:               nuevo.velocidad,
      iniciativa:              nuevo.iniciativa,
      bonificador_competencia: nuevo.bonificador_competencia,
      bonificador_ataque:      nuevo.bonificador_ataque,
      bonificador_magia:       nuevo.bonificador_magia,
      dado_especial:           nuevo.dado_especial,
      estadisticas:            nuevo.estadisticas,
      habilidades:             nuevo.habilidades,
      salvaciones:             nuevo.salvaciones,
      condiciones_activas:     nuevo.condiciones_activas,
      retrato_forzado:         nuevo.retrato_forzado,
      estado_especial:         nuevo.estado_especial,
      nombre_estado_especial:  nuevo.nombre_estado_especial,
      retratos:                nuevo.retratos,
      ventajas:                nuevo.ventajas,
      desventajas:             nuevo.desventajas,
      rasgos:                  nuevo.rasgos,
      acciones:                nuevo.acciones,
      equipo:                  nuevo.equipo,
      idiomas:                 nuevo.idiomas,
      historia:                nuevo.historia,
      apariencia:              nuevo.apariencia,
      personalidad:            nuevo.personalidad,
      conectado:               true,
    };

    const { data, error } = await supabase
      .from('personajes')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      // Guardar en localStorage como caché ligero (sin imágenes base64)
      const todos = lsGetAll();
      lsSetSafe([data as Personaje, ...todos]);
      return data as Personaje;
    }
    console.warn('Supabase INSERT error, guardando en localStorage:', error?.message);
  }

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
    // Usar lsSetSafe para no almacenar base64 de retratos y evitar QuotaExceededError
    lsSetSafe(todos);
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
//  SINCRONIZACIÓN INICIAL
// ═══════════════════════════════════════════════════════════
export async function sincronizarDesdeSupabase(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const { data, error } = await supabase
    .from('personajes')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && data) {
    // Sincronizar sin imágenes base64 para no llenar localStorage
    lsSetSafe(data as Personaje[]);
    lsNotify();
  }
}

// ═══════════════════════════════════════════════════════════
//  UTILIDADES DE ESTADO
// ═══════════════════════════════════════════════════════════
export function derivarEstadoRetrato(personaje: Personaje): string {
  if (personaje.retrato_forzado) return personaje.retrato_forzado;
  if (personaje.hp <= 0) return 'inconsciente';
  if (personaje.estado_especial) return 'en_zona';
  const criticas = ['ENVENENADO', 'CEGADO', 'QUEMADO', 'ATURDIDO', 'MALDITO', 'PARALIZADO'];
  if (personaje.condiciones_activas.some(c => criticas.includes(c))) return 'afectado';
  if (personaje.hp / personaje.hp_max < 0.4) return 'herido';
  return 'base';
}

export function porcentajeVida(actual: number, maximo: number): number {
  return Math.max(0, Math.min(100, (actual / maximo) * 100));
}
