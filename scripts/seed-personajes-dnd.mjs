/**
 * Script para sembrar los personajes iniciales:
 * - La Masa (Fighter / Eldritch Knight)
 * - Iluso (Lirio) (Rogue / Thief)
 * - Valerius Vallis (Sorcerer / Wild Magic)
 * - Morgan Nurthe (Caballero / Berserker)
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
    historia: `ACTO I: EL HUEVO DE ALQUIMIA Y EL NACIMIENTO INTERRUMPIDO
En los anales de la alta nobleza de la Casa Vanderbort, la perfección de la línea sucesoria lo era todo. Los magos de la corte predijeron el nacimiento de un heredero definitivo: un catalizador vivo de magia y acero, el Caballero Arcano perfecto. El ritual requería gestar al feto dentro de un útero infundido con mercurio, polvo de runas y sangre de demonio.

Pero la ambición engendra traición. Una facción rival saboteó el receptáculo. El útero mágico fue rajado antes de tiempo. El ser nació a los cinco meses de gestación: una masa ciega, translúcida, de pulmones colapsados que chillaba sin aire. No lo dejaron morir. Los magos amarraron su alma agonizante a su cuerpo deforme usando hilos de nigromancia y abjuración. Se convirtió en un "Gólem de carne viva". Su rostro y sus órganos internos jamás maduraron —siguiendo las facciones de un feto prematuro—, pero la magia forzó a sus músculos, huesos y tendones a estirarse y endurecerse hasta alcanzar el tamaño de un hombre adulto. Un cascarón de guerrero con el interior de un aborto.

ACTO II: EL HARÉN DE LAS BESTIAS Y LA TORTURA DE SALÓN
Para la alta alcurnia, no era una persona; era una propiedad, un monstruo exótico. Fue confinado a los sótanos de placer de los palacios de la nobleza. Allí, durante años, se combinó el sadismo refinado con la perversión. 

Los nobles utilizaban su cuerpo deforme y superdesarrollado para sus vicios más oscuros. Fue objeto de abusos sexuales sistemáticos, humillaciones públicas en banquetes privados donde lo vestían con sedas sobre su piel purulenta, y experimentos de dolor donde los magos probaban conjuros de quemadura interna en sus órganos de feto para ver cuánto podía resistir la magia que lo mantenía vivo. Su incontinencia y sus espasmos eran el chiste de la corte; lo obligaban a pelear en la arena del sótano cubierto en sus propios fluidos y desechos.

Sin embargo, los nobles cometieron un error fatal. Al usar conjuros de descarga y energía arcana para torturarlo, su mente retorcida y hambrienta empezó a "absorber" los axiomas de la magia. Su hiperenfoque, nacido del trauma puro, le permitió descifrar los componentes de los hechizos de sus torturadores. Aprendió a canalizar la magia a través del dolor.

ACTO III: EL DESGARRO Y LA FUGA
La noche del escape no hubo sutileza. Durante una de las orgías de la corte, donde estaba encadenado como una atracción de circo, logró canalizar la energía de los abusos recibidos para conjurar su primer Vínculo con el Arma. Una pesada espada de verdugo guardada en la pared voló directamente a sus manos rotas.

La masacre duró hasta el amanecer. Los pasillos de mármol se tiñeron del rojo de la sangre noble y del icor rancio que secretaba su propio cuerpo descontrolado. No dejó a nadie vivo en ese ala del palacio. Huyó a las alcantarillas, cubriéndose con una armadura de placas pesada para ocultar la vergüenza de su piel fetal y contener las funciones de un cuerpo que se niega a sanar.`,
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
  },
  {
    nombre: 'Valerius Vallis ("Ceniza" / "Barón")',
    clase: 'Hechicero',
    subclase: 'Magia Salvaje',
    raza: 'Tiflin (Mephistopheles)',
    trasfondo: 'Noble Caído / Paria Urbano',
    alineamiento: 'Caótico Neutral',
    nivel: 3,
    color_acento: '#d35400',
    hp: 20,
    hp_max: 20,
    ca: 12,
    ca_especial: null,
    velocidad: 30,
    iniciativa: 2,
    bonificador_competencia: 2,
    bonificador_ataque: 6,
    bonificador_magia: 6,
    dado_especial: null,
    nombre_estado_especial: 'MAREAS DE CAOS',
    estadisticas: {
      fuerza: 8,
      destreza: 14,
      constitucion: 14,
      inteligencia: 11,
      sabiduria: 10,
      carisma: 18
    },
    habilidades: {
      "Arcana": { "bonus": 2, "experto": false },
      "Historia": { "bonus": 2, "experto": false },
      "Engaño": { "bonus": 6, "experto": false },
      "Intimidación": { "bonus": 6, "experto": false }
    },
    salvaciones: {
      "Constitución": 4,
      "Carisma": 6
    },
    condiciones_activas: [],
    retrato_forzado: null,
    estado_especial: false,
    retratos: {
      base: '/valerius_base.jpg'
    },
    ventajas: [
      'Visión en la Oscuridad (60 pies).',
      'Resistencia Infernal (mitad de daño de Fuego).',
      'Mareas de Caos: 1 vez al día ganas ventaja en un dado.'
    ],
    desventajas: [],
    rasgos: [
      {
        id: 'rasgo-valerius-1',
        nombre: 'Legado de Cania',
        descripcion: 'Conoces el truco Mano de Mago. Puedes lanzar Manos Ardientes (Nivel 2) una vez por descanso largo sin gastar espacio de conjuro.'
      },
      {
        id: 'rasgo-valerius-2',
        nombre: 'Oleada de Magia Salvaje',
        descripcion: 'Tras lanzar un hechizo de nivel 1 o superior, el DM puede pedir 1d20. Si sale 1, la magia se descontrola en la Tabla de Magia Salvaje.'
      },
      {
        id: 'rasgo-valerius-3',
        nombre: 'Mareas de Caos',
        descripcion: '1 vez por descanso largo, ganas Ventaja en un dado. El DM puede forzar una Oleada de Magia Salvaje después para recargarlo.'
      },
      {
        id: 'rasgo-valerius-4',
        nombre: 'Metamagia',
        descripcion: 'Puntos de Hechicería: 3. Opciones: Hechizo Sutil (1 pto, sin componentes verbales/somáticos) o Hechizo Gemelo (X ptos, afecta a dos objetivos).'
      }
    ],
    acciones: [
      {
        id: 'valerius-atk-1',
        nombre: 'Descarga de Fuego (Fire Bolt)',
        descripcion: 'Lanza una chispa ardiente a distancia.',
        tipo: 'ataque',
        icono: 'Flame',
        tirada_impactar: '+6',
        alcance: '120 pies',
        danio: '1d10',
        tipo_danio: 'fuego',
        estado: 'ambos'
      },
      {
        id: 'valerius-atk-2',
        nombre: 'Frustrar Virote (Mind Sliver)',
        descripcion: 'Lanza un virote de energía psíquica. El objetivo debe superar Salv. de Inteligencia CD 14 o recibir daño y restar 1d4 a su próxima salvación.',
        tipo: 'magia',
        icono: 'Brain',
        tirada_impactar: 'CD 14 INT',
        alcance: '60 pies',
        danio: '1d6',
        tipo_danio: 'psíquico',
        estado: 'ambos'
      },
      {
        id: 'valerius-magia-1',
        nombre: 'Mano de Mago',
        descripcion: 'Invoca una mano espectral invisible para manipular objetos ligeros hasta a 30 pies.',
        tipo: 'magia',
        icono: 'Wand',
        estado: 'ambos'
      },
      {
        id: 'valerius-magia-2',
        nombre: 'Ilusión Menor',
        descripcion: 'Crea una imagen o sonido ilusorio a 30 pies durante 1 minuto.',
        tipo: 'magia',
        icono: 'Sparkles',
        estado: 'ambos'
      },
      {
        id: 'valerius-magia-3',
        nombre: 'Prestidigitación',
        descripcion: 'Efectos mágicos e ilusiones menores ilimitadas en un rango corto.',
        tipo: 'magia',
        icono: 'Sparkles',
        estado: 'ambos'
      },
      {
        id: 'valerius-reaccion-1',
        nombre: 'Escudo (Shield)',
        descripcion: 'Reacción al recibir un ataque. Suma +5 a tu CA temporalmente y anula Proyectil Mágico.',
        tipo: 'reaccion',
        icono: 'Shield',
        estado: 'ambos'
      },
      {
        id: 'valerius-magia-4',
        nombre: 'Dormir (Sleep)',
        descripcion: 'Lanza un hechizo de control. Afecta y duerme criaturas por un total de 5d8 HP en área sin salvación.',
        tipo: 'magia',
        icono: 'Moon',
        estado: 'ambos'
      },
      {
        id: 'valerius-atk-3',
        nombre: 'Manos Ardientes (Nvl 2)',
        descripcion: 'Lanza un cono de fuego de 15 pies. 1 vez al día gratis por Legado de Cania.',
        tipo: 'ataque',
        icono: 'Flame',
        tirada_impactar: 'CD 14 DES',
        alcance: 'Cono 15 pies',
        danio: '4d6',
        tipo_danio: 'fuego',
        estado: 'ambos'
      },
      {
        id: 'valerius-atk-4',
        nombre: 'Abrasamiento de Aganazzar',
        descripcion: 'Lanza una línea de llamas de 30 pies.',
        tipo: 'ataque',
        icono: 'Flame',
        tirada_impactar: 'CD 14 DES',
        alcance: 'Línea 30 pies',
        danio: '3d8',
        tipo_danio: 'fuego',
        estado: 'ambos'
      },
      {
        id: 'valerius-magia-5',
        nombre: 'Inmovilizar Persona',
        descripcion: 'Paraliza por completo a un humanoide a 60 pies si falla Salv. de Sabiduría CD 14.',
        tipo: 'magia',
        icono: 'Lock',
        estado: 'ambos'
      }
    ],
    equipo: [
      'Daga fina (1d4+2 perforante | Sutileza, lanzar)',
      'Anillo Sello de la Familia Vallis (Foco Arcano)',
      'Ropa fina desgastada con capucha',
      'Paquete de erudito (libro, tinta, pluma)',
      'Monedas: 15 PO'
    ],
    idiomas: ['Común', 'Élfico', 'Infernal'],
    historia: 'Nacido en el alto distrito dentro de la prestigiosa familia Vallis, la vida de Valerius cambió drásticamente a los 18 años al despertar su indómita magia salvaje. Descubrió que su propio padre lo había ofrecido al Archidiablo Mephistopheles a cambio de riquezas. Tras escenificar su muerte, fue arrojado a las calles de los barrios bajos, donde aprendió a ocultarse bajo una capucha y a valerse de su carisma y astucia aristocrática.',
    apariencia: 'Un joven Tiefling de piel azulada y cuernos prominentes, de porte distinguido pero vestido con ropas finas ahora deshilachadas y polvorientas.',
    personalidad: 'Ideal: "El destino lo forjo yo." Vínculo: Vengar la traición de su familia y dominar la caótica chispa de su interior.',
    conectado: true
  },
  {
    nombre: 'Morgan Nurthe',
    clase: 'Caballero',
    subclase: 'Berserker',
    raza: 'Humano',
    trasfondo: 'Guardia de la corona',
    alineamiento: 'Caótico Neutral',
    nivel: 3,
    color_acento: '#a62626',
    hp: 30,
    hp_max: 30,
    ca: 16,
    ca_especial: null,
    velocidad: 30,
    iniciativa: 3,
    bonificador_competencia: 2,
    bonificador_ataque: 4,
    bonificador_magia: 0,
    dado_especial: null,
    nombre_estado_especial: 'FRENESÍ BERSERKER',
    estadisticas: {
      fuerza: 15,
      destreza: 17,
      constitucion: 15,
      inteligencia: 20,
      sabiduria: 15,
      carisma: 10
    },
    habilidades: {
      "Atletismo": { "bonus": 4, "experto": false },
      "Percepción": { "bonus": 4, "experto": false },
      "Historia": { "bonus": 7, "experto": false },
      "Intimidación": { "bonus": 2, "experto": false }
    },
    salvaciones: {
      "Fuerza": 4,
      "Constitución": 4
    },
    condiciones_activas: [],
    retrato_forzado: null,
    estado_especial: false,
    retratos: {
      base: '/morgan_base.png'
    },
    ventajas: [
      'Recuerdos Muertos: Daño recibido reducido y daño asestado aumentado ante No Muertos.',
      '+15% de probabilidad de golpes críticos ante No Muertos.',
      'Siente una ligera simpatía hacia los seres de estatura baja.',
      'Adora el ejercicio físico.'
    ],
    desventajas: [
      'Aversión Mágica: Recibe mayor daño mágico y efectos mágicos aliados menos eficaces.',
      'Detesta a los magos.',
      'Pocas palabras, se incomoda frente a la expresividad.'
    ],
    rasgos: [
      {
        id: 'rasgo-morgan-1',
        nombre: 'Recuerdos Muertos (Pasiva)',
        descripcion: 'Recibe daño reducido de unidades no muertas y asesta daño aumentado a unidades no muertas. Tiene 15% más de probabilidad de asestar golpes críticos a unidades no muertas.'
      },
      {
        id: 'rasgo-morgan-2',
        nombre: 'Aversión Mágica (Pasiva)',
        descripcion: 'Recibe mayor daño de ataques de naturaleza mágica y los efectos aliados de esta naturaleza son menos eficaces en él.'
      }
    ],
    acciones: [
      {
        id: 'morgan-atk-1',
        nombre: 'Espadazo Pesado',
        descripcion: 'Ataque cuerpo a cuerpo con mandoble real.',
        tipo: 'ataque',
        icono: 'Sword',
        tirada_impactar: '+4',
        alcance: '5 pies',
        danio: '2d6+2',
        tipo_danio: 'cortante',
        estado: 'ambos'
      },
      {
        id: 'morgan-habilidad-1',
        nombre: 'Historia Antigua',
        descripcion: 'Acción. Obtiene aumento de defensa (+2 a la CA) mientras menos vida posea (se activa por debajo de 40% HP).',
        tipo: 'habilidad',
        icono: 'ShieldAlert',
        estado: 'ambos'
      },
      {
        id: 'morgan-habilidad-2',
        nombre: 'Insidioso',
        descripcion: 'Acción. Obtiene una mayor probabilidad de asestar un golpe crítico en su próximo ataque.',
        tipo: 'habilidad',
        icono: 'Target',
        estado: 'ambos'
      },
      {
        id: 'morgan-habilidad-3',
        nombre: 'Sentido de Existencia',
        descripcion: 'Reacción. Si cae en combate (0 HP), volverá a la batalla pero con todas sus estadísticas reducidas al 50% de su capacidad total.',
        tipo: 'reaccion',
        icono: 'HeartPulse',
        estado: 'ambos'
      },
      {
        id: 'morgan-habilidad-4',
        nombre: 'Estandarte de Guerra',
        descripcion: 'Acción. Aumenta su Constitución en +4 temporalmente. Sólo funciona durante batallas.',
        tipo: 'habilidad',
        icono: 'Flag',
        estado: 'ambos'
      }
    ],
    equipo: [
      'Mandoble de Guardia Real desgastado',
      'Armadura de placas roja oscura (desgastada y con daño de batalla)',
      'Anillo Sello de la Guardia Real'
    ],
    idiomas: ['Común', 'Alto Asteriano (Élfico)'],
    historia: 'En los albores del sagrado imperio germánico existió un caballero al cual solo lo conocían como Nurthe. Primero al mando de la seguridad del rey, su identidad era un secreto de Estado. Dedicó su vida a proteger el reino, liderando batallas contra las fuerzas no muertas que emergieron del inframundo. El reino sobrevivió, pero al costo de la vida de Morgan Nurthe. Su historia fue borrada para no eclipsar al rey. Ahora, regresado misteriosamente a la vida, busca respuestas.',
    apariencia: 'Un hombre alto embutido en una armadura rojo oscuro sumamente desgastada, por cuya visera dañada se le observa una parte expuesta del cráneo.',
    personalidad: 'Ideal: Descubrir por qué regresó a la vida. Defecto: Pocas palabras, se incomoda frente a la expresividad y detesta profundamente a los magos.',
    conectado: true
  }
];

async function insertarPersonajes() {
  console.log('⚔️  Insertando personajes de D&D 5e en Supabase...\n');

  // Limpiar registros antiguos para evitar duplicados
  console.log('🧹 Limpiando personajes anteriores de la base de datos...');
  await fetch(`${SUPABASE_URL}/rest/v1/personajes?nombre=in.%28%22La%20Masa%22%2C%22Iluso%20%28Lirio%29%22%2C%22Valerius%20Vallis%20%28%22Ceniza%22%20%2F%20%22Bar%C3%B3n%22%29%22%2C%22Morgan%20Nurthe%22%29`, {
    method: 'DELETE',
    headers: {
      'apikey':        ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    }
  });

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
      process.exit(1);
    }

    const creado = await res.json();
    console.log(`✅ Creado: ${creado[0].nombre} (ID: ${creado[0].id})`);
  }

  console.log('\n🎲 ¡Proceso finalizado! Los personajes ya están disponibles.');
}

insertarPersonajes().catch(console.error);
