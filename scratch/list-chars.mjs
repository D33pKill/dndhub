const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';

async function list() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/personajes?select=id,nombre`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });
  if (res.ok) {
    const data = await res.json();
    console.log('PERSONAJES ACTUALES EN SUPABASE:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error('Error fetching characters:', await res.text());
  }
}

list().catch(console.error);
