/**
 * Script para sembrar los personajes iniciales:
 * - La Masa (Fighter / Eldritch Knight)
 * - Iluso (Lirio) (Rogue / Thief)
 */

const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';

const personajes = [
  {
    nombre: 'La Masa',
    clase: 'Guerrero',
    subclase: 'Caballero Arcano (Eldritch Knight)',
    raza: 'Renacido (Gótico)',
    trasfondo: 'Cobaya Alquímica',
    alineamiento: 'Neutral',
    nivel: 1,
    color_acento: '#8b2020',
    hp: 12,
    hp_max: 12,
    ca: 18,
    ca_especial: 16,
    velocidad: 30,
    iniciativa: 0,
    bonificador_competencia: 2,
    bonificador_ataque: 5,
    bonificador_magia: 2,
    dado_especial: null,
    nombre_estado_especial: 'ESTADO ENOJADO',
    estadisticas: {
      fuerza: 16,
      destreza: 10,
      constitucion: 14,
      inteligencia: 14,
      sabiduria: 12,
      carisma: 8
    },
    habilidades: {
      "Atletismo": { "bonus": 5, "experto": false },
      "Arcana": { "bonus": 4, "experto": false },
      "Percepción": { "bonus": 3, "experto": false },
      "Intimidación": { "bonus": 1, "experto": false }
    },
    salvaciones: {
      "Fuerza": 5,
      "Constitución": 4
    },
    condiciones_activas: [],
    retrato_forzado: null,
    estado_especial: false,
    retratos: {
      base: '/la_masa_base.png'
    },
    ventajas: [
      'No necesitas respirar, comer, beber ni dormir.',
      'Ventaja en salvaciones contra veneno y muerte.',
      'La magia reemplaza tus fluidos vitales.'
    ],
    desventajas: [],
    rasgos: [
      {
        id: 'rasgo-la-masa-1',
        nombre: 'Renacido Gótico',
        descripcion: 'No necesitas respirar, comer, beber ni dormir. Tienes ventaja en salvaciones contra veneno y muerte. La magia reemplaza tus fluidos vitales.'
      },
      {
        id: 'rasgo-la-masa-2',
        nombre: 'Estado ENOJADO',
        descripcion: 'Puedes activar el estado ENOJADO como acción adicional. Dura 1 minuto o hasta que quedes inconsciente. Mientras estás enojado: ventaja en pruebas y salvaciones de Fuerza, resistencia a daño contundente, cortante y perforante no mágico. El daño aumenta en +2. Tirada para impactar: 1d20 + 7. CA se reduce a 16.'
      }
    ],
    acciones: [
      {
        id: 'la-masa-atk-1',
        nombre: 'Espadazo',
        descripcion: 'Ataque básico con mandoble.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+5',
        alcance: '5 pies',
        danio: '2d6+3',
        tipo_danio: 'cortante',
        estado: 'normal'
      },
      {
        id: 'la-masa-atk-2',
        nombre: 'Golpe Brutal',
        descripcion: 'El objetivo debe superar Salv. de Fuerza CD 13 o es empujado 5 pies.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+5',
        alcance: '5 pies',
        danio: '2d6+3',
        tipo_danio: 'contundente',
        estado: 'normal'
      },
      {
        id: 'la-masa-atk-3',
        nombre: 'Embestida',
        descripcion: 'Si impacta, el objetivo hace Salv. de Fuerza CD 13 o queda prono. (Requiere moverse al menos 20 pies)',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+5',
        alcance: '10 pies',
        danio: '2d6+3',
        tipo_danio: 'contundente',
        estado: 'normal'
      },
      {
        id: 'la-masa-atk-4',
        nombre: 'Golpe Ascendente',
        descripcion: 'Si el objetivo falla Salv. de Constitución CD 13, no puede usar reacciones hasta su siguiente turno.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+5',
        alcance: '5 pies',
        danio: '1d12+3',
        tipo_danio: 'contundente',
        estado: 'normal'
      },
      {
        id: 'la-masa-atk-5',
        nombre: 'Espadazo Frenético',
        descripcion: 'Puede hacer un segundo ataque contra otro enemigo a 5 pies (1 vez por combate).',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+7',
        alcance: '5 pies',
        danio: '2d6+5',
        tipo_danio: 'cortante',
        estado: 'especial'
      },
      {
        id: 'la-masa-atk-6',
        nombre: 'Aplastamiento',
        descripcion: 'Salv. de Fuerza CD 15 o queda prono.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+7',
        alcance: '5 pies',
        danio: '3d6+5',
        tipo_danio: 'contundente',
        estado: 'especial'
      },
      {
        id: 'la-masa-atk-7',
        nombre: 'Carga Descontrolada',
        descripcion: 'Si impacta, empuja 10 pies y derriba al objetivo si falla Salv. de Fuerza CD 15.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+7',
        alcance: '20 pies',
        danio: '3d6+5',
        tipo_danio: 'contundente',
        estado: 'especial'
      },
      {
        id: 'la-masa-atk-8',
        nombre: 'Golpe Devastador',
        descripcion: 'Todas las criaturas a 5 pies del objetivo reciben 1d6 de daño contundente por la onda del impacto.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '1d20+7',
        alcance: '5 pies',
        danio: '4d6+5',
        tipo_danio: 'contundente',
        cooldown: 'Recarga 5-6',
        estado: 'especial'
      }
    ],
    equipo: ['Mandoble', 'Armadura de Placas oxidada'],
    idiomas: ['Común'],
    historia: 'Un experimento alquímico fallido donde un guerrero muerto fue reanimado con fluidos extraños. Sus venas bombean magia inestable y fluidos viscosos que reaccionan con su furia.',
    apariencia: 'Un imponente guerrero embutido en una armadura pesada corroída, de cuyas juntas rezuma un denso fluido verde alquímico que resplandece levemente.',
    personalidad: 'Pocas palabras, impulsado por una furia fría y la necesidad de comprender qué fue antes de convertirse en este ser.',
    conectado: true
  },
  {
    nombre: 'Iluso (Lirio)',
    clase: 'Pícaro',
    subclase: 'Ladrón',
    raza: 'Humano',
    trasfondo: 'Noble',
    alineamiento: 'Neutral',
    nivel: 3,
    color_acento: '#9b59b6',
    hp: 24,
    hp_max: 24,
    ca: 16,
    ca_especial: null,
    velocidad: 30,
    iniciativa: 4,
    bonificador_competencia: 2,
    bonificador_ataque: 6,
    bonificador_magia: 0,
    dado_especial: '2d6',
    nombre_estado_especial: 'ECO ARCANO',
    estadisticas: {
      fuerza: 8,
      destreza: 18,
      constitucion: 12,
      inteligencia: 16,
      sabiduria: 14,
      carisma: 16
    },
    habilidades: {
      "Acrobacias": { "bonus": 8, "experto": true },
      "Juego de Manos": { "bonus": 8, "experto": true },
      "Sigilo": { "bonus": 8, "experto": true },
      "Investigación": { "bonus": 5, "experto": false },
      "Percepción": { "bonus": 4, "experto": false },
      "Persuasión": { "bonus": 5, "experto": false },
      "Engaño": { "bonus": 7, "experto": true },
      "Interpretación": { "bonus": 5, "experto": false },
      "Perspicacia": { "bonus": 4, "experto": false }
    },
    salvaciones: {
      "Destreza": 6,
      "Inteligencia": 5
    },
    condiciones_activas: [],
    retrato_forzado: null,
    estado_especial: false,
    retratos: {
      base: '/iluso_base.png'
    },
    ventajas: [
      'Ventaja en Engaño para hacerse pasar por otra persona.',
      'Ventaja para escapar de agarres y abrir cerraduras.',
      'Ventaja en Interpretación cuando adopta un personaje.'
    ],
    desventajas: [],
    rasgos: [
      {
        id: 'rasgo-iluso-1',
        nombre: 'Experto del disfraz',
        descripcion: 'Tiene ventaja en pruebas de Engaño para hacerse pasar por otra persona.'
      },
      {
        id: 'rasgo-iluso-2',
        nombre: 'Maestro del escapismo',
        descripcion: 'Tiene ventaja para escapar de agarres y abrir cerraduras.'
      },
      {
        id: 'rasgo-iluso-3',
        nombre: 'Actor nato',
        descripcion: 'Ventaja en Interpretación cuando adopta un personaje.'
      },
      {
        id: 'rasgo-iluso-4',
        nombre: 'Eco Arcano',
        descripcion: 'No es magia convencional. Puede utilizar cualquiera de sus dos habilidades (Teletransporte o Telequinesis) un total de 2 veces por descanso corto. Después del segundo uso antes de descansar, debe superar una salvación de Constitución CD 13 o recibir 1 nivel de agotamiento.'
      }
    ],
    acciones: [
      {
        id: 'iluso-atk-1',
        nombre: 'Daga',
        descripcion: 'Ataque básico cuerpo a cuerpo o a distancia. Puede desenfundar como interacción gratuita.',
        tipo: 'ataque',
        icono: 'Dagger',
        tirada_impactar: '+6',
        alcance: '5 pies / 20-60',
        danio: '1d4+4',
        tipo_danio: 'perforante',
        estado: 'ambos'
      },
      {
        id: 'iluso-atk-2',
        nombre: 'Cuchillo arrojadizo',
        descripcion: 'Lanzamiento de cuchillo a distancia.',
        tipo: 'ataque',
        icono: 'Dagger',
        tirada_impactar: '+6',
        alcance: '20/60 pies',
        danio: '1d4+4',
        tipo_danio: 'perforante',
        estado: 'ambos'
      },
      {
        id: 'iluso-atk-3',
        nombre: 'Bastón oculto',
        descripcion: 'Ataque contundente con bastón. Oculta una daga en su interior.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '+6',
        alcance: '5 pies',
        danio: '1d6+4',
        tipo_danio: 'contundente',
        estado: 'ambos'
      },
      {
        id: 'iluso-habilidad-1',
        nombre: 'Ataque Furtivo',
        descripcion: 'Añade 2d6 una vez por turno al golpear a un enemigo si tiene ventaja o si hay un aliado a 5 pies de él.',
        tipo: 'habilidad',
        icono: 'Target',
        cooldown: '1/turno',
        estado: 'ambos'
      },
      {
        id: 'iluso-bonus-1',
        nombre: 'Acción Astuta',
        descripcion: 'Permite Desplazarse, Esconderse o Retirarse como acción adicional.',
        tipo: 'bonus',
        icono: 'Wind',
        estado: 'ambos'
      },
      {
        id: 'iluso-bonus-2',
        nombre: 'Teletransporte (Eco Arcano)',
        descripcion: 'Acción adicional. Teletranspórtate hasta 15 pies a un lugar visible sin provocar ataques de oportunidad.',
        tipo: 'bonus',
        icono: 'Ghost',
        cooldown: '2/descanso',
        estado: 'ambos'
      },
      {
        id: 'iluso-habilidad-2',
        nombre: 'Telequinesis (Eco Arcano)',
        descripcion: 'Acción. Mueve un objeto de hasta 50g a 30 pies. Útil para ganzúas, llaves o activar mecanismos lejanos.',
        tipo: 'habilidad',
        icono: 'Brain',
        cooldown: '2/descanso',
        estado: 'ambos'
      }
    ],
    equipo: [
      'Bastón con daga oculta',
      'Daga envenenada',
      '6 cuchillos arrojadizos',
      'Herramientas de ladrón / Ganzúas',
      'Kit de disfraz',
      'Baraja de cartas',
      'Máscara encantada',
      'Reloj de plata de bolsillo',
      'Mechero y alcohol',
      'Veneno Paralizante (3 dosis. CD 13 CON, tras 1 min paraliza 1 min)'
    ],
    idiomas: ['Común', 'Élfico', 'Idioma noble adicional'],
    historia: 'De origen noble, Lirio adoptó el alias de Iluso tras el trágico asesinato de su familia. Es un sobreviviente astuto en búsqueda de la verdad de los fragmentos de alma y venganza.',
    apariencia: 'Ropa elegante de sastre pero adaptada a la vida en los callejones. Siempre cubre su rostro con una máscara de filigrana plateada.',
    personalidad: 'Ideal: "El destino no decide quién soy." Vínculo: Vengar a su familia y resolver el misterio de su magia.',
    conectado: true
  }
];

async function insertarPersonajes() {
  console.log('⚔️  Insertando personajes de D&D 5e en Supabase...\n');

  for (const personaje of personajes) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/personajes`, {
      method: 'POST',
      headers: {
        'apikey':        ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
      body: JSON.stringify(personaje),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error al insertar a ${personaje.nombre}:`, errorText);
      console.log('Intenta asegurarte de haber aplicado la migración SQL 002.');
      process.exit(1);
    }

    const creado = await res.json();
    console.log(`✅ Creado: ${creado[0].nombre} (ID: ${creado[0].id})`);
  }

  console.log('\n🎲 ¡Proceso finalizado! Los personajes ya están disponibles.');
}

insertarPersonajes().catch(console.error);
