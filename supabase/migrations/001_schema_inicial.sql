-- ============================================================
--  TTRPG HUD — Esquema inicial de base de datos
--  Proyecto: dndhud
--  Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA PRINCIPAL: personajes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.personajes (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          TEXT        NOT NULL,
  clase           TEXT        NOT NULL DEFAULT 'Guerrero',
  raza            TEXT        NOT NULL DEFAULT 'Humano',
  nivel           INTEGER     NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 20),
  color_acento    TEXT        NOT NULL DEFAULT '#ff003c',

  -- ── Vitales ──────────────────────────────────────────────
  hp              INTEGER     NOT NULL DEFAULT 100 CHECK (hp >= 0),
  hp_max          INTEGER     NOT NULL DEFAULT 100 CHECK (hp_max > 0),
  mana            INTEGER     NOT NULL DEFAULT 100 CHECK (mana >= 0),
  mana_max        INTEGER     NOT NULL DEFAULT 100 CHECK (mana_max > 0),
  estamina        INTEGER     NOT NULL DEFAULT 100 CHECK (estamina >= 0),
  estamina_max    INTEGER     NOT NULL DEFAULT 100 CHECK (estamina_max > 0),

  -- ── Estadísticas base (pentagon radar) ───────────────────
  estadisticas    JSONB       NOT NULL DEFAULT '{"COMBATE":50,"VIGOR":50,"MOVILIDAD":50,"CARISMA":50,"INTELECTO":50}',

  -- ── Sistema de condiciones ───────────────────────────────
  condiciones_activas  TEXT[] DEFAULT '{}',
  retrato_forzado      TEXT   DEFAULT NULL,
  destello_negro       BOOLEAN NOT NULL DEFAULT FALSE,
  fallo_magico         BOOLEAN NOT NULL DEFAULT FALSE,

  -- ── Retratos (data URLs base64 o URLs de Storage) ────────
  -- Formato: {"base":"data:image/...","herido":"...","afectado":"...","inconsciente":"...","en_zona":"...","shock":"..."}
  retratos        JSONB       NOT NULL DEFAULT '{}',

  -- ── Rasgos pasivos ───────────────────────────────────────
  ventajas        TEXT[]      DEFAULT '{}',
  desventajas     TEXT[]      DEFAULT '{}',

  -- ── Acciones personalizadas ──────────────────────────────
  -- Formato: [{"id":"uuid","nombre":"...","descripcion":"...","tipo":"ataque","danio":"2d6","cooldown":"1 turno"}]
  acciones        JSONB       NOT NULL DEFAULT '[]',

  -- ── Lore ─────────────────────────────────────────────────
  historia        TEXT        DEFAULT '',
  apariencia      TEXT        DEFAULT '',

  -- ── Metadatos ────────────────────────────────────────────
  conectado       BOOLEAN     DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_personajes_nombre     ON public.personajes (nombre);
CREATE INDEX IF NOT EXISTS idx_personajes_updated_at ON public.personajes (updated_at DESC);

-- ============================================================
-- TRIGGER: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_personajes_updated_at ON public.personajes;
CREATE TRIGGER trg_personajes_updated_at
  BEFORE UPDATE ON public.personajes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- (acceso abierto — la autenticación es gestionada por la app)
-- ============================================================
ALTER TABLE public.personajes ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "lectura_publica" ON public.personajes
  FOR SELECT USING (true);

-- Insertar sin autenticación (los jugadores crean su personaje)
CREATE POLICY "insertar_publico" ON public.personajes
  FOR INSERT WITH CHECK (true);

-- Actualizar sin autenticación (DM y jugadores pueden modificar)
CREATE POLICY "actualizar_publico" ON public.personajes
  FOR UPDATE USING (true) WITH CHECK (true);

-- Eliminar sin autenticación
CREATE POLICY "eliminar_publico" ON public.personajes
  FOR DELETE USING (true);

-- ============================================================
-- REALTIME — Habilitar para la tabla personajes
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.personajes;

-- ============================================================
-- STORAGE BUCKET: retratos (opcional, para imágenes externas)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'retratos',
  'retratos',
  true,
  5242880,  -- 5 MB por archivo
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas del bucket retratos
CREATE POLICY "retratos_lectura_publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'retratos');

CREATE POLICY "retratos_subir"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'retratos');

CREATE POLICY "retratos_actualizar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'retratos');

CREATE POLICY "retratos_eliminar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'retratos');
