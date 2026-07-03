// Ejecuta la migración usando @supabase/supabase-js con service role key
// Este script crea las tablas via una función auxiliar temporal

const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const SERVICE_KEY = 'sb_secret_r8KKNbH97kSBEJOObudRog_65PZTHj2';

const statements = [
  // Extensión
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  // Tabla principal
  `CREATE TABLE IF NOT EXISTS public.personajes (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          TEXT        NOT NULL,
    clase           TEXT        NOT NULL DEFAULT 'Guerrero',
    raza            TEXT        NOT NULL DEFAULT 'Humano',
    nivel           INTEGER     NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 20),
    color_acento    TEXT        NOT NULL DEFAULT '#ff003c',
    hp              INTEGER     NOT NULL DEFAULT 100 CHECK (hp >= 0),
    hp_max          INTEGER     NOT NULL DEFAULT 100 CHECK (hp_max > 0),
    mana            INTEGER     NOT NULL DEFAULT 100 CHECK (mana >= 0),
    mana_max        INTEGER     NOT NULL DEFAULT 100 CHECK (mana_max > 0),
    estamina        INTEGER     NOT NULL DEFAULT 100 CHECK (estamina >= 0),
    estamina_max    INTEGER     NOT NULL DEFAULT 100 CHECK (estamina_max > 0),
    estadisticas    JSONB       NOT NULL DEFAULT '{"COMBATE":50,"VIGOR":50,"MOVILIDAD":50,"CARISMA":50,"INTELECTO":50}',
    condiciones_activas  TEXT[] DEFAULT '{}',
    retrato_forzado      TEXT   DEFAULT NULL,
    destello_negro       BOOLEAN NOT NULL DEFAULT FALSE,
    fallo_magico         BOOLEAN NOT NULL DEFAULT FALSE,
    retratos        JSONB       NOT NULL DEFAULT '{}',
    ventajas        TEXT[]      DEFAULT '{}',
    desventajas     TEXT[]      DEFAULT '{}',
    acciones        JSONB       NOT NULL DEFAULT '[]',
    historia        TEXT        DEFAULT '',
    apariencia      TEXT        DEFAULT '',
    conectado       BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Índices
  `CREATE INDEX IF NOT EXISTS idx_personajes_nombre ON public.personajes (nombre)`,
  `CREATE INDEX IF NOT EXISTS idx_personajes_updated_at ON public.personajes (updated_at DESC)`,

  // Trigger función
  `CREATE OR REPLACE FUNCTION public.set_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  // Trigger
  `DROP TRIGGER IF EXISTS trg_personajes_updated_at ON public.personajes`,
  `CREATE TRIGGER trg_personajes_updated_at
     BEFORE UPDATE ON public.personajes
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`,

  // RLS
  `ALTER TABLE public.personajes ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS lectura_publica ON public.personajes`,
  `CREATE POLICY lectura_publica ON public.personajes FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS insertar_publico ON public.personajes`,
  `CREATE POLICY insertar_publico ON public.personajes FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS actualizar_publico ON public.personajes`,
  `CREATE POLICY actualizar_publico ON public.personajes FOR UPDATE USING (true) WITH CHECK (true)`,
  `DROP POLICY IF EXISTS eliminar_publico ON public.personajes`,
  `CREATE POLICY eliminar_publico ON public.personajes FOR DELETE USING (true)`,

  // Realtime
  `ALTER PUBLICATION supabase_realtime ADD TABLE public.personajes`,
];

async function runViaRPC(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  return { status: res.status, body: await res.text() };
}

// Supabase tiene un endpoint interno de query para el service role
async function runQuery(sql) {
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'X-Client-Info': 'supabase-js/2.0',
    },
    body: JSON.stringify({ query: sql }),
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  console.log('Probando endpoints...\n');
  
  // Probar si la tabla ya existe via REST
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/personajes?limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    }
  });
  
  console.log(`GET /personajes: ${checkRes.status}`);
  const checkBody = await checkRes.text();
  console.log(`Body: ${checkBody.slice(0, 200)}\n`);
  
  if (checkRes.status === 200) {
    console.log('✅ ¡La tabla personajes YA EXISTE y está accesible!');
    return;
  }
  
  if (checkRes.status === 404 || checkBody.includes('does not exist') || checkBody.includes('relation')) {
    console.log('❌ La tabla no existe. Necesita crearse via SQL Editor.');
    return;
  }
  
  console.log('Estado desconocido:', checkRes.status, checkBody);
}

main().catch(console.error);
