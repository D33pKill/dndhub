const SUPABASE_URL = 'https://jdjoxebegpqjaoptnkfm.supabase.co';
const ANON_KEY     = 'sb_publishable_KIRTGxyYG0O7w-sCeUZRxg_9iTuEUKf';
const LA_MASA_ID   = 'e79943ac-3365-412c-8ec6-9e855b905388';

const nuevoLore = `ACTO I: EL HUEVO DE ALQUIMIA Y EL NACIMIENTO INTERRUMPIDO
En los anales de la alta nobleza de la Casa Vanderbort, la perfección de la línea sucesoria lo era todo. Los magos de la corte predijeron el nacimiento de un heredero definitivo: un catalizador vivo de magia y acero, el Caballero Arcano perfecto. El ritual requería gestar al feto dentro de un útero infundido con mercurio, polvo de runas y sangre de demonio.

Pero la ambición engendra traición. Una facción rival saboteó el receptáculo. El útero mágico fue rajado antes de tiempo. El ser nació a los cinco meses de gestación: una masa ciega, translúcida, de pulmones colapsados que chillaba sin aire. No lo dejaron morir. Los magos amarraron su alma agonizante a su cuerpo deforme usando hilos de nigromancia y abjuración. Se convirtió en un "Gólem de carne viva". Su rostro y sus órganos internos jamás maduraron —siguiendo las facciones de un feto prematuro—, pero la magia forzó a sus músculos, huesos y tendones a estirarse y endurecerse hasta alcanzar el tamaño de un hombre adulto. Un cascarón de guerrero con el interior de un aborto.

ACTO II: EL HARÉN DE LAS BESTIAS Y LA TORTURA DE SALÓN
Para la alta alcurnia, no era una persona; era una propiedad, un monstruo exótico. Fue confinado a los sótanos de placer de los palacios de la nobleza. Allí, durante años, se combinó el sadismo refinado con la perversión. 

Los nobles utilizaban su cuerpo deforme y superdesarrollado para sus vicios más oscuros. Fue objeto de abusos sexuales sistemáticos, humillaciones públicas en banquetes privados donde lo vestían con sedas sobre su piel purulenta, y experimentos de dolor donde los magos probaban conjuros de quemadura interna en sus órganos de feto para ver cuánto podía resistir la magia que lo mantenía vivo. Su incontinencia y sus espasmos eran el chiste de la corte; lo obligaban a pelear en la arena del sótano cubierto en sus propios fluidos y desechos.

Sin embargo, los nobles cometieron un error fatal. Al usar conjuros de descarga y energía arcana para torturarlo, su mente retorcida y hambrienta empezó a "absorber" los axiomas de la magia. Su hiperenfoque, nacido del trauma puro, le permitió descifrar los componentes de los hechizos de sus torturadores. Aprendió a canalizar la magia a través del dolor.

ACTO III: EL DESGARRO Y LA FUGA
La noche del escape no hubo sutileza. Durante una de las orgías de la corte, donde estaba encadenado como una atracción de circo, logró canalizar la energía de los abusos recibidos para conjurar su primer Vínculo con el Arma. Una pesada espada de verdugo guardada en la pared voló directamente a sus manos rotas.

La masacre duró hasta el amanecer. Los pasillos de mármol se tiñeron del rojo de la sangre noble y del icor rancio que secretaba su propio cuerpo descontrolado. No dejó a nadie vivo en ese ala del palacio. Huyó a las alcantarillas, cubriéndose con una armadura de placas pesada para ocultar la vergüenza de su piel fetal y contener las funciones de un cuerpo que se niega a sanar.`;

async function update() {
  console.log('📝 Actualizando el lore de La Masa en Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/personajes?id=eq.${LA_MASA_ID}`, {
    method: 'PATCH',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      historia: nuevoLore
    })
  });
  if (res.ok) {
    console.log('✅ Lore actualizado con éxito en la base de datos.');
  } else {
    console.error('❌ Error al actualizar el lore:', await res.text());
  }
}

update().catch(console.error);
