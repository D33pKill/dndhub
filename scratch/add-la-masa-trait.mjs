const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';
const LA_MASA_ID   = 'e79943ac-3365-412c-8ec6-9e855b905388';

async function run() {
  console.log('🔍 Obteniendo datos actuales de La Masa...');
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/personajes?id=eq.${LA_MASA_ID}`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });

  if (!getRes.ok) {
    console.error('❌ Error al obtener a La Masa:', await getRes.text());
    return;
  }

  const list = await getRes.json();
  if (list.length === 0) {
    console.error('❌ La Masa no encontrada.');
    return;
  }

  const laMasa = list[0];
  
  // Agregar desventaja
  const nuevasDesventajas = [...(laMasa.desventajas || [])];
  if (!nuevasDesventajas.includes('Ancla Psíquica: Desventaja contra Asustado si estás separado de tu arma vinculada.')) {
    nuevasDesventajas.push('Ancla Psíquica: Desventaja contra Asustado si estás separado de tu arma vinculada.');
  }

  // Agregar rasgo
  const nuevosRasgos = [...(laMasa.rasgos || [])];
  if (!nuevosRasgos.some(r => r.nombre.includes('Ancla Psíquica'))) {
    nuevosRasgos.push({
      id: 'rasgo-la-masa-3',
      nombre: 'Ancla Psíquica (Vínculo con el Arma)',
      descripcion: 'Tu arma es tu única seguridad. Si pasas más de 1 minuto separado de tu arma vinculada a más de 30 pies, entras en pánico y sufres desventaja en salvaciones contra el estado Asustado (Frightened) hasta que la invoques.'
    });
  }

  console.log('📝 Actualizando en Supabase...');
  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/personajes?id=eq.${LA_MASA_ID}`, {
    method: 'PATCH',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      desventajas: nuevasDesventajas,
      rasgos: nuevosRasgos
    })
  });

  if (patchRes.ok) {
    console.log('✅ Rasgo Ancla Psíquica añadido con éxito en Supabase!');
  } else {
    console.error('❌ Error al parchear los rasgos:', await patchRes.text());
  }
}

run().catch(console.error);
