/**
 * Script de prueba: inserta un personaje directamente en Supabase
 * para verificar que la BD y el HUD de selección funcionan.
 */

const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';

const personajePrueba = {
  nombre:          'Kaelthas el Sombrío',
  clase:           'Hechicero de Sangre',
  raza:            'Medio Elfo',
  nivel:           8,
  color_acento:    '#9a3030',
  hp:              68,
  hp_max:          80,
  mana:            110,
  mana_max:        130,
  estamina:        55,
  estamina_max:    70,
  estadisticas: {
    COMBATE:    45,
    VIGOR:      40,
    MOVILIDAD:  60,
    CARISMA:    75,
    INTELECTO:  88,
  },
  condiciones_activas: [],
  retrato_forzado:     null,
  destello_negro:      false,
  fallo_magico:        false,
  retratos:            {},
  ventajas:   ['Memoria arcana perfecta', 'Resistencia al fuego'],
  desventajas: ['Adicción al polvo de dragón', 'Pesadillas crónicas'],
  acciones: [
    {
      id:          'accion-1',
      nombre:      'Bola de Fuego',
      descripcion: 'Lanza una esfera ardiente que explota en un radio de 6m.',
      tipo:        'magia',
      danio:       '8d6 fuego',
      cooldown:    '1 turno',
    },
    {
      id:          'accion-2',
      nombre:      'Drenaje Vital',
      descripcion: 'Absorbe la fuerza vital del objetivo para recuperar maná.',
      tipo:        'habilidad',
      danio:       '3d8',
      cooldown:    '2 turnos',
    },
  ],
  historia:   'Nacido bajo una luna escarlata, Kaelthas descubrió su don arcano al quemar accidentalmente la biblioteca de su mentor. Desde entonces busca dominio sobre la magia de sangre para controlar el caos que reside en su interior.',
  apariencia: 'Cabello negro azabache, ojos carmesí que brillan levemente en la oscuridad. Lleva una túnica de cuero negro con runas grabadas en plata oxidada.',
  conectado:  true,
};

async function insertarPersonajePrueba() {
  console.log('⚔️  Insertando personaje de prueba en Supabase...\n');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/personajes`, {
    method: 'POST',
    headers: {
      'apikey':        ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
    },
    body: JSON.stringify(personajePrueba),
  });

  const body = await res.json();

  if (!res.ok) {
    console.error('❌ Error al insertar:', JSON.stringify(body, null, 2));
    process.exit(1);
  }

  const creado = Array.isArray(body) ? body[0] : body;
  console.log('✅ Personaje creado exitosamente!');
  console.log(`   ID:     ${creado.id}`);
  console.log(`   Nombre: ${creado.nombre}`);
  console.log(`   Clase:  ${creado.clase} · ${creado.raza} · Nv.${creado.nivel}`);
  console.log(`   HP:     ${creado.hp}/${creado.hp_max}`);
  console.log(`   Maná:   ${creado.mana}/${creado.mana_max}`);
  console.log('\n🎲 Ve a http://localhost:3000/jugador para verlo en la selección de personajes.');
  console.log('   Si el servidor no está corriendo, ejecuta: npm run dev');
}

insertarPersonajePrueba().catch(console.error);
