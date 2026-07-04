-- ============================================================
--  TTRPG HUD — Migración 002: Schema D&D 5e real
--  Ejecutar en: Supabase SQL Editor
--  Descripción: Reemplaza stats genéricos por atributos D&D 5e
-- ============================================================

-- ── Agregar nuevas columnas ───────────────────────────────
ALTER TABLE public.personajes
  ADD COLUMN IF NOT EXISTS subclase               TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS trasfondo              TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS alineamiento           TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS velocidad              INTEGER     NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS iniciativa             INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ca                     INTEGER     NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS ca_especial            INTEGER     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bonificador_competencia INTEGER    NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS bonificador_ataque     INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonificador_magia      INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dado_especial          TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estado_especial        BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS nombre_estado_especial TEXT        NOT NULL DEFAULT 'ESTADO ESPECIAL',
  ADD COLUMN IF NOT EXISTS habilidades            JSONB       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS salvaciones            JSONB       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rasgos                 JSONB       NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS equipo                 TEXT[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS idiomas                TEXT[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS personalidad           TEXT        NOT NULL DEFAULT '';

-- ── Eliminar columnas obsoletas ──────────────────────────
ALTER TABLE public.personajes
  DROP COLUMN IF EXISTS mana,
  DROP COLUMN IF EXISTS mana_max,
  DROP COLUMN IF EXISTS estamina,
  DROP COLUMN IF EXISTS estamina_max,
  DROP COLUMN IF EXISTS fallo_magico,
  DROP COLUMN IF EXISTS destello_negro;

-- ── Migrar estadisticas al nuevo formato D&D 5e ──────────
-- Sólo para filas que aún tengan el formato viejo (COMBATE, VIGOR, etc.)
UPDATE public.personajes
SET estadisticas = '{"fuerza":10,"destreza":10,"constitucion":10,"inteligencia":10,"sabiduria":10,"carisma":10}'
WHERE estadisticas ? 'COMBATE' OR estadisticas ? 'VIGOR';

-- ── Actualizar default de estadisticas ───────────────────
ALTER TABLE public.personajes
  ALTER COLUMN estadisticas
  SET DEFAULT '{"fuerza":10,"destreza":10,"constitucion":10,"inteligencia":10,"sabiduria":10,"carisma":10}';

-- ── Migrar acciones al nuevo formato (agregar campo estado) ──
-- Para filas existentes, marcar todas las acciones como 'normal'
UPDATE public.personajes
SET acciones = (
  SELECT jsonb_agg(
    a || jsonb_build_object(
      'estado', COALESCE(a->>'estado', 'normal'),
      'tirada_impactar', COALESCE(a->>'tirada_impactar', ''),
      'alcance', COALESCE(a->>'alcance', '5 pies'),
      'tipo_danio', COALESCE(a->>'tipo_danio', '')
    )
  )
  FROM jsonb_array_elements(acciones) AS a
)
WHERE jsonb_array_length(acciones) > 0;

-- ── Verificar ────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Migración 002 completada. Schema D&D 5e activo.';
END $$;
