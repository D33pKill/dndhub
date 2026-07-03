'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Personaje } from '@/types/character';
import {
  dbGetPersonajes,
  dbGetPersonaje,
  dbActualizarPersonaje,
  sincronizarDesdeSupabase,
} from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const LS_KEY = 'ttrpg_personajes';

// ═══════════════════════════════════════════════════════════
//  usePersonajes — Lista reactiva de todos los personajes
// ═══════════════════════════════════════════════════════════
export function usePersonajes() {
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  const cargar = useCallback(async () => {
    const data = await dbGetPersonajes();
    setPersonajes(data);
  }, []);

  useEffect(() => {
    // Carga inicial
    cargar();

    // Sincronizar con Supabase al montar
    sincronizarDesdeSupabase().then(cargar);

    if (isSupabaseConfigured && supabase) {
      // ── Suscripción Realtime de Supabase ──
      const channel = supabase
        .channel('personajes-all')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'personajes' },
          () => cargar()
        )
        .subscribe();

      channelRef.current = channel;
      return () => {
        supabase!.removeChannel(channel);
      };
    } else {
      // ── Fallback: localStorage storage event ──
      const handler = (e: StorageEvent) => {
        if (e.key === LS_KEY) cargar();
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  }, [cargar]);

  return { personajes, recargar: cargar };
}

// ═══════════════════════════════════════════════════════════
//  usePersonaje — Un personaje específico, reactivo
// ═══════════════════════════════════════════════════════════
export function usePersonaje(id: string) {
  const [personaje, setPersonaje] = useState<Personaje | null>(null);

  const cargar = useCallback(async () => {
    const data = await dbGetPersonaje(id);
    setPersonaje(data);
  }, [id]);

  useEffect(() => {
    cargar();

    if (isSupabaseConfigured && supabase) {
      // Suscripción específica al personaje por ID
      const channel = supabase
        .channel(`personaje-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'personajes',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            // Actualización directa sin fetch extra
            if (payload.eventType === 'DELETE') {
              setPersonaje(null);
            } else {
              setPersonaje(payload.new as Personaje);
            }
          }
        )
        .subscribe();

      return () => { supabase!.removeChannel(channel); };
    } else {
      const handler = (e: StorageEvent) => {
        if (e.key === LS_KEY) cargar();
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  }, [id, cargar]);

  const actualizar = useCallback(
    (cambios: Partial<Personaje>) => dbActualizarPersonaje(id, cambios),
    [id]
  );

  return { personaje, actualizar, recargar: cargar };
}
