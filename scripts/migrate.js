// Ejecuta la migración conectándose directamente a PostgreSQL de Supabase
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Pooler connection string
const DATABASE_URL = 'postgresql://postgres.jdjoxebegpqjaoptnkfm:Losurales2163%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '001_schema_inicial.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!\n');

    console.log('Ejecutando migración...');
    await client.query(sql);
    console.log('✅ ¡Migración ejecutada exitosamente!');
    console.log('   - Tabla personajes creada');
    console.log('   - RLS habilitado');
    console.log('   - Realtime activado');
    console.log('   - Bucket retratos creado');

  } catch (err) {
    console.error('Error con connection pooler:', err.message);
    
    // Intento con Transaction Pooler puerto 5432
    const client2 = new Client({
      host: 'db.jdjoxebegpqjaoptnkfm.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'Losurales2163@',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    
    try {
      console.log('\nIntentando conexión directa en puerto 5432...');
      await client2.connect();
      await client2.query(sql);
      console.log('✅ ¡Migración ejecutada via conexión directa!');
    } catch (err2) {
      console.error('Error conexión directa:', err2.message);
    } finally {
      await client2.end().catch(() => {});
    }
  } finally {
    await client.end().catch(() => {});
  }
}

main();
