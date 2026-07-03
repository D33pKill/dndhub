// Script para ejecutar la migración en Supabase vía REST API
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_r8KKNbH97kSBEJOObudRog_65PZTHj2';

const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '001_schema_inicial.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

async function runMigration() {
  console.log('🚀 Ejecutando migración en Supabase...\n');
  
  // Supabase expone un endpoint de query via pg-meta cuando se usa el service role
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // Intentar con el endpoint alternativo de Supabase
    const response2 = await fetch(`https://api.supabase.com/v1/projects/jdjoxebegpqjaoptnkfm/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const text2 = await response2.text();
    console.log('Respuesta API:', response2.status, text2);
    return;
  }

  const result = await response.text();
  console.log('✅ Migración completada:', result);
}

runMigration().catch(console.error);
