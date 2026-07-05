const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';

async function deleteChars() {
  // 1. Borrar Valerius duplicado (ID antiguo: 612449ae-3118-410e-bf73-3bc93241e099)
  console.log('🗑 Borrando Valerius Vallis duplicado...');
  const resVal = await fetch(`${SUPABASE_URL}/rest/v1/personajes?id=eq.612449ae-3118-410e-bf73-3bc93241e099`, {
    method: 'DELETE',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });
  if (resVal.ok) {
    console.log('✅ Valerius duplicado borrado correctamente.');
  } else {
    console.error('❌ Error al borrar Valerius:', await resVal.text());
  }

  // 2. Borrar Kaelthas el Sombrío (ID: bb490bad-eac9-42fe-8078-fc8f49939f02)
  console.log('🗑 Borrando Kaelthas el Sombrío...');
  const resKael = await fetch(`${SUPABASE_URL}/rest/v1/personajes?id=eq.bb490bad-eac9-42fe-8078-fc8f49939f02`, {
    method: 'DELETE',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });
  if (resKael.ok) {
    console.log('✅ Kaelthas el Sombrío borrado correctamente.');
  } else {
    console.error('❌ Error al borrar Kaelthas:', await resKael.text());
  }
}

deleteChars().catch(console.error);
