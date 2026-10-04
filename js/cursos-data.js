/* ============================================================
   PORTAL ZAG — Cursos Extraclase (js/cursos-data.js)

   Datos de los 6 cursos extraclase. Todo el texto vive aquí:
   la presentación solo consume este objeto.

   Reglas de los datos:
   - Los profesores son los mismos mentores del portal. Se referencian
     por profesorId contra window.ZAG_MENTORIAS (js/mentorias-data.js).
     Si un id no existe ahí, la tarjeta cae a iniciales.
   - videoUrl va en null en todas las lecciones: el player dibuja el
     placeholder con avance simulado. Cuando haya link de YouTube o
     Vimeo se pega ahí y el player cambia a iframe automáticamente.
   - Los quizzes se aprueban con 2 de 3, ver quizAprobado en
     js/cursos-progreso.js.
   - materiales.tipo: pdf, plantilla, checklist, hoja o zip.
   ============================================================ */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------
     CURSO 1 · GROWTH HACKING (Daniel Rueda)
     ------------------------------------------------------------ */

  var GROWTH = {
    id: 'growth-hacking',
    emoji: '🚀',
    titulo: 'Growth Hacking',
    tituloCorto: 'Growth',
    descripcion:
      'Piensa como alguien que busca growth todas las semanas, no como alguien que necesita una idea brillante el lunes. '
      + 'A lo largo de cuatro módulos armas un embudo propio, aprendes a medirlo sin engañarte y cierras con un tablero de experimentos de 30 días que podés seguir usando en tu trabajo.',
    profesorId: 'daniel-rueda',
    color: 'brand-deep',
    modulos: [
      {
        id: 'm1',
        titulo: 'Mentalidad de experimento',
        lecciones: [
          {
            id: 'm1-l1',
            titulo: 'Qué es growth (y qué no)',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Growth no es hacer más cosas más rápido. Es acertar más rápido: un ciclo corto, una hipótesis, un cambio y una medida. '
              + 'La diferencia parece sutil y cambia por completo cómo trabajás.\n\n'
              + 'En esta lección separamos tres cosas que la industria mezcla todo el tiempo: crecer, generar tendencia y optimizar. '
              + 'Crecer es conseguir más personas que valen. Generar tendencia es que se hable de vos. Optimizar es mejorarle el número a algo que ya funciona. '
              + 'Casi todas las campañas que no crecen, en realidad no estaban optimizando nada: estaban parchando un embudo que todavía no existía.',
            puntosClave: [
              'Growth es una cadencia de medición, no un truco aislado.',
              'Optimizar sin embudo es pulir la fontanería de una casa sin construir.',
              'Un experimento que no se puede fallar no es un experimento: es una sesión de confirmación.',
            ],
            materiales: [
              { nombre: 'Plantilla de cadencia de experimento', tipo: 'plantilla', peso: '1,2 MB' },
              { nombre: 'Cheatsheet de crecer, tendencia y optimizar', tipo: 'pdf', peso: '480 KB' },
            ],
          },
          {
            id: 'm1-l2',
            titulo: 'El embudo AARRR sin humo',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'AARRR no es un modelo de plataformas, es el mapa más corto que ordena todo lo que pasa entre que alguien te ve y alguien decide comprarte. '
              + 'Vamos a armarlo con tus palabras, no con las del manual.\n\n'
              + 'Lo que más cambia al pasarlo en limpio es que cada etapa revela un problema distinto y no se arreglan con la misma jugada. '
              + 'Conseguir muchas impresiones sin clics suele significar que el problema está en el mensaje. Conseguir clics sin registros significa que el problema está en la fricción de la página. '
              + 'Antes de tocar un canal hay que saber cuál de las cinco etapas se está rompiendo.',
            puntosClave: [
              'Adquisición, activación, retención, ingresos y referidos: cinco etapas, cinco preguntas distintas.',
              'El cuello de botella se mide antes de atacarlo: ningún canal arregla un problema de activación.',
              'Escribe cada etapa como una frase corta: “traemos”, “entendemos”, “volvemos”, “cobramos”, “invitan”.',
            ],
            materiales: [
              { nombre: 'Hoja de cálculo del embudo AARRR', tipo: 'hoja', peso: '96 KB' },
            ],
          },
          {
            id: 'm1-l3',
            titulo: 'Tu primera hipótesis',
            duracionMin: 11,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Una hipótesis es una apuesta con formato fijo: creemos que a fulano le importa esto, si le cambiamos aquello va a pasar esto otro, y por eso medimos aquello. '
              + 'El formato no es burocracia: es lo que evita que la conversación termine en “me parece que sí”.\n\n'
              + 'Vamos a escribir tres, una mala, una mediocre y una que sí se puede testear, y vas a ver por qué la primera casi siempre falla. '
              + 'La regla práctica es simple: si el resultado puede ser “depende”, todavía no es una hipótesis. Depender significa que falta un número, un plazo o un grupo definido.',
            puntosClave: [
              'Hipótesis más grupo más cambio más resultado esperado más métrica da algo testeable.',
              '“Depende” no es un resultado: es una hipótesis a la que le falta una variable.',
              'Escribe la métrica antes de correr el experimento. Si no la tenés, no lo vas a medir.',
            ],
            materiales: [
              { nombre: 'Plantilla de hipótesis', tipo: 'plantilla', peso: '740 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Cuál de estos es un cuello de botella y no una solución?',
            opciones: [
              'Subir el presupuesto de Meta Ads un 30 por ciento.',
              'Muchos clics y pocas registraciones en la landing.',
              'Rotar dos creativos por semana.',
              'Pedir referidos a los clientes actuales.',
            ],
            correcta: 1,
            explicacion: 'Muchos clics con pocas registraciones es la medición del problema: el cuello está en activación, no en adquisición.',
          },
          {
            pregunta: '¿Cuál de estas frases es una hipótesis testeable?',
            opciones: [
              'Los videos de TikTok nos van a funcionar mejor.',
              'Si cambiamos el titular por uno con precio, las registraciones suben.',
              'Deberíamos probar redes sociales.',
              'El cliente final todavía no está listo para el producto.',
            ],
            correcta: 1,
            explicacion: 'Tiene grupo, cambio concreto, resultado esperado y métrica. Las otras prometen algo o no se pueden medir.',
          },
          {
            pregunta: '¿Cuál es la diferencia entre crecer y optimizar?',
            opciones: [
              'Crecer es ganar dinero y optimizar es ganar seguidores.',
              'Son la misma palabra en contextos distintos.',
              'Crecer es conseguir más personas que valen; optimizar es mejorarle el número a algo que ya funciona.',
              'Optimizar siempre es más importante que crecer.',
            ],
            correcta: 2,
            explicacion: 'Optimizar sin embudo es pulir la fontanería de una casa sin construir.',
          },
        ],
      },
      {
        id: 'm2',
        titulo: 'Adquisición sin pauta',
        lecciones: [
          {
            id: 'm2-l1',
            titulo: 'Canales que no cuestan',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Hay canales que cuestan plata y canales que cuestan horas. Los primeros casi siempre se descartan por aburrimiento y no por mal resultado.\n\n'
              + 'Vamos a ordenar cinco canales que un equipo chico puede sostener en una tarde por semana: colaboraciones con marcas cercanas, contenido que se busca, grupos de la industria, referidos y piezas reutilizables. '
              + 'El objetivo no es que sean gratis: es entender qué costo estás moviendo, porque el tiempo de tu equipo también es plata.',
            puntosClave: [
              'Un canal que no cuesta plata se paga con horas tuyas: cotizalo antes de adoptarlo.',
              'La colaboración es el subproducto de hacer algo que alguien más quiera compartir.',
              'Cinco canales sostenidos le ganan a dos canales atendidos a medias y abandonados.',
            ],
            materiales: [
              { nombre: 'Checklist de canales sin pauta', tipo: 'checklist', peso: '210 KB' },
            ],
          },
          {
            id: 'm2-l2',
            titulo: 'Referidos que sí funcionan',
            duracionMin: 10,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El referido es el único canal donde el mensaje ya viene resuelto: alguien que te recomienda pone su propia credibilidad en juego.\n\n'
              + 'Por eso funciona, y por eso se arruina si lo tratás como un cupón. Vamos a ver cómo pedirlo sin parecer desesperado, a quién pedirle y qué ofrecer para que el referido salga ganando también. '
              + 'Tres buenas personas valen más que trescientos contactos tibios.',
            puntosClave: [
              'El referido funciona porque transfiere confianza, no porque sea gratis.',
              'Pedile a quien ya te conoce y quedó conforme: ahí rinde más.',
              'Si el referido no gana algo, no vuelve a recomendar.',
            ],
            materiales: [
              { nombre: 'Guion de mensaje a referidos', tipo: 'pdf', peso: '320 KB' },
            ],
          },
          {
            id: 'm2-l3',
            titulo: 'Una landing en una tarde',
            duracionMin: 16,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Una landing no es una página bonita: es una promesa con un botón. Todo lo que no empuja a ese botón es decoración que distrae.\n\n'
              + 'En una tarde se arma una landing que convierte: una promesa, una prueba, un formulario de un solo campo y un motivo para hacerlo hoy. '
              + 'Vamos a construirla en vivo y a revisar por qué la mayoría de las landings del sector tardan más y presentan menos.',
            puntosClave: [
              'Una promesa, una prueba y un botón. Si hay dos botones, no hay ninguno.',
              'Un solo campo en el formulario convierte más que cinco: el dato extra cuesta la decisión.',
              'El “por qué ahora” vale más que un código de descuento.',
            ],
            materiales: [
              { nombre: 'Wireframe de landing de una página', tipo: 'plantilla', peso: '1,8 MB' },
              { nombre: 'Checklist prelanzamiento de landing', tipo: 'checklist', peso: '260 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Cuál es el costo real de un canal gratis?',
            opciones: [
              'Ninguno, si no hay inversión en medios.',
              'El tiempo de tu equipo, que hay que cotizar igual.',
              'Solo el riesgo de que no funcione.',
              'La pérdida de credibilidad frente al cliente.',
            ],
            correcta: 1,
            explicacion: 'El tiempo de tu equipo también es plata. Un canal sin pauta se paga en horas.',
          },
          {
            pregunta: '¿Por qué el referido es tan eficiente?',
            opciones: [
              'Porque tiene mejores algoritmos que el resto de los canales.',
              'Porque es el único canal donde alguien pone su credibilidad a favor tuyo.',
              'Porque siempre sale más barato que la pauta.',
              'Porque genera más visitas que el buscador.',
            ],
            correcta: 1,
            explicacion: 'El mensaje ya viene resuelto y con una cara conocida. Por eso se arruina si lo tratás como un cupón.',
          },
          {
            pregunta: '¿Qué hace que una landing convierta?',
            opciones: [
              'Tener muchas secciones explicativas.',
              'Una promesa, una prueba, un botón y un motivo para hacerlo hoy.',
              'Tener el logo del cliente arriba.',
              'Tener menos de 500 palabras.',
            ],
            correcta: 1,
            explicacion: 'Una landing es una promesa con un botón. Todo lo demás es decoración que distrae.',
          },
        ],
      },
      {
        id: 'm3',
        titulo: 'Retención y datos',
        lecciones: [
          {
            id: 'm3-l1',
            titulo: 'Métricas que importan',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Una métrica sirve si podés tomar una decisión con ella. Un panel lleno de gráficos que nadie mira es la forma más cara de no medir nada.\n\n'
              + 'Vamos a separar métricas de entrada, de acción y de resultado, y quedarnos con tres que sí generan decisiones: activación, retención y conversión. '
              + 'El resto entra como contexto, no como obligación.',
            puntosClave: [
              'Entrada, acción y resultado: si la métrica no termina en decisión, es decoración.',
              'Tres métricas decisivas: activación, retención y conversión.',
              'Un tablero que no mirás no existe.',
            ],
            materiales: [
              { nombre: 'Plantilla de tablero de tres métricas', tipo: 'plantilla', peso: '1,1 MB' },
            ],
          },
          {
            id: 'm3-l2',
            titulo: 'Cohortes para humanos',
            duracionMin: 15,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El promedio te dice que tu producto está bien. La cohorte te dice a quién se lo estás rompiendo.\n\n'
              + 'Vamos a leer cohortes como se leen: no promedios, sino grupos de personas que entraron el mismo día hacen lo mismo. '
              + 'Es la forma más rápida de encontrar que perdés al 40 por ciento en la segunda semana y no en la primera, y de saber a quién le pasa.',
            puntosClave: [
              'El promedio esconde al grupo que se está yendo.',
              'Una cohorte es gente que entró el mismo día. Comparar cohortes es comparar trato justo.',
              'Si perdés 40 por ciento en la semana 2, el problema está en el momento 2, no en el alta.',
            ],
            materiales: [
              { nombre: 'Hoja de lectura de cohortes', tipo: 'hoja', peso: '140 KB' },
            ],
          },
          {
            id: 'm3-l3',
            titulo: 'Automatizaciones básicas',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Automatizar no es sacar personas del proceso: es que las personas estén donde se piensa y no donde se hace clic.\n\n'
              + 'Vamos a ver tres automatizaciones que cualquier equipo chico puede montar en un día: recordatorio de carrito, secuencia de bienvenida y alerta de caída. '
              + 'Y vamos a ver cuándo NO automatizar, que es la parte que casi nadie respeta y termina costando clientes.',
            puntosClave: [
              'Se automatiza lo repetitivo, no lo que requiere criterio.',
              'El mejor momento de un mensaje automático es cuando alguien tiene una duda y nadie le contesta.',
              'Automatizar un proceso roto solo lo hace más rápido.',
            ],
            materiales: [
              { nombre: 'Checklist de automatizaciones que sí valen', tipo: 'checklist', peso: '190 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué le dice una cohorte que no le dice un promedio?',
            opciones: [
              'Cuánto vendimos el mes pasado.',
              'Qué grupo entró el mismo día y si sigue con nosotros.',
              'Cuál fue nuestro mejor día histórico.',
              'Cuánto nos cuesta adquirir un cliente.',
            ],
            correcta: 1,
            explicacion: 'El promedio te dice que tu producto está bien. La cohorte te dice a quién se lo estás rompiendo.',
          },
          {
            pregunta: '¿Cuál es el mejor momento para un mensaje automático?',
            opciones: [
              'Apenas alguien se registra, sin más datos.',
              'Cuando alguien tiene una duda y nadie le contesta.',
              'Todos los lunes a las 9, sin falta.',
              'Cuando el carrito está vacío.',
            ],
            correcta: 1,
            explicacion: 'Ahí la automatización aporta en lugar de molestar. En el resto es ruido.',
          },
          {
            pregunta: 'Una métrica sirve cuando...',
            opciones: [
              'Se puede graficar lindo en el tablero.',
              'Es la que mira el jefe.',
              'Podés tomar una decisión concreta con ella.',
              'Tiene muchos decimales.',
            ],
            correcta: 2,
            explicacion: 'Si no termina en decisión, es decoración del tablero.',
          },
        ],
      },
      {
        id: 'm4',
        titulo: 'Proyecto: 30 días de experimentos',
        lecciones: [
          {
            id: 'm4-l1',
            titulo: 'Diseña tu tablero',
            duracionMin: 15,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Antes de correr nada, el tablero. Es lo que separa a un equipo que aprende de uno que acumula tareas.\n\n'
              + 'Vamos a armar un tablero de una sola pantalla con tres cosas: la métrica que duele, el experimento que la ataca y el dueño. '
              + 'Nada más. Un tablero con más de cinco experimentos en curso es un tablero sin foco.',
            puntosClave: [
              'Métrica que duele, experimento y dueño. Tres columnas y nada más.',
              'Cinco experimentos en paralelo es cero foco.',
              'El tablero se escribe antes de arrancar, no después de la primera victoria.',
            ],
            materiales: [
              { nombre: 'Plantilla de tablero de experimentos', tipo: 'plantilla', peso: '1,4 MB' },
              { nombre: 'Checklist de foco semanal', tipo: 'checklist', peso: '180 KB' },
            ],
          },
          {
            id: 'm4-l2',
            titulo: 'Corre, mide, decide',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Correr un experimento es fácil. Lo difícil es decidir cuándo termina y no seguir moviendo la variable.\n\n'
              + 'Vamos a trabajar las tres decisiones posibles: repetir, iterar o abandonar, y el momento exacto de tomar cada una. '
              + 'La disciplina de cerrar un experimento es lo que separa un ciclo que aprende de un ciclo infinito de pruebas.',
            puntosClave: [
              'Repetir, iterar o abandonar: toda conclusión tiene que ser una de esas tres.',
              'El experimento termina por plazo, no por cansancio.',
              'Cerrar mal un experimento cuesta tanto como no correrlo.',
            ],
            materiales: [
              { nombre: 'Bitácora de experimentos', tipo: 'plantilla', peso: '620 KB' },
            ],
          },
          {
            id: 'm4-l3',
            titulo: 'Presenta tus resultados',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un experimento que no se explica, no pasó. Y explicar resultados es una habilidad distinta de correrlos.\n\n'
              + 'Vamos a armar la presentación de resultados en cinco minutos: el problema, la hipótesis, el experimento, el número y qué sigue. '
              + 'La estructura es corta a propósito: el objetivo es que la gente decida, no que te aplaudan.',
            puntosClave: [
              'Problema, hipótesis, experimento, número y qué sigue. Cinco minutos.',
              'El objetivo de presentar es que decidan, no que te aplaudan.',
              'Un “no funcionó” bien explicado vale más que un “funcionó” sin número.',
            ],
            materiales: [
              { nombre: 'Guion de presentación de resultados', tipo: 'pdf', peso: '410 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Cuántos experimentos debería tener un tablero en curso?',
            opciones: [
              'Los que entre el equipo.',
              'Cinco como máximo.',
              'Todos los que se ocurran.',
              'Uno solo, siempre.',
            ],
            correcta: 1,
            explicacion: 'Cinco en paralelo ya es cero foco. Menos, pero medido, le gana a más y sin conclusión.',
          },
          {
            pregunta: '¿Un experimento termina cuando...?',
            opciones: [
              'Dejás de mirar los resultados.',
              'Se cumple el plazo que definiste.',
              'Alguien del equipo se aburre.',
              'El número sale bonito.',
            ],
            correcta: 1,
            explicacion: 'Termina por plazo, no por cansancio. Si no, se convierte en una prueba infinita.',
          },
          {
            pregunta: '¿Cuál es el objetivo de presentar resultados?',
            opciones: [
              'Que te aplaudan por haber corrido el experimento.',
              'Que la gente tome una decisión.',
              'Demostrar que el equipo trabaja bien.',
              'Dejar el tablero en pantalla.',
            ],
            correcta: 1,
            explicacion: 'La estructura de cinco minutos está diseñada para que decidan.',
          },
        ],
      },
    ],
  };

  /* ------------------------------------------------------------
     CURSO 2 · BRANDING EXPERIMENTAL (Sofía Arango)
     ------------------------------------------------------------ */

  var BRANDING = {
    id: 'branding-experimental',
    emoji: '🧪',
    titulo: 'Branding Experimental',
    tituloCorto: 'Branding',
    descripcion:
      'La mayoría de las marcas se ven iguales porque resolvieron el mismo brief de la misma forma. '
      + 'Este curso trabaja el branding como posición y no como decoración: encontrás el zag de una categoría, armás un sistema visual que responda a esa idea y lo probás en la calle en 48 horas. '
      + 'No vas a salir con una identidad terminada: vas a salir con una que se defiende.',
    profesorId: 'sofia-arango',
    color: 'black',
    modulos: [
      {
        id: 'm1',
        titulo: 'Romper el brief',
        lecciones: [
          {
            id: 'm1-l1',
            titulo: 'La marca como posición',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Una marca no es un conjunto de piezas lindas. Es una posición: la idea de para quién hacés las cosas y qué dejás afuera. '
              + 'Todo lo demás, colores, tipografías y logo, es consecuencia de esa decisión.\n\n'
              + 'En esta lección vas a escribir la posición de una marca en una frase y vas a notar que si no podés, el problema no es el diseño: todavía no sabés qué vendés ni a quién. '
              + 'Vamos a usar tres categorías conocidas para entender cómo se decide esto en la práctica.',
            puntosClave: [
              'La marca es una posición antes de ser una identidad visual.',
              'Si no podés escribir la posición en una frase, todavía no sabés para quién hacés la marca.',
              'Lo que dejás afuera importa tanto como lo que prometés.',
            ],
            materiales: [
              { nombre: 'Plantilla de posición de marca', tipo: 'plantilla', peso: '890 KB' },
            ],
          },
          {
            id: 'm1-l2',
            titulo: 'Encuentra el zag de una categoría',
            duracionMin: 15,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Si todos en tu categoría dicen lo mismo, no hay marca: hay ruido con mejor presupuesto. '
              + 'El zag es ese lugar que está libre y que solo vos podés defender.\n\n'
              + 'Vamos a hacer el ejercicio al revés del habitual: primero miramos qué dice la categoría entera, después buscamos el hueco. '
              + 'Con dos categorías reales vas a ver cómo dos marcas del mismo rubro terminan sin parecerse en nada, porque resolvieron preguntas distintas.',
            puntosClave: [
              'Zag es el espacio que la categoría entera deja libre y que vos ocupás con criterio.',
              'Hacé el ejercicio al revés: primero escuchá a la categoría, después elegí el hueco.',
              'Dos marcas del mismo rubro pueden no parecerse en nada si responden preguntas distintas.',
            ],
            materiales: [
              { nombre: 'Mapa de categorías con huecos', tipo: 'hoja', peso: '180 KB' },
              { nombre: 'Checklist de auditoría de competencia', tipo: 'checklist', peso: '230 KB' },
            ],
          },
          {
            id: 'm1-l3',
            titulo: 'El brief en una frase',
            duracionMin: 10,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El brief de una frase es el filtro más útil que vas a usar en tu carrera. Si un camino no entra en esa frase, no es un camino: es ruido. '
              + 'Sirve más para decir que no que para mostrar lo que hiciste.\n\n'
              + 'Vamos a reducir tres briefs reales de páginas enteras a una frase cada uno, y vas a ver cuántas ideas se caen solas. '
              + 'Después la usás como brújula en cada decisión de los dos módulos siguientes.',
            puntosClave: [
              'El brief de una frase es un filtro, no un resumen.',
              'Lo que no entra en la frase no es un camino: es ruido que consume tiempo.',
              'Escribila antes de diseñar y usala después para decir que no.',
            ],
            materiales: [
              { nombre: 'Plantilla de brief en una frase', tipo: 'plantilla', peso: '520 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué es una marca, antes que una identidad visual?',
            opciones: [
              'Un conjunto de piezas lindas que se usan en todos lados.',
              'Una posición: para quién hacés las cosas y qué dejás afuera.',
              'El logo y su manual de uso.',
              'Una promesa de precio bajo.',
            ],
            correcta: 1,
            explicacion: 'Colores, tipografías y logo son consecuencia de la posición, no al revés.',
          },
          {
            pregunta: '¿Cómo se encuentra el zag de una categoría?',
            opciones: [
              'Eligiendo el color más ausente en la categoría.',
              'Copiando a la marca que más factura.',
              'Escuchando qué dice toda la categoría y buscando el hueco libre.',
              'Inventando un nombre nuevo.',
            ],
            correcta: 2,
            explicacion: 'Se hace al revés: primero qué dice la categoría, después el espacio que nadie ocupa con criterio.',
          },
          {
            pregunta: '¿Para qué sirve el brief en una frase?',
            opciones: [
              'Para que el cliente lo apruebe más rápido.',
              'Como filtro: lo que no entra, no es un camino.',
              'Para reemplazar al documento de presupuesto.',
              'Para dejar por escrito qué se entrega.',
            ],
            correcta: 1,
            explicacion: 'Es una brújula: te sirve para decir que no sin sentir que perdiste una idea.',
          },
        ],
      },
      {
        id: 'm2',
        titulo: 'Identidad fuera de la plantilla',
        lecciones: [
          {
            id: 'm2-l1',
            titulo: 'Sistemas visuales vivos',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un sistema visual no es una lista de reglas: es un conjunto de decisiones que se repiten y por eso se reconocen. '
              + 'La diferencia con una plantilla es que la plantilla se aplica igual a todas las marcas.\n\n'
              + 'Vamos a construir el sistema de una marca real en tres capas: base, ritmo y acento. '
              + 'Con esa estructura, cuando llegue una pieza nueva vas a poder decidir dónde va sin consultarle a nadie.',
            puntosClave: [
              'Un sistema son decisiones que se repiten, no reglas para todos los casos.',
              'Base, ritmo y acento: tres capas que ordenan cualquier pieza nueva.',
              'Si no podés decidir sin consultar, todavía no tenés un sistema.',
            ],
            materiales: [
              { nombre: 'Plantilla de sistema visual en tres capas', tipo: 'plantilla', peso: '1,5 MB' },
            ],
          },
          {
            id: 'm2-l2',
            titulo: 'Tipografía con carácter',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Elegir tipografía no es elegir la que está de moda. Es elegir la que tiene el peso y la altura que pide tu posición. '
              + 'La tipografía comunica, y comunicar es decidir qué se entiende primero.\n\n'
              + 'Vamos a ver qué le pasa a una marca cuando cambia de tipografía sin cambiar de idea, y por qué dos marcas del mismo rubro necesitan tipografías que no se parecen. '
              + 'Después probamos tres pares reales y comparamos cómo cambia la marca.',
            puntosClave: [
              'La tipografía comunica posición: no es decoración ni moda.',
              'Si cambias la tipografía y la idea no cambia, cambiaste la marca sin querer.',
              'Dos marcas del mismo rubro pueden necesitar tipografías muy distintas.',
            ],
            materiales: [
              { nombre: 'Cheatsheet de jerarquías y escalas', tipo: 'pdf', peso: '560 KB' },
            ],
          },
          {
            id: 'm2-l3',
            titulo: 'Tono de voz',
            duracionMin: 11,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El tono de voz es lo único de la marca que no se ve y todos sienten. Un buen sistema visual con un tono genérico se siente prestado. '
              + 'Es la capa que aparece en el chat, en el mail y en el reclamo.\n\n'
              + 'Vamos a definir el tono como tres reglas de sí y tres de no, y a probarlas reescribiendo el mismo mensaje de cuatro formas distintas. '
              + 'Vas a ver que el tono se aprende escribiendo, no leyendo.',
            puntosClave: [
              'El tono de voz es lo único que no se ve y todos sienten.',
              'Tres reglas de sí y tres de no rinden más que un manual de veinte páginas.',
              'El tono se aprende reescribiendo el mismo mensaje, no leyendo.',
            ],
            materiales: [
              { nombre: 'Plantilla de tono de voz', tipo: 'plantilla', peso: '680 KB' },
              { nombre: 'Checklist de reescritura de mensajes', tipo: 'checklist', peso: '200 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué diferencia a un sistema visual de una plantilla?',
            opciones: [
              'El sistema usa menos colores.',
              'El sistema son decisiones que se repiten; la plantilla se aplica igual a todo.',
              'La plantilla es más cara.',
              'El sistema se entrega en PDF.',
            ],
            correcta: 1,
            explicacion: 'La plantilla se aplica igual a todas las marcas. Un sistema se deduce de una posición.',
          },
          {
            pregunta: 'Una marca con buena identidad visual pero tono genérico...',
            opciones: [
              'No pasa nada, la identidad lo compensa.',
              'Se siente prestado: algo no encaja.',
              'El logo se ve más chico.',
              'Hay que cambiar de color.',
            ],
            correcta: 1,
            explicacion: 'El tono aparece en el chat, el mail y el reclamo. Si falla, todo se siente prestado.',
          },
          {
            pregunta: '¿Para qué sirven las tres reglas de sí y las tres de no?',
            opciones: [
              'Para llenar el manual de la marca.',
              'Para decidir rápido, sin depender de un documento.',
              'Para limitar la creatividad del equipo.',
              'Para satisfacer al cliente.',
            ],
            correcta: 1,
            explicacion: 'Sirven como brújula operativa, y se aplican escribiendo.',
          },
        ],
      },
      {
        id: 'm3',
        titulo: 'Probar en la calle',
        lecciones: [
          {
            id: 'm3-l1',
            titulo: 'Prototipa una marca en 48 horas',
            duracionMin: 16,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Cuarenta y ocho horas es el plazo que obliga a decidir. Si en dos días no tenés una versión que la calle pueda tocar, el problema es la idea, no el plazo. '
              + 'Y un material barato ayuda: te obliga a probar la idea y no el acabado.\n\n'
              + 'Vamos a hacer el ejercicio completo con una marca real: una versión impresa en la calle, con los materiales más baratos que se compren en una cuadra. '
              + 'Vas a ver que el prototipo barato enseña más que la presentación de veinte slides.',
            puntosClave: [
              'El plazo corto no limita: obliga a decidir.',
              'Un prototipo en la calle enseña más que una presentación de veinte slides.',
              'Los materiales baratos son una ventaja: te obligan a probar la idea, no el acabado.',
            ],
            materiales: [
              { nombre: 'Checklist de prototipo en 48 horas', tipo: 'checklist', peso: '290 KB' },
              { nombre: 'Lista de compras del prototipo', tipo: 'hoja', peso: '110 KB' },
            ],
          },
          {
            id: 'm3-l2',
            titulo: 'Testea con gente real',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Testear con gente real no es hacer una encuesta. Es poner la pieza adelante de alguien y ver qué hace, no qué dice que le gusta. '
              + 'La diferencia entre las dos cosas es todo el aprendizaje.\n\n'
              + 'Vamos a trabajar una técnica de cinco minutos que sirve para piezas impresas, apps y packaging: mostrar sin preguntar. '
              + 'Con diez personas ya tenés la señal que importa, que es dónde se traba la mirada.',
            puntosClave: [
              'Testear es ver qué hace la gente, no qué dice que le gusta.',
              'Mostrar y callar: preguntar si le gusta solo devuelve lo educado.',
              'Con diez personas alcanzás para encontrar dónde se traba la mirada.',
            ],
            materiales: [
              { nombre: 'Guion de testeo de cinco minutos', tipo: 'pdf', peso: '380 KB' },
            ],
          },
          {
            id: 'm3-l3',
            titulo: 'Iterar sin perder la esencia',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Iterar no es pulir: es cambiar lo que no funciona y defender lo que sí. El error clásico es limar hasta que la marca deje de tener carácter. '
              + 'Ahí la marca se pone prolija y olvidable.\n\n'
              + 'Vamos a revisar tres casos de marcas que se pulieron de más, y a construir una regla de decisión: qué se toca y qué no se toca nunca. '
              + 'Después aplicamos la regla a los resultados de tu propio test de la calle.',
            puntosClave: [
              'Iterar es cambiar lo que no funciona y defender lo que sí.',
              'Pulir de más es el error clásico: la marca pierde carácter y se vuelve genérica.',
              'Tené una regla escrita de qué se toca y qué no se toca nunca.',
            ],
            materiales: [
              { nombre: 'Plantilla de regla de iteración', tipo: 'plantilla', peso: '460 KB' },
              { nombre: 'Checklist de control de carácter', tipo: 'checklist', peso: '220 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Por qué 48 horas es un buen plazo para prototipar?',
            opciones: [
              'Porque da tiempo a hacerlo todo bien.',
              'Porque obliga a decidir: si en dos días no hay versión, el problema es la idea.',
              'Porque es lo que tarda la impresión.',
              'Porque así lo piden los clientes.',
            ],
            correcta: 1,
            explicacion: 'El plazo corto no limita: saca la excusa de la ejecución y deja el problema en la idea.',
          },
          {
            pregunta: 'Al testear una pieza, ¿qué observás?',
            opciones: [
              'Lo que la persona dice que le gusta.',
              'Lo que la persona hace cuando la ve.',
              'Lo que sus amigos opinan.',
              'Lo que cuesta imprimirla.',
            ],
            correcta: 1,
            explicacion: 'Mostrar y callar. Si preguntás si le gusta, obtenés lo educado.',
          },
          {
            pregunta: '¿Cuál es el error clásico al iterar?',
            opciones: [
              'Cambiar demasiado rápido.',
              'Pulir hasta que la marca pierda carácter.',
              'No pedir opinión a nadie.',
              'Probar con pocas personas.',
            ],
            correcta: 1,
            explicacion: 'La iteración sana cambia lo que no funciona y defiende lo que sí.',
          },
        ],
      },
    ],
  };

  /* ------------------------------------------------------------
     CURSO 3 · IA APLICADA A LA PUBLICIDAD (Natalia Ospina)
     ------------------------------------------------------------ */

  var IA = {
    id: 'ia-aplicada',
    emoji: '🤖',
    titulo: 'IA Aplicada a la Publicidad',
    tituloCorto: 'IA aplicada',
    descripcion:
      'La IA no viene a reemplazar tu criterio: viene a devolverte el tiempo que se te iba en tareas que no lo merecen. '
      + 'Cuatro módulos para entender qué hace y qué no, escribir prompts que funcionan, pasar de una idea a cincuenta sin perder la voz y cerrar con una campaña completa producida con IA de punta a punta. '
      + 'Incluye ética y derechos de autor: esto no es un curso de atajos.',
    profesorId: 'natalia-ospina',
    color: 'functional',
    modulos: [
      {
        id: 'm1',
        titulo: 'IA sin miedo',
        lecciones: [
          {
            id: 'm1-l1',
            titulo: 'Qué hace y qué no',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Todo el ruido alrededor de la IA viene de una sola confusión: creer que la herramienta piensa. No piensa: combina, completa y estima. '
              + 'Saber dónde termina su utilidad y dónde arranca la tuya es lo que te va a ahorrar meses.\n\n'
              + 'En esta lección separamos las tareas que la IA hace bien de las que hace mal, con ejemplos publicitarios reales. '
              + 'Y vamos a practicar el criterio: cuándo delegar y cuándo no.',
            puntosClave: [
              'La IA no piensa: combina, completa y estima.',
              'Delega lo repetitivo; nunca lo que define la posición de la marca.',
              'Saber qué no sabe hacer la herramienta es la mitad del trabajo.',
            ],
            materiales: [
              { nombre: 'Cheatsheet de qué hace y qué no la IA', tipo: 'pdf', peso: '510 KB' },
            ],
          },
          {
            id: 'm1-l2',
            titulo: 'Prompts que funcionan',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un prompt no es una consulta: es un encargo. La diferencia entre los dos es la diferencia entre un resultado que se tira y uno que se usa.\n\n'
              + 'Vamos a trabajar una estructura de cinco partes que funciona en cualquier herramienta, y a reescribir tres prompts malos hasta que sirvan. '
              + 'Vas a ver que casi siempre falta contexto y criterio, no creatividad.',
            puntosClave: [
              'Un prompt es un encargo con contexto, no una consulta suelta.',
              'Cinco partes: objetivo, contexto, restricciones, formato y ejemplos.',
              'Lo que falta casi siempre es contexto y criterio, no creatividad.',
            ],
            materiales: [
              { nombre: 'Plantilla de prompt de cinco partes', tipo: 'plantilla', peso: '760 KB' },
              { nombre: 'Biblioteca de 20 prompts de publicidad', tipo: 'pdf', peso: '640 KB' },
            ],
          },
          {
            id: 'm1-l3',
            titulo: 'Ética y derechos de autor',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Esta es la lección que puede costarte un cliente. No es la más divertida y es la que más valor tiene cuando alguien te pregunta por qué hiciste algo así.\n\n'
              + 'Vamos a trabajar tres casos reales de campañas con problemas de imagen y de datos, y a dejar un procedimiento de tres preguntas que te llevás a cualquier reunión. '
              + 'Lo que no podés improvisar en una presentación, lo tenés que tener resuelto antes.',
            puntosClave: [
              'Lo que se publica con IA tiene derechos, consentimiento y riesgo de representación.',
              'Tres preguntas antes de publicar: de quién es, consentí y se parece a mi marca.',
              'La ética no es el cierre: es lo que evita que el cliente se arrepienta.',
            ],
            materiales: [
              { nombre: 'Checklist de ética y derechos en piezas con IA', tipo: 'checklist', peso: '270 KB' },
              { nombre: 'Plantilla de procedencia de contenido', tipo: 'plantilla', peso: '590 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué hace realmente la IA en la producción publicitaria?',
            opciones: [
              'Piensa desde cero como un creativo senior.',
              'Combina, completa y estima a partir de lo que le diste.',
              'Investiga el mercado por su cuenta.',
              'Aprende la voz de tu marca y la conserva entre proyectos.',
            ],
            correcta: 1,
            explicacion: 'No piensa: combina, completa y estima. Por eso el contexto que le des es todo lo que tiene.',
          },
          {
            pregunta: '¿Qué le falta casi siempre a un prompt para servir?',
            opciones: [
              'Más creatividad en la redacción.',
              'Más palabras.',
              'Contexto y criterio, no creatividad.',
              'Formato de salida estructurado.',
            ],
            correcta: 2,
            explicacion: 'La estructura de cinco partes se ocupa del formato. Lo que cambia el resultado es el contexto.',
          },
          {
            pregunta: '¿Cuál NO es una de las tres preguntas del procedimiento?',
            opciones: [
              '¿De quién es esto?',
              '¿Hubo consentimiento para la imagen?',
              '¿Se parece a mi marca?',
              '¿Cuánto cuesta producirlo?',
            ],
            correcta: 3,
            explicacion: 'El costo es una decisión de presupuesto. Las otras tres evitan un problema legal.',
          },
        ],
      },
      {
        id: 'm2',
        titulo: 'Ideación con IA',
        lecciones: [
          {
            id: 'm2-l1',
            titulo: 'De 1 idea a 50',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Generar cincuenta ideas no vale nada. Elegir tres y descartar cuarenta y siete sí. '
              + 'La diferencia está en cómo usás la herramienta: para llenar una pizarra o para filtrar una que ya tenías.\n\n'
              + 'Vamos a trabajar el método de la pizarra invertida: primero escribís tres ideas tuyas, después le pedís a la IA que genere doscientas para criticarlas, y después filtrás. '
              + 'El resultado es tuyo y la lista grande te sirvió.',
            puntosClave: [
              'Generar muchas ideas no vale nada; elegir tres y descartar el resto sí.',
              'La IA sirve mejor para criticar ideas tuyas que para inventarlas por vos.',
              'Pizarra invertida: tres tuyas primero, doscientas después para filtrar.',
            ],
            materiales: [
              { nombre: 'Plantilla de pizarra invertida', tipo: 'plantilla', peso: '810 KB' },
            ],
          },
          {
            id: 'm2-l2',
            titulo: 'Moodboards y key visuals',
            duracionMin: 15,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un moodboard hecho con IA tiene un problema: es demasiado lindo. Y un moodboard demasiado lindo no indica nada sobre tu idea. '
              + 'Es el riesgo de delegar la dirección de arte entera.\n\n'
              + 'Vamos a trabajar cómo pedir key visuals que muestren una dirección y no un lustre genérico, y cómo armar la selección final. '
              + 'Vas a usar una técnica de restricciones: le decís a la herramienta qué no querés, y el resultado mejora más que con lo que sí querés.',
            puntosClave: [
              'Un moodboard demasiado lindo no dice nada de tu idea.',
              'Decirle qué no querés funciona mejor que describir lo que sí querés.',
              'La selección final la hacés vos: la herramienta propone, vos curás.',
            ],
            materiales: [
              { nombre: 'Biblioteca de prompts de key visual', tipo: 'pdf', peso: '580 KB' },
              { nombre: 'Checklist de selección de moodboard', tipo: 'checklist', peso: '250 KB' },
            ],
          },
          {
            id: 'm2-l3',
            titulo: 'Copy con voz propia',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El copy que escribe la IA tiene una voz reconocible, y es la voz de todos. Por eso no se puede publicar tal cual. '
              + 'Se puede usar como primer borrador y después trabajar encima.\n\n'
              + 'Vamos a ver cómo darle voz: escribís vos un párrafo corto con tu manera de hablar, se lo das como referencia, y la herramienta lo usa como tono. '
              + 'Después comparamos los dos textos lado a lado para entender qué cambió.',
            puntosClave: [
              'El copy de IA tiene una voz reconocible porque es la voz de todos.',
              'No se publica tal cual: se usa como primer borrador.',
              'Pasale un párrafo tuyo como referencia de tono y el resultado cambia.',
            ],
            materiales: [
              { nombre: 'Plantilla de tono de referencia', tipo: 'plantilla', peso: '640 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Cuál es el mejor uso de la IA en ideación?',
            opciones: [
              'Generar ideas desde cero y reemplazar el brainstorming.',
              'Criticar y filtrar ideas que ya son tuyas.',
              'Hacer el moodboard final.',
              'Escribir el copy final.',
            ],
            correcta: 1,
            explicacion: 'La pizarra invertida: tres ideas tuyas primero, doscientas de la herramienta después para descartar.',
          },
          {
            pregunta: '¿Qué funciona mejor al pedir un key visual?',
            opciones: [
              'Describir con detalle lo que querés ver.',
              'Decirle qué no querés.',
              'Pedirle muchos estilos a la vez.',
              'Subir una imagen y pedir que la mejore.',
            ],
            correcta: 1,
            explicacion: 'Las restricciones rinden más que la descripción: vos ponés el límite y la herramienta arranca de ahí.',
          },
          {
            pregunta: '¿Por qué el copy de IA no se publica tal cual?',
            opciones: [
              'Porque siempre tiene errores de ortografía.',
              'Porque tiene una voz reconocible que es la voz de todos.',
              'Porque siempre es muy largo.',
              'Porque no funciona en redes.',
            ],
            correcta: 1,
            explicacion: 'Por eso va como primer borrador, con un párrafo tuyo como referencia de tono.',
          },
        ],
      },
      {
        id: 'm3',
        titulo: 'Producción',
        lecciones: [
          {
            id: 'm3-l1',
            titulo: 'Imágenes para piezas',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Producir imágenes con IA es rápido. Producir imágenes que se puedan publicar es lento, porque hay que retocar, ajustar y verificar. '
              + 'La diferencia está en el control de calidad.\n\n'
              + 'Vamos a hacer el recorrido completo de una imagen: generación, variaciones, retoque de manos y de textos, y verificación. '
              + 'Vas a ver que el trabajo real está en los últimos veinte minutos, no en los primeros diez.',
            puntosClave: [
              'Generar es rápido; publicar es lento. El control de calidad es el trabajo real.',
              'Manos y textos son donde se cae la producción: revisá siempre esas dos zonas.',
              'Guardá el prompt de cada imagen que sirva: es tu registro de estilo.',
            ],
            materiales: [
              { nombre: 'Checklist de control de calidad de imagen', tipo: 'checklist', peso: '280 KB' },
              { nombre: 'Biblioteca de prompts de imagen', tipo: 'pdf', peso: '620 KB' },
            ],
          },
          {
            id: 'm3-l2',
            titulo: 'Video y voz',
            duracionMin: 16,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El video con IA es donde más crece el trabajo sin terminar: hay que revisar los derechos de imagen, los de voz y los de música por separado. '
              + 'Son tres capas y casi nadie las chequea.\n\n'
              + 'Vamos a ver cómo producir un clip corto de prueba y qué revisar en cada capa antes de mandarlo a un cliente. '
              + 'Y vamos a practicar el caso más difícil: conseguir una voz que no suene a robot sin que parezca disfrazada.',
            puntosClave: [
              'En video hay que revisar imagen, voz y música por separado.',
              'Guardá los comprobantes de licencia de las tres capas.',
              'Una voz creíble sin que suene disfrazada es la parte más fina del trabajo.',
            ],
            materiales: [
              { nombre: 'Checklist de derechos de video', tipo: 'checklist', peso: '240 KB' },
              { nombre: 'Guion de locución para IA', tipo: 'pdf', peso: '370 KB' },
            ],
          },
          {
            id: 'm3-l3',
            titulo: 'La IA en el flujo de una agencia',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Meter IA en una agencia no es comprar licencias y cambiar los procesos. Es saber en qué paso del flujo conviene y en cuál estorba. '
              + 'Hay tres pasos donde rinde muchísimo y uno donde no aporta nada.\n\n'
              + 'Vamos a mapear el flujo completo de una campaña real, marcar dónde meter la herramienta y dónde dejarla fuera, y a escribir las reglas internas que hacen que el equipo la use sin romper el criterio de la agencia.',
            puntosClave: [
              'Tres pasos del flujo donde la IA rinde mucho; uno donde no aporta.',
              'Sin reglas internas, cada uno la usa como quiere y el criterio se rompe.',
              'Definí quién aprueba. Si nadie aprueba, el flujo se desordena.',
            ],
            materiales: [
              { nombre: 'Mapa de flujo de campaña con IA', tipo: 'hoja', peso: '210 KB' },
              { nombre: 'Checklist de reglas internas', tipo: 'checklist', peso: '260 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Dónde está el trabajo real de producir una imagen con IA?',
            opciones: [
              'En los primeros minutos de generación.',
              'En elegir el prompt.',
              'En los últimos veinte minutos: retoque y verificación.',
              'En elegir la herramienta.',
            ],
            correcta: 2,
            explicacion: 'Generar es rápido. Lo que cuesta es retocar manos, textos y verificar antes de publicar.',
          },
          {
            pregunta: '¿Qué tres capas hay que revisar en un video con IA?',
            opciones: [
              'Color, música y ritmo.',
              'Imagen, voz y música.',
              'Guion, duración y formato.',
              'Texto, etiquetas y subtítulos.',
            ],
            correcta: 1,
            explicacion: 'Son tres capas de derechos distintas y casi nadie las revisa por separado.',
          },
          {
            pregunta: 'Para que una agencia use IA sin romper su criterio hace falta...',
            opciones: [
              'Comprar la licencia más cara.',
              'Reglas internas y una persona que apruebe.',
              'Que cada creativo elija su herramienta.',
              'Dejar de trabajar con clientes grandes.',
            ],
            correcta: 1,
            explicacion: 'Sin reglas internas ni responsable de aprobación, el criterio se desordena.',
          },
        ],
      },
      {
        id: 'm4',
        titulo: 'Proyecto: campaña con IA',
        lecciones: [
          {
            id: 'm4-l1',
            titulo: 'El brief',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un brief para campaña con IA es un brief normal con tres apartados extra: qué se resuelve con herramienta y qué no, qué derechos hay y quién aprueba. '
              + 'Si esos tres no están, la campaña se rompe en la revisión.\n\n'
              + 'Vamos a tomar un brief real de una marca del sector y a reescribirlo con los tres apartados. '
              + 'Vas a notar que el brief queda más corto y más claro, que es exactamente lo que queríamos.',
            puntosClave: [
              'El brief con IA suma tres apartados: qué se resuelve con herramienta, qué derechos hay y quién aprueba.',
              'Un brief más corto y más claro rinde más que uno largo y vago.',
              'Si el brief no dice quién aprueba, la revisión se estira semanas.',
            ],
            materiales: [
              { nombre: 'Plantilla de brief con IA', tipo: 'plantilla', peso: '930 KB' },
            ],
          },
          {
            id: 'm4-l2',
            titulo: 'Producción',
            duracionMin: 17,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Producir con IA sin romperse el presupuesto ni los plazos es un problema de secuencia. Hay tres momentos donde conviene producir mucho y uno donde conviene producir poco. '
              + 'Vamos a ordenar la producción completa de una campaña con todos sus entregables.\n\n'
              + 'Vas a ver que producir de más al principio es un error caro: lo que no se usa se pagó igual. '
              + 'La secuencia correcta produce en orden de riesgo, no en orden de prioridad.',
            puntosClave: [
              'Produce en orden de riesgo, no en orden de prioridad.',
              'Producir de más al principio es un error caro: lo que no se usa se pagó igual.',
              'Tres momentos para producir mucho, uno para producir poco.',
            ],
            materiales: [
              { nombre: 'Cronograma de producción con IA', tipo: 'hoja', peso: '160 KB' },
              { nombre: 'Checklist de control de calidad por entregable', tipo: 'checklist', peso: '270 KB' },
            ],
          },
          {
            id: 'm4-l3',
            titulo: 'Presentación al cliente',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Presentar una campaña producida con IA tiene una diferencia con cualquier otra: hay que decir desde cuándo se usó y dónde está el criterio humano. '
              + 'Ocultarlo es un riesgo; decirlo es una ventaja.\n\n'
              + 'Vamos a armar la presentación con una sección que las campañas de siempre no tienen, y a practicarla con dos versiones: con la herramienta visible y sin ella. '
              + 'Vas a ver que la versión honesta genera más confianza y mejor feedback.',
            puntosClave: [
              'Decir dónde usaste IA es una ventaja, no un riesgo.',
              'La sección de criterio humano separa una entrega defendible de una que parece copiada.',
              'La versión honesta genera mejor feedback que la versión escondida.',
            ],
            materiales: [
              { nombre: 'Guion de presentación de campaña con IA', tipo: 'pdf', peso: '480 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué tres apartados suma un brief para campaña con IA?',
            opciones: [
              'Presupuesto, plazos y equipo.',
              'Qué se resuelve con herramienta, qué derechos hay y quién aprueba.',
              'Copy, diseño y medios.',
              'Prompt, modelo y versión.',
            ],
            correcta: 1,
            explicacion: 'Si esos tres no están, la campaña se rompe en la revisión.',
          },
          {
            pregunta: '¿En qué orden conviene producir?',
            opciones: [
              'Por prioridad del cliente.',
              'Por riesgo.',
              'Por precio de la herramienta.',
              'Por tipo de entregable.',
            ],
            correcta: 1,
            explicacion: 'En orden de riesgo. Producir de más al principio es un error caro.',
          },
          {
            pregunta: 'Al presentar una campaña hecha con IA conviene...',
            opciones: [
              'No mencionarlo para no generar dudas.',
              'Decir dónde la usaste y cuál fue el criterio humano.',
              'Mostrar los resultados sin explicar el proceso.',
              'Esperar a que el cliente pregunte.',
            ],
            correcta: 1,
            explicacion: 'Decirlo es una ventaja: genera más confianza y mejor feedback.',
          },
        ],
      },
    ],
  };

  /* ------------------------------------------------------------
     CURSO 4 · UX/UI PARA PUBLICISTAS (Mateo Restrepo)
     ------------------------------------------------------------ */

  var UX = {
    id: 'ux-ui-publicistas',
    emoji: '🧭',
    titulo: 'UX/UI para Publicistas',
    tituloCorto: 'UX/UI',
    descripcion:
      'Diseñar bien no es dibujar lindo: es hacer que alguien llegue a donde tiene que llegar sin preguntarse por el camino.'
      + 'Tres módulos para investigar rápido, construir interfaces con sistema y probar lo que hiciste antes de quejarse el cliente. '
      + 'Pensado para publicistas que terminan hablando con desarrollo.',
    profesorId: 'mateo-restrepo',
    color: 'cta',
    modulos: [
      {
        id: 'm1',
        titulo: 'Pensar en usuarios',
        lecciones: [
          {
            id: 'm1-l1',
            titulo: 'Investigación rápida',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Investigar no es hacer un estudio de mercado. Es aprender lo justo para no construir la cosa equivocada. '
              + 'Se puede hacer en una tarde y casi siempre alcanza.\n\n'
              + 'Vamos a trabajar tres técnicas que se aplican sin presupuesto: entrevista corta, observación de uso y lectura de comentarios públicos. '
              + 'Con eso armás un mapa de problemas reales en lugar de SUPUESTOS.',
            puntosClave: [
              'Investigar es aprender lo justo para no construir la cosa equivocada.',
              'Tres técnicas sin presupuesto: entrevista corta, observación y lectura de comentarios.',
              'Un mapa de problemas reales vale más que diez supuestos.',
            ],
            materiales: [
              { nombre: 'Guion de entrevista corta', tipo: 'pdf', peso: '350 KB' },
              { nombre: 'Plantilla de mapa de problemas', tipo: 'plantilla', peso: '700 KB' },
            ],
          },
          {
            id: 'm1-l2',
            titulo: 'Mapas de empatía',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El mapa de empatía existe para volver concreto algo abstracto. No es un poster: es una herramienta para decidir. '
              + 'Cuando el equipo discute una funcionalidad, el mapa muestra quién la necesita y quién no.\n\n'
              + 'Vamos a hacer dos mapas reales y a usar el segundo para slicing una lista de funciones priorizadas. '
              + 'Vas a ver que la discusión deja de ser de gustos.',
            puntosClave: [
              'El mapa de empatía vuelve concreto lo abstracto.',
              'Cuando se discute una funcionalidad, el mapa muestra quién la necesita.',
              'Se usa para slicing: después la lista priorizada no se debate por gusto.',
            ],
            materiales: [
              { nombre: 'Plantilla de mapa de empatía', tipo: 'plantilla', peso: '850 KB' },
              { nombre: 'Checklist de priorización por usuario', tipo: 'checklist', peso: '250 KB' },
            ],
          },
          {
            id: 'm1-l3',
            titulo: 'Customer journey',
            duracionMin: 11,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El journey no describe lo que la persona piensa: describe lo que hace, en qué momento y con qué estado de ánimo. '
              + 'La diferencia importa porque las decisiones de diseño salen del estado de ánimo, no del diagrama.\n\n'
              + 'Vamos a mapear el journey de una compra real y a marcar los tres momentos de mayor fricción. '
              + 'Esos tres momentos son donde vale la pena invertir el tiempo de diseño.',
            puntosClave: [
              'El journey describe lo que la persona hace y con qué estado de ánimo.',
              'Las decisiones de diseño salen del estado de ánimo, no del diagrama.',
              'Los tres momentos de mayor fricción son donde vale invertir diseño.',
            ],
            materiales: [
              { nombre: 'Plantilla de customer journey', tipo: 'plantilla', peso: '780 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Cuál es el objetivo real de investigar?',
            opciones: [
              'Tener un documento para mostrarle al cliente.',
              'Aprender lo justo para no construir la cosa equivocada.',
              'Justificar el presupuesto del proyecto.',
              'Completar el proceso de la agencia.',
            ],
            correcta: 1,
            explicacion: 'Se puede hacer en una tarde y casi siempre alcanza.',
          },
          {
            pregunta: '¿Para qué sirve un mapa de empatía en una discusión de equipo?',
            opciones: [
              'Para demostrar que el Senior tiene razón.',
              'Para mostrar quién necesita la funcionalidad y quién no.',
              'Para reemplazar la investigación.',
              'Para agregar trabajo al proyecto.',
            ],
            correcta: 1,
            explicacion: 'Convierte la discusión de gustos en una discusión sobre usuarios concretos.',
          },
          {
            pregunta: '¿De qué salen las decisiones de diseño?',
            opciones: [
              'Del diagrama del journey.',
              'Del estado de ánimo de la persona en cada momento.',
              'De las trendy de la industria.',
              'De lo que pidió el cliente.',
            ],
            correcta: 1,
            explicacion: 'Por eso el journey incluye cómo se siente la persona, no solo qué hace.',
          },
        ],
      },
      {
        id: 'm2',
        titulo: 'Diseñar la interfaz',
        lecciones: [
          {
            id: 'm2-l1',
            titulo: 'Arquitectura de información',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'La arquitectura de información responde una pregunta: dónde está cada cosa y por qué está ahí. '
              + 'Si esa respuesta no existe, el menú crece hasta ser un laberinto.\n\n'
              + 'Vamos a ordenar el contenido de un sitio real con el método de agrupar, ordenar y etiquetar, y a probar el resultado con la prueba del pasillo: '
              + 'pedile a alguien que encuentre algo en 30 segundos y observá dónde se traba.',
            puntosClave: [
              'La arquitectura responde dónde está cada cosa y por qué.',
              'Ordenar con la tarjeta: agrupa, etiqueta y recién después arma el menú.',
              'La prueba del pasillo de 30 segundos muestra dónde se traba el diseño.',
            ],
            materiales: [
              { nombre: 'Plantilla de arquitectura de información', tipo: 'plantilla', peso: '820 KB' },
              { nombre: 'Checklist de etiquetado', tipo: 'checklist', peso: '210 KB' },
            ],
          },
          {
            id: 'm2-l2',
            titulo: 'Wireframes',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El wireframe existe para que discutan la estructura antes de discutir el color. Es la herramienta más barata y la que más ahorra dinero. '
              + 'Si el wireframe no convence, ningún mockup lo va a arreglar.\n\n'
              + 'Vamos a hacer tres wireframes de la misma pantalla en distintos niveles de detalle, y a ver qué se puede decidir en cada etapa. '
              + 'Después vas a usar esa escalera para no maquillar antes de tiempo.',
            puntosClave: [
              'El wireframe sirve para discutir estructura antes de discutir color.',
              'Si el wireframe no convence, ningún mockup lo arregla.',
              'Tres niveles de detalle: cada uno sirve para una decisión distinta.',
            ],
            materiales: [
              { nombre: 'Kit de wireframes en tres niveles', tipo: 'plantilla', peso: '1,3 MB' },
            ],
          },
          {
            id: 'm2-l3',
            titulo: 'UI con sistema',
            duracionMin: 15,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un componente bien diseñado se usa en veinte pantallas y por eso se nota. Uno mal diseñado se nota en todas. '
              + 'La UI con sistema es aceptar que no todo puede ser distinto.\n\n'
              + 'Vamos a construir un set mínimo de componentes: botón, campo, tarjeta y navegación, con sus estados. '
              + 'Vas a ver cómo se pierde el 40 por ciento del tiempo de diseño el primer día y se recupera en los siguientes veinte.',
            puntosClave: [
              'Un componente bien diseñado se usa en veinte pantallas.',
              'Botón, campo, tarjeta y navegación con sus estados: ese es el set mínimo.',
              'Se pierde tiempo el primer día y se recupera en los veinte siguientes.',
            ],
            materiales: [
              { nombre: 'Set de componentes con estados', tipo: 'plantilla', peso: '1,6 MB' },
              { nombre: 'Checklist de accesibilidad de componentes', tipo: 'checklist', peso: '280 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Para qué sirve un wireframe?',
            opciones: [
              'Para mostrar el color y la tipografía al cliente.',
              'Para discutir la estructura antes de discutir el color.',
              'Para entregar el proyecto más rápido.',
              'Para reemplazar el test de usabilidad.',
            ],
            correcta: 1,
            explicacion: 'Es la herramienta más barata. Si el wireframe no convence, ningún mockup lo arregla.',
          },
          {
            pregunta: '¿Cuál es el orden correcto para ordenar contenido?',
            opciones: [
              'Armar el menú, después agrupar, después etiquetar.',
              'Etiquetar, agrupar y recién después armar el menú.',
              'Hacer el mockup primero.',
              'Preguntarle al cliente qué ítems quiere.',
            ],
            correcta: 1,
            explicacion: 'Si agrupás mal, ningún nombre de menú lo salva.',
          },
          {
            pregunta: '¿Por qué un set de componentes ahorra tiempo?',
            opciones: [
              'Porque hace el trabajo más rápido solo.',
              'Porque lo que está resuelto no se vuelve a discutir en cada pantalla.',
              'Porque reduce el número de pantallas.',
              'Porque el cliente lo exige.',
            ],
            correcta: 1,
            explicacion: 'Se pierde tiempo el primer día y se recupera en los veinte siguientes.',
          },
        ],
      },
      {
        id: 'm3',
        titulo: 'Probar y mejorar',
        lecciones: [
          {
            id: 'm3-l1',
            titulo: 'Test de usabilidad',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un test de usabilidad no es una encuesta: es ver a alguien intentar la tarea mientras vos no ayudás. '
              + 'La incomodidad del silencio es exactamente el instrumento.\n\n'
              + 'Vamos a diseñar un test de cinco tareas, grabarlo y leer los resultados sin engancharnos a las palabras bonitas. '
              + 'Vas a ver que los tres problemas más comunes casi nunca son los que el cliente dice.',
            puntosClave: [
              'Un test es ver a alguien intentar la tarea mientras vos no ayudás.',
              'El silencio incómodo es el instrumento, no un problema.',
              'Los tres problemas más comunes casi nunca son los que el cliente dice.',
            ],
            materiales: [
              { nombre: 'Guion de test de usabilidad de 5 tareas', tipo: 'pdf', peso: '440 KB' },
              { nombre: 'Hoja de registro de observaciones', tipo: 'hoja', peso: '130 KB' },
            ],
          },
          {
            id: 'm3-l2',
            titulo: 'Métricas de UX',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Las métricas de UX dicen si algo mejoró, pero nunca dicen por qué. Por eso el dato y la observación van juntos: uno sin el otro no sirve. '
              + 'Un porcentaje sin historia no se puede discutir con nadie.\n\n'
              + 'Vamos a emparejar tres métricas con la observación que las explica, y a construir un informe que un equipo pueda usar el lunes. '
              + 'Después aprendemos a detectar la métrica que se puede manipular fácil, que es la trampa más común.',
            puntosClave: [
              'La métrica dice si mejoró; la observación dice por qué.',
              'Un porcentaje sin historia no se puede discutir.',
              'Cuidado con las métricas fáciles de manipular: son la trampa más común.',
            ],
            materiales: [
              { nombre: 'Tabla de métricas con su observación', tipo: 'plantilla', peso: '560 KB' },
            ],
          },
          {
            id: 'm3-l3',
            titulo: 'Handoff a desarrollo',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El handoff no es entregar un archivo: es transferir decisiones. Lo que no está documentado vuelve como pregunta, y cada pregunta es un día de retraso. '
              + 'La culpa es del que entrega, no del que pregunta.\n\n'
              + 'Vamos a armar un handoff mínimo con cuatro cosas: sistema, estados, reglas de responsive y excepciones. '
              + 'Con eso el equipo de desarrollo avanza sin necesitar una reunión diaria, y tu trabajo deja de depender de tu memoria.',
            puntosClave: [
              'El handoff transfiere decisiones, no archivos.',
              'Lo que no está documentado vuelve como pregunta, y cada pregunta es un día.',
              'Cuatro cosas: sistema, estados, responsive y excepciones.',
            ],
            materiales: [
              { nombre: 'Plantilla de handoff de diseño', tipo: 'plantilla', peso: '980 KB' },
              { nombre: 'Checklist de QA visual', tipo: 'checklist', peso: '300 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué es un test de usabilidad?',
            opciones: [
              'Una encuesta de satisfacción.',
              'Ver a alguien intentar la tarea mientras vos no ayudás.',
              'Un test de velocidad de carga.',
              'Una revisión de textos.',
            ],
            correcta: 1,
            explicacion: 'El silencio incómodo es el instrumento. La encuesta devuelve lo educado.',
          },
          {
            pregunta: '¿Por qué el dato y la observación van juntos?',
            opciones: [
              'Para tener más datos en el informe.',
              'Porque la métrica dice si mejoró y la observación dice por qué.',
              'Porque el cliente los pide juntos.',
              'Para justificar el presupuesto.',
            ],
            correcta: 1,
            explicacion: 'Un porcentaje sin historia no se puede discutir con nadie.',
          },
          {
            pregunta: '¿Qué es lo que hay que transferir en un handoff?',
            opciones: [
              'Solo el archivo final.',
              'Decisiones, con sistema, estados, responsive y excepciones.',
              'Una presentación con imágenes.',
              'El contrato con la agencia.',
            ],
            correcta: 1,
            explicacion: 'Lo que no está documentado vuelve como pregunta, y cada pregunta cuesta un día.',
          },
        ],
      },
    ],
  };

  /* ------------------------------------------------------------
     CURSO 5 · NEUROVENTAS (Camilo Torres)
     ------------------------------------------------------------ */

  var NEURO = {
    id: 'neuroventas',
    emoji: '🧠',
    titulo: 'Neuroventas',
    tituloCorto: 'Neuroventas',
    descripcion:
      'La neuroventas no es Leer el cerebro: es entender por qué una decisión rápida tiene siempre la misma forma. '
      + 'Tres módulos sobre sesgos, mensajes y la ética de persuadir, aplicados a piezas publicitarias reales. '
      + 'Terminás sabiendo qué hace que alguien pase de ver a actuar, y qué parte de eso conviene no tocar.',
    profesorId: 'camilo-torres',
    color: 'light-blue',
    modulos: [
      {
        id: 'm1',
        titulo: 'El cerebro que compra',
        lecciones: [
          {
            id: 'm1-l1',
            titulo: 'Sistema 1 y Sistema 2',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'La idea de dos sistemas sirve para entender por qué una persona decide cosas distintas en un segundo y en diez minutos. '
              + 'Sistema 1 va rápido y no pregunta; sistema 2 va lento y se cansa.\n\n'
              + 'En publicidad, casi todo pasa por el sistema 1: el color, la forma, la música y la primera frase. '
              + 'Vamos a ver cómo se aplica eso sin caer en la exageración, y por qué una marca que solo habla al sistema 1 se olvida.',
            puntosClave: [
              'Sistema 1 decide rápido y no pregunta; sistema 2 se cansa.',
              'Color, forma y primera frase pasan casi siempre por el sistema 1.',
              'Una marca que solo habla al sistema 1 se olvida: hace falta una idea que el sistema 2 pueda sostener.',
            ],
            materiales: [
              { nombre: 'Cheatsheet de sistema 1 y sistema 2', tipo: 'pdf', peso: '520 KB' },
            ],
          },
          {
            id: 'm1-l2',
            titulo: 'Sesgos que mueven decisiones',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Los sesgos no son errores: son atajos que el cerebro usa todo el tiempo para decidir rápido. '
              + 'Entender cuáles aplicás a diario explica por qué dos personas con la misma información compran distinto.\n\n'
              + 'Vamos a trabajar cuatro sesgos con aplicación publicitaria directa: anclaje, prueba social, efecTo de defaults y pérdida. '
              + 'Cada uno con su ejemplo y con el momento del embudo donde pesa más.',
            puntosClave: [
              'Los sesgos son atajos, no errores: por eso son tan difíciles de quitar.',
              'Anclaje, prueba social, efecto de las opciones por defecto y pérdida: cuatro con aplicación directa.',
              'Cada sesgo pesa más en un momento del embudo que en otro.',
            ],
            materiales: [
              { nombre: 'Guía de cuatro sesgos con ejemplos', tipo: 'pdf', peso: '680 KB' },
              { nombre: 'Checklist de sesgos por etapa del embudo', tipo: 'checklist', peso: '240 KB' },
            ],
          },
          {
            id: 'm1-l3',
            titulo: 'Emoción vs. razón',
            duracionMin: 11,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'La falsa pelea entre emoción y razón: las dos trabajan juntas y en orden. '
              + 'La emoción abre la puerta y la razón justifica la compra. Cambiar ese orden es el error más común en la publicidad.\n\n'
              + 'Vamos a tomar tres piezas reales, una que empieza por la emoción y otra que empieza por el argumento, y a ver cuál retiene mejor. '
              + 'Después vas a poder armar tu propia pieza entendiendo el orden correcto.',
            puntosClave: [
              'Emoción y razón trabajan juntas y en orden.',
              'La emoción abre la puerta, la razón justifica: cambiar el orden rompe la pieza.',
              'Empezar por el argumento sin abrir la puerta es el error más común.',
            ],
            materiales: [
              { nombre: 'Análisis de tres piezas reales', tipo: 'pdf', peso: '490 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué caracteriza al sistema 1?',
            opciones: [
              'Va lento, pregunta y duda.',
              'Va rápido, no pregunta y decide por atajo.',
              'Solo aparece en compras caras.',
              'Depende del nivel de estudios.',
            ],
            correcta: 1,
            explicacion: 'Por eso en publicidad casi todo pasa por el sistema 1: color, forma y primera frase.',
          },
          {
            pregunta: '¿Por qué los sesgos no son errores?',
            opciones: [
              'Porque son intencionales.',
              'Porque son atajos que el cerebro usa siempre para decidir rápido.',
              'Porque son culpa de la publicidad.',
              'Porque son heredados.',
            ],
            correcta: 1,
            explicacion: 'Y por eso son tan difíciles de quitar de un mensaje.',
          },
          {
            pregunta: '¿Cuál es el orden correcto entre emoción y razón?',
            opciones: [
              'Razón primero, emoción después.',
              'Emoción y razón al mismo tiempo.',
              'Emoción abre la puerta y la razón justifica la compra.',
              'Solo emoción.',
            ],
            correcta: 2,
            explicacion: 'Empezar por el argumento sin abrir la puerta es el error más común en la pieza.',
          },
        ],
      },
      {
        id: 'm2',
        titulo: 'Mensajes que conectan',
        lecciones: [
          {
            id: 'm2-l1',
            titulo: 'Gatillos sin manipular',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Un gatillo es un elemento concreto que hace fácil decidir. Lo que lo vuelve manipulación no es existir: es ocultar el costo o exagerar la urgencia. '
              + 'La diferencia es de ethics, no de técnica.\n\n'
              + 'Vamos a construir seis gatillos honestos y descartamos seis versões confusas que usan los mismos recursos. '
              + 'Vas a ver que se separan fácil: uno dice el costo, el otro lo esconde.',
            puntosClave: [
              'Un gatillo es un elemento concreto que hace fácil decidir.',
              'La diferencia entre gatillo y manipulación es si el costo está escondido o la urgencia exagerada.',
              'Se separan fácil: uno dice el costo, el otro lo esconde.',
            ],
            materiales: [
              { nombre: 'Seis gatillos honestos y seis trampas', tipo: 'pdf', peso: '610 KB' },
              { nombre: 'Checklist de honestidad del mensaje', tipo: 'checklist', peso: '230 KB' },
            ],
          },
          {
            id: 'm2-l2',
            titulo: 'Storytelling de venta',
            duracionMin: 14,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Una historia de venta no es un relato decorativo: es una estructura que hace que el oyente termine haciendo lo que querías. '
              + 'La estructura más útil para publicidad es simple: alguien, quiere algo, no puede, entonces cambia algo.\n\n'
              + 'Vamos a escribir tres historias con esa estructura para tres productos distintos, y a probarlas escribiéndolas en 200 palabras. '
              + 'El límite de palabras es lo que obliga a que la historia tenga forma.',
            puntosClave: [
              'La estructura más útil: alguien, quiere algo, no puede, entonces cambia algo.',
              'El límite de palabras obliga a que la historia tenga forma.',
              'Una historia sin conflicto es un aviso, no una historia.',
            ],
            materiales: [
              { nombre: 'Plantilla de historia de venta en 200 palabras', tipo: 'plantilla', peso: '640 KB' },
            ],
          },
          {
            id: 'm2-l3',
            titulo: 'Pruebas A/B de copy',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Una prueba de copy mal planteada es la forma más rápida de perder tiempo y ganar confianza en nada. '
              + 'Si cambias la oferta y el titular a la vez, no aprendiste nada.\n\n'
              + 'Vamos a diseñar tres pruebas de copy bien hechas: una sola variable, un tamaño que signifique algo y una duración declarada de antemano. '
              + 'Después vas a ver cómo se comunica un resultado negativo sin perder credibilidad.',
            puntosClave: [
              'Si cambias oferta y titular a la vez, no aprendiste nada.',
              'Una sola variable, un tamaño que signifique algo y una duración declarada.',
              'Un resultado negativo bien comunicado no pierde credibilidad.',
            ],
            materiales: [
              { nombre: 'Plantilla de prueba de copy', tipo: 'plantilla', peso: '590 KB' },
              { nombre: 'Plantilla de informe de resultado negativo', tipo: 'pdf', peso: '330 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué diferencia un gatillo de la manipulación?',
            opciones: [
              'El tamaño del texto.',
              'Si el costo está escondido o la urgencia está exagerada.',
              'Si se usa en video o en print.',
              'Si la marca es grande o pequeña.',
            ],
            correcta: 1,
            explicacion: 'La diferencia es de ética, no de técnica: uno dice el costo, el otro lo esconde.',
          },
          {
            pregunta: '¿Cuál es la estructura más útil de una historia de venta?',
            opciones: [
              'Un problema, una solución y un precio.',
              'Alguien, quiere algo, no puede, entonces cambia algo.',
              'Marca, beneficio y llamada a la acción.',
              'Un antes y un después.',
            ],
            correcta: 1,
            explicacion: 'Una historia sin conflicto es un aviso, no una historia.',
          },
          {
            pregunta: '¿Qué arruina una prueba de copy?',
            opciones: [
              'Usar una muestra pequeña.',
              'Cambiar la oferta y el titular a la vez.',
              'Declarar la duración de antemano.',
              'Probar más de una variable.',
            ],
            correcta: 1,
            explicacion: 'Si cambias dos variables no aprendiste nada: el resultado no se puede atribuir.',
          },
        ],
      },
      {
        id: 'm3',
        titulo: 'Llevarlo a la pauta',
        lecciones: [
          {
            id: 'm3-l1',
            titulo: 'Creativos que detienen el scroll',
            duracionMin: 13,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'Detener el scroll no es llamar la atención: es no decir lo mismo que los otros veinte anuncios que están pasando. '
              + 'La diferencia es que el patrón se rompe con una idea, no con un efecto.\n\n'
              + 'Vamos a revisar por qué algunos formatosেনen buen CTR y mala conversión, y a construir seis primer cuadro con tres ideas distintas. '
              + 'El primer cuadro decide más que el resto del video.',
            puntosClave: [
              'Detener el scroll es no repetir lo que dicen los otros veinte anuncios.',
              'El patrón se rompe con una idea, no con un efecto.',
              'El primer cuadro decide más que el resto del video.',
            ],
            materiales: [
              { nombre: 'Seis primeros cuadro con tres ideas', tipo: 'plantilla', peso: '720 KB' },
            ],
          },
          {
            id: 'm3-l2',
            titulo: 'Landing y precio',
            duracionMin: 15,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'El precio en una landing es una decisión de diseño, no solo de negocio. '
              + 'Mostrarlo bien baja la fricción y sube la confianza; esconderlo sube las registraciones y baja la conversión.\n\n'
              + 'Vamos a trabajar tres formas de mostrar precio, con sus consecuencias reales, y a revisar cómo la gente lee un precio cuando no lo entiende. '
              + 'Después ajustamos una landing real con lo que sale de la prueba.',
            puntosClave: [
              'El precio es una decisión de diseño, no solo de negocio.',
              'Esconderlo sube registraciones y baja conversión.',
              'Un precio que no se entiende se lee como caro.',
            ],
            materiales: [
              { nombre: 'Tres formas de mostrar precio comparadas', tipo: 'pdf', peso: '540 KB' },
              { nombre: 'Checklist de landing con precio visible', tipo: 'checklist', peso: '260 KB' },
            ],
          },
          {
            id: 'm3-l3',
            titulo: 'La ética de persuadir',
            duracionMin: 12,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'La línea entre persuadir y manipular se cruza en un solo punto: ocultar información relevante. '
              + 'Todo lo demás, incluidos los gatillos, es juego limpio si el costo está a la vista.\n\n'
              + 'Vamos a escribir la política de persuasión de una agencia: qué se puede hacer, qué no y quién decide. '
              + 'Con esa política, las discusiones dejan de ser personales y el equipo puede trabajar más rápido.',
            puntosClave: [
              'La línea se cruza en un punto: ocultar información relevante.',
              'Los gatillos son juego limpio si el costo está a la vista.',
              'Una política escrita saca la discusión del terreno personal.',
            ],
            materiales: [
              { nombre: 'Plantilla de política de persuasión', tipo: 'plantilla', peso: '540 KB' },
              { nombre: 'Checklist de revisión ética de piezas', tipo: 'checklist', peso: '270 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué hace que un creativo detenga el scroll?',
            opciones: [
              'Un efecto visual llamativo.',
              'No repetir lo que dicen los otros veinte anuncios.',
              'Subir el volumen del audio.',
              'Usar un rostro conocido.',
            ],
            correcta: 1,
            explicacion: 'El patrón se rompe con una idea, no con un efecto.',
          },
          {
            pregunta: '¿Qué pasa si escondés el precio en la landing?',
            opciones: [
              'Suben las registraciones y baja la conversión.',
              'Suben las ventas siempre.',
              'No cambia nada medible.',
              'Solo afecta a la confianza.',
            ],
            correcta: 0,
            explicacion: 'Es una decisión de diseño: esconder el precio sube registraciones y baja conversión.',
          },
          {
            pregunta: '¿En qué punto se cruza la línea de la manipulación?',
            opciones: [
              'Al usar un gatillo.',
              'Al ocultar información relevante.',
              'Al usar video en lugar de imagen.',
              'Al hablar de precio.',
            ],
            correcta: 1,
            explicacion: 'Todo lo demás es juego limpio si el costo está a la vista.',
          },
        ],
      },
    ],
  };

  /* ------------------------------------------------------------
     CURSO 6 · PORTAFOLIO QUE HABLA (Juan Esteban Cardona)
     ------------------------------------------------------------ */

  var PORTAFOLIO = {
    id: 'portafolio-que-habla',
    emoji: '💼',
    titulo: 'Portafolio que Habla por Ti',
    tituloCorto: 'Portafolio',
    descripcion:
      'Un portafolio no se mira: se lee. Y lo que se lee es si sos la persona que el cliente está buscando. '
      + 'Tres módulos para mostrar menos piezas, contarlas como casos y cobrar lo que vale lo que hacés. '
      + 'Terminás con un portafolio que trabaja por vos cuando no estás en la reunión.',
    profesorId: 'juan-esteban-cardona',
    color: 'brand-deep',
    modulos: [
      {
        id: 'm1',
        titulo: 'Qué mostrar',
        lecciones: [
          {
            id: 'm1-l1',
            titulo: 'Curaduría sin piedad',
            duracionMin: 11,
            videoUrl: null, // TODO: pegar link de YouTube/Vimeo (no listado)
            descripcion:
              'La curaduría es la única parte del portafolio que es 100% tuya. El resto es ejecución. '
              + 'Y casi siempre el problema no es que falten piezas: es que sobran.\n\n'
              + 'Vamos a aplicar un filtro de tres preguntas a todo lo que tenés guardado, y a dejar por escrito qué se va y por qué. '
              + 'Lo que queda son seis u ocho piezas que dicen lo mismo y con la misma voz.',
            puntosClave: [
              'La curaduría es la única parte del portafolio que es 100% tuya.',
              'Casi siempre el problema no es que falten piezas: es que sobran.',
              'Dejá escrito por qué sale cada pieza: eso te ordena el criterio.',
            ],
            materiales: [
              { nombre: 'Filtro de curaduría en 3 preguntas', tipo: 'checklist', peso: '180 KB' },
              { nombre: 'Hoja de descartes con motivo', tipo: 'hoja', peso: '150 KB' },
            ],
          },
          {
            id: 'm1-l2',
            titulo: 'Casos en vez de piezas',
            duracionMin: 14,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'Una pieza dice qué hiciste. Un caso dice qué pasó por tu cabeza y qué pasó después. '
              + 'El cliente no compra imágenes lindas: compra criterio, y el criterio se demuestra en el proceso.\n\n'
              + 'Vamos a convertir una pieza tuya en un caso completo con cinco bloques: contexto, problema, decisión, resultado y aprendizaje. '
              + 'Vas a notar que el 80% del trabajo es de escritura, no de diseño.',
            puntosClave: [
              'Una pieza dice qué hiciste; un caso dice qué decidiste.',
              'El cliente no compra imágenes lindas: compra criterio.',
              'El 80% de un caso bien contado es escritura, no diseño.',
            ],
            materiales: [
              { nombre: 'Plantilla de caso en 5 bloques', tipo: 'plantilla', peso: '520 KB' },
            ],
          },
          {
            id: 'm1-l3',
            titulo: 'Tu posicionamiento',
            duracionMin: 12,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'El posicionamiento no es tu eslogan: es la suma de las decisiones que repetís siempre. '
              + 'Se deduce de lo que hacés, no de lo que decís que hacés.\n\n'
              + 'Vamos a escribir tu posicionamiento en una frase y a contrastarlo con tus últimos seis trabajos. '
              + 'Si la frase no se puede ver en tus piezas, el posicionamiento es ficção y hay que cambiarlo.',
            puntosClave: [
              'El posicionamiento es la suma de las decisiones que repetís siempre.',
              'Se deduce de lo que hacés, no de lo que decís que hacés.',
              'Si no se puede ver en tus piezas, es ficción.',
            ],
            materiales: [
              { nombre: 'Plantilla de posicionamiento en una frase', tipo: 'plantilla', peso: '300 KB' },
              { nombre: 'Checklist de coherencia de portafolio', tipo: 'checklist', peso: '200 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Cuál es el problema más común de un portafolio?',
            opciones: [
              'Que le faltan piezas.',
              'Que sobran piezas y ninguna habla de criterio.',
              'Que está en muy pocos formatos.',
              'Que el diseño es feo.',
            ],
            correcta: 1,
            explicacion: 'La curaduría es lo único 100% tuyo: sobran piezas y faltan decisiones.',
          },
          {
            pregunta: '¿Qué diferencia una pieza de un caso?',
            opciones: [
              'El caso lleva más imágenes.',
              'El caso cuenta qué decidiste y qué pasó después.',
              'El caso es más largo.',
              'El caso tiene el logo del cliente.',
            ],
            correcta: 1,
            explicacion: 'El cliente compra criterio, y el criterio vive en el proceso, no en la imagen final.',
          },
          {
            pregunta: '¿De dónde sale un posicionamiento real?',
            opciones: [
              'Del eslogan que escribís en la web.',
              'De lo que repetís siempre en tus decisiones.',
              'De lo que pide el mercado.',
              'De tu formación.',
            ],
            correcta: 1,
            explicacion: 'Si no se puede ver en tus piezas, el posicionamiento es ficción.',
          },
        ],
      },
      {
        id: 'm2',
        titulo: 'Cómo mostrarlo',
        lecciones: [
          {
            id: 'm2-l1',
            titulo: 'Fotografía y mockups',
            duracionMin: 13,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'La foto de un trabajo es el resumen de tu criterio. Si se ve como la sacó cualquiera, el resto del portafolio pierde credibilidad antes de leerse.\n\n'
              + 'Vamos a revisar luz, encuadre y fondo con un celular, y a construir un set de mockups con plantillas que no gritan "plantilla". '
              + 'El objetivo es que se vea tuyo, no que se vea caro.',
            puntosClave: [
              'La foto es el resumen de tu criterio.',
              'Luz, encuadre y fondo con un celular: alcanza y sobra.',
              'Un mockup debe verse tuyo, no caro.',
            ],
            materiales: [
              { nombre: 'Checklist de foto de trabajo', tipo: 'checklist', peso: '210 KB' },
              { nombre: 'Set de mockups limpios', tipo: 'plantilla', peso: '760 KB' },
            ],
          },
          {
            id: 'm2-l2',
            titulo: 'Behance vs. web propia',
            duracionMin: 15,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'Behance sirve para que te descubran. La web propia sirve para que te contraten. No compiten: se usan en orden.\n\n'
              + 'Vamos a comparar las dos plataformas con los ojos del cliente que busca talento: cómo llega, qué entiende en 20 segundos y qué salida tiene. '
              + 'Después armás un combo simple: una en cada una, con la misma pieza de arranque.',
            puntosClave: [
              'Behance sirve para que te descubran; la web propia, para que te contraten.',
              'Se usan en orden, no compiten.',
              'Combo simple: una pieza de arranque en las dos.',
            ],
            materiales: [
              { nombre: 'Comparativa de plataformas de portafolio', tipo: 'pdf', peso: '580 KB' },
            ],
          },
          {
            id: 'm2-l3',
            titulo: 'La narrativa del caso',
            duracionMin: 14,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'La narrativa es el orden en el que se cuenta el caso. Cambiarlo cambia lo que el cliente entiende, aunque las piezas sean las mismas. '
              + 'Casi siempre se empieza por el resultado y eso es un error: el resultado sin problema no significa nada.\n\n'
              + 'Vamos a reescribir tres casos en dos órdenes distintos —problema primero y resultado primero— y a medir cuánto tarda el lector en entender cada uno. '
              + 'El orden que gana no siempre es el intuitivo.',
            puntosClave: [
              'Cambiar el orden del caso cambia lo que el cliente entiende.',
              'Empezar por el resultado sin problema no significa nada.',
              'Probá los dos órdenes: el que gana no siempre es el intuitivo.',
            ],
            materiales: [
              { nombre: 'Plantilla de narrativa de caso', tipo: 'plantilla', peso: '470 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué demuestra una buena foto de trabajo?',
            opciones: [
              'Que tenés equipo caro.',
              'Tu criterio, desde el encuadre.',
              'Que la pieza fue fácil de hacer.',
              'Que tenés tiempo libre.',
            ],
            correcta: 1,
            explicacion: 'La foto es el resumen de tu criterio: si parece de cualquiera, el portafolio pierde credibilidad.',
          },
          {
            pregunta: '¿Para qué sirve cada plataforma?',
            opciones: [
              'Behance para discovery, web propia para contratación.',
              'Las dos hacen lo mismo.',
              'La web propia sirve para redes.',
              'Behance sirve para imprimir el CV.',
            ],
            correcta: 0,
            explicacion: 'Se usan en orden: una te descubre y la otra te contrata.',
          },
          {
            pregunta: '¿Por qué no conviene empezar por el resultado?',
            opciones: [
              'Porque es la sección más corta.',
              'Porque un resultado sin problema no dice nada.',
              'Porque el cliente no lee hasta el final.',
              'Porque ocupa más espacio.',
            ],
            correcta: 1,
            explicacion: 'La narrativa empieza por el problema, o el resultado queda flotando sin sentido.',
          },
        ],
      },
      {
        id: 'm3',
        titulo: 'Salir al mundo',
        lecciones: [
          {
            id: 'm3-l1',
            titulo: 'Portafolio para agencias',
            duracionMin: 12,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'Las agencias buscan gente que sepa trabajar con briefs, plazos y con criterios ajenos. '
              + 'Por eso el portafolio tiene que demostrar que entendés el contexto del cliente, no solo que la pieza se vea bien.\n\n'
              + 'Vamos a armar la versión para agencia: tres casos, un párrafo de contexto por caso y una nota de qué aprendiste del proceso. '
              + 'Es el formato que hace que el team de people te llame a vos y no a otro.',
            puntosClave: [
              'A las agencias les importa que entiendas briefs, plazos y criterios ajenos.',
              'Tres casos con contexto > diez piezas sueltas.',
              'Una nota de aprendizaje es lo que dispara la llamada.',
            ],
            materiales: [
              { nombre: 'Plantilla de portafolio para agencia', tipo: 'plantilla', peso: '610 KB' },
            ],
          },
          {
            id: 'm3-l2',
            titulo: 'Para clientes freelance',
            duracionMin: 11,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'Un cliente no quiere ver catorce proyectos: quiere ver que resolvés el suyo. '
              + 'El portafolio de freelance tiene que hablar de resultados concretos y de cómo fue el proceso de trabajo juntos.\n\n'
              + 'Vamos a reducir tu portafolio a dos casos y a sumar, en cada uno, una frase sobre cómo trabajaste con el cliente. '
              + 'Esa frase es la que más veces se cita cuando alguien decide contratarte.',
            puntosClave: [
              'El cliente quiere ver que resolvés el suyo, no catorce proyectos.',
              'El proceso de trabajo juntos también es parte del portafolio.',
              'Dos casos bien contados demuestran mejor que diez sin contexto.',
            ],
            materiales: [
              { nombre: 'Plantilla de portafolio freelance', tipo: 'plantilla', peso: '540 KB' },
              { nombre: 'Lista de preguntas de proceso para el cliente', tipo: 'checklist', peso: '190 KB' },
            ],
          },
          {
            id: 'm3-l3',
            titulo: 'Cómo cobrar lo que vales',
            duracionMin: 15,
            videoUrl: null, // TODO: link pendiente de definición
            descripcion:
              'El precio nunca es el número: es el tamaño del problema que resolvés. Quien cobra por hora cobra por su reloj; quien cobra por proyecto cobra por el resultado. '
              + 'Y el portafolio es la herramienta que sostiene el precio.\n\n'
              + 'Vamos a definir tres paquetes con alcance cerrado, a escribir el motivo de cada uno en una línea, y a ensayar el-priced conversation donde el cliente dice "es caro". '
              + 'Con eso salís a vender con el portafolio abierto en la pantalla.',
            puntosClave: [
              'El precio es el tamaño del problema, no el número de horas.',
              'El portafolio es la herramienta que sostiene el precio.',
              'Ensayá la respuesta a "es caro" antes de la reunión.',
            ],
            materiales: [
              { nombre: 'Plantilla de tres paquetes con alcance', tipo: 'plantilla', peso: '620 KB' },
              { nombre: 'Guía para responder "es caro"', tipo: 'pdf', peso: '360 KB' },
            ],
          },
        ],
        quiz: [
          {
            pregunta: '¿Qué mira primero una agencia en un portafolio?',
            opciones: [
              'La cantidad de piezas.',
              'Si entendés briefs, plazos y el contexto del cliente.',
              'El nombre de los clientes.',
              'Si está en Behance.',
            ],
            correcta: 1,
            explicacion: 'Quieren ver que entendés el contexto del cliente, no solo que la pieza se vea bien.',
          },
          {
            pregunta: '¿Qué necesita un cliente freelance en tu portafolio?',
            opciones: [
              'Más de diez proyectos.',
              'Resultados concretos y cómo fue trabajar juntos.',
              'Un precio por hora.',
              'Un CV descargable.',
            ],
            correcta: 1,
            explicacion: 'El cliente quiere ver que resolvés el suyo, no catorce proyectos.',
          },
          {
            pregunta: '¿Qué define el precio?',
            opciones: [
              'Las horas que le dedicaste.',
              'El tamaño del problema que resolvés.',
              'Lo que cobra tu competencia.',
              'La cantidad de piezas del portafolio.',
            ],
            correcta: 1,
            explicacion: 'Quien cobra por hora cobra por su reloj; quien cobra por proyecto cobra por el resultado.',
          },
        ],
      },
    ],
  };

  global.ZAG_CURSOS = {
    meta: {
      nivelAcceso: 'creator',
      sellosPorCurso: 3,
      quizParaAprobar: 2,
      totalCursos: 6,
    },
    cursos: [GROWTH, BRANDING, IA, UX, NEURO, PORTAFOLIO],

    /* ------------------------------------------------------------
         COMENTARIOS SEMILLA
         Pool curado por curso (12-15). Se distribuyen de forma
         determinista entre las lecciones: cada lección toma 2 del
         pool por posición y el usuario puede añadir los suyos.
         ------------------------------------------------------------ */

    /* ------------------------------------------------------------
       COMENTARIOS SEMILLA
       Pool curado por curso (12-13). Cada lección toma 3 del pool
       según su posición, así todas las lecciones quedan comentadas
       con contenido estable entre recargas. Autores de distintos
       niveles (creator/master/senior).
       ------------------------------------------------------------ */

    comentarios: {
      'growth-hacking': [
        { autor: 'Camila R.', nivel: 'creator', texto: 'El ejercicio de la semana 1 lo usé con mi propio cliente y el mapa de hipótesis cambió por completo la conversación. Gracias.' },
        { autor: 'Diego M.', nivel: 'master', texto: 'Pasé de medir todo a medir tres cosas. Me reprobé a mí mismo, pero el equipo ahora sabe dónde mirar.' },
        { autor: 'Laura P.', nivel: 'senior', texto: 'La parte de experimentos me destrabó algo que venía arrastrando hace meses. Por fin pude explicarle al cliente por qué lo hacemos así.' },
        { autor: 'Andrés T.', nivel: 'creator', texto: 'El módulo de retención me abrió los ojos. Estaba optimizando el tráfico equivocado durante meses sin saberlo.' },
        { autor: 'Sofía N.', nivel: 'master', texto: 'Bastante práctico. Lo de escribir el pitch antes del experimento me ahorró dos semanas.' },
        { autor: 'Mateo G.', nivel: 'creator', texto: 'Me gustó que sea tan concreto. Nada de teoría eterna: cada lección termina con algo hecho.' },
        { autor: 'Valeria C.', nivel: 'senior', texto: 'Lo del North Star me ayudó a defender una decisión de diseño frente a un cliente que pedía métricas de vanidad.' },
        { autor: 'Nicolás F.', nivel: 'creator', texto: 'Repetí el módulo de funnels porque la primera vez lo pasé muy rápido. Esta vez lo hice con un caso real.' },
        { autor: 'Juliana O.', nivel: 'master', texto: 'La plantilla de experimentos es la que más uso. La tengo pegada al monitor.' },
        { autor: 'Sebastián L.', nivel: 'creator', texto: 'Me cambió el chip de medir por actividad a medir por resultado. No es lo mismo y se nota.' },
        { autor: 'Paula E.', nivel: 'senior', texto: 'El curso está bien armado. Se nota que alguien que trabaja con clientes lo escribió.' },
        { autor: 'Tomás D.', nivel: 'master', texto: 'Lo uso como checklist antes de arrancar cualquier campaña nueva. Me ahorra discusiones internas.' },
        { autor: 'Mariana S.', nivel: 'creator', texto: 'La parte de hipótesis me quitó el miedo a probar cosas. Antes solo proponía lo seguro.' },
      ],
      'branding-experimental': [
        { autor: 'Renata A.', nivel: 'creator', texto: 'La dinámica de los experimentos de marca me resultó distinta de todo lo que había estudiado. Gracias.' },
        { autor: 'Gonzalo V.', nivel: 'master', texto: 'Lo de construir marca desde los mensajes, sin pensar en el logo primero, me ordenó todo el proceso de un cliente.' },
        { autor: 'Camila T.', nivel: 'senior', texto: 'Me costó soltar el control, pero el ejercicio de generar y descartar a propósito funciona. Aprendí más descartando.' },
        { autor: 'Bruno H.', nivel: 'creator', texto: 'La sección de tono de voz fue la que más me sirvió. Es donde siempre me trababa con el cliente.' },
        { autor: 'Lucía Q.', nivel: 'master', texto: 'Un curso honesto sobre marca. No te vende humo y te da herramientas concretas.' },
        { autor: 'Esteban R.', nivel: 'creator', texto: 'Lo de los cinco pilares me ordenó la cabeza para pensar una marca desde cero. Muy práctico.' },
        { autor: 'Fernanda Z.', nivel: 'senior', texto: 'El módulo de coherencia me hizo notar cuántos mensajes distintos sacamos por semana sin darnos cuenta.' },
        { autor: 'Iván M.', nivel: 'master', texto: 'Valoro que reconozca los límites de la estrategia. Honestidad que vale.' },
        { autor: 'Sofía B.', nivel: 'creator', texto: 'Los experimentos de marca suenan raros al principio, pero el curso explica bien por qué funcionan.' },
        { autor: 'Rodrigo K.', nivel: 'master', texto: 'La parte de copiar a otros que ya lo hicieron bien me ordenó mucho. Simple y efectivo.' },
        { autor: 'Ana Lucía P.', nivel: 'senior', texto: 'Mi marca creció en claridad, y eso se nota en las reuniones con clientes. Gracias.' },
        { autor: 'Felipe J.', nivel: 'creator', texto: 'Repetí el módulo de pilares con tres marcas distintas y la estructura funcionó siempre.' },
        { autor: 'Gabriela N.', nivel: 'master', texto: 'Se nota el trabajo de los casos reales. No es teoría de libro.' },
      ],
      'ia-aplicada': [
        { autor: 'Carlos U.', nivel: 'creator', texto: 'El prompt de rol me ordenó el uso de IA por completo. Ya no tengo que reescribir tanto.' },
        { autor: 'Daniela R.', nivel: 'master', texto: 'La parte de revisar al cliente sin perder la voz de la marca es la que más uso. Es puro criterio.' },
        { autor: 'Mauricio L.', nivel: 'creator', texto: 'Estaba usando IA para todo. El curso me enseñó a usarla para las tareas correctas y no solo para producir más rápido.' },
        { autor: 'Verónica A.', nivel: 'senior', texto: 'El módulo de iterar con criterio es mi favorito. Antes creía que con un prompt bueno salía todo.' },
        { autor: 'Héctor S.', nivel: 'master', texto: 'La sección de propiedad intelectual y qué se puede publicar me ordenó los datos. Muy importante y muy bien explicado.' },
        { autor: 'Fabiola C.', nivel: 'creator', texto: 'Está muy actualizado. Las herramientas cambian rápido pero los principios se mantienen.' },
        { autor: 'Iván P.', nivel: 'master', texto: 'El flujo de trabajo para un brief real es exactamente lo que necesitaba para mi agencia.' },
        { autor: 'Sara M.', nivel: 'senior', texto: 'Me queda claro cuándo delegar a IA y cuándo no. Esa línea era difusa para mí.' },
        { autor: 'Julio D.', nivel: 'creator', texto: 'Práctico al 100%. Salí con un proceso, no con tips sueltos.' },
        { autor: 'Carolina B.', nivel: 'master', texto: 'El módulo de casos donde la IA falla me enseñó más que el de donde funciona. De eso casi nadie habla.' },
        { autor: 'Nicolás H.', nivel: 'senior', texto: 'Se nota que el autor hace esto todos los días. Los ejemplos son reales.' },
        { autor: 'Marta G.', nivel: 'creator', texto: 'Lo aplico desde ayer en el equipo y ya tenemos un orden. Antes cada uno hacía lo que podía.' },
      ],
      'ux-ui-publicistas': [
        { autor: 'Paula M.', nivel: 'creator', texto: 'La investigación en una tarde me ordenó el presupuesto. Ahora no necesito tres semanas para arrancar.' },
        { autor: 'Andrés V.', nivel: 'master', texto: 'El mapa de empatía ordenó las discusiones del equipo. Ahora se discute con datos, no con gustos.' },
        { autor: 'Laura S.', nivel: 'senior', texto: 'La parte de wireframes es clave. Me ordenó el orden de hacer las cosas en la agencia.' },
        { autor: 'Tomás F.', nivel: 'creator', texto: 'El test de usabilidad es brutal a primera vista pero después de hacerlo me ordenó todo el criterio.' },
        { autor: 'Gabriela R.', nivel: 'master', texto: 'El handoff me ordenó el trabajo con desarrollo. Se acabaron las reuniones diarias.' },
        { autor: 'Javier P.', nivel: 'creator', texto: 'La parte de métricas y observaciones juntas me ordenó el informe. Ahora es entendible.' },
        { autor: 'Sofía N.', nivel: 'senior', texto: 'El curso entra perfecto en una carrera de publicista que termina siempre hablando con diseño.' },
        { autor: 'Cristian D.', nivel: 'master', texto: 'El set de componentes me ahorró tiempo real. Lo aplico en todos los proyectos.' },
        { autor: 'Mariana C.', nivel: 'creator', texto: 'Estaba mandando mockups sin contexto. Ahora el proceso va antes del color.' },
        { autor: 'Sebastián O.', nivel: 'master', texto: 'La prueba del pasillo es simple pero efectiva. La uso en todas las revisiones.' },
        { autor: 'Valeria L.', nivel: 'senior', texto: 'Me aflojó los wireframes en tres niveles. Cada uno para una decisión distinta.' },
        { autor: 'Nicolás E.', nivel: 'creator', texto: 'Práctico y sin humo. Cada lección termina con algo hecho.' },
        { autor: 'Ana R.', nivel: 'master', texto: 'El handoff me ordenó las reglas de cómo documentar. Lo recomiendo.' },
      ],
      neuroventas: [
        { autor: 'Diego R.', nivel: 'creator', texto: 'Lo de emoción primero y razón después me ordenó todo un guion que estaba mal hecho.' },
        { autor: 'Melissa A.', nivel: 'master', texto: 'La parte de sesgos es brutal pero honesta. Entender por qué funciona algo te da poder.' },
        { autor: 'Andrés M.', nivel: 'senior', texto: 'La línea entre gatillo y manipulación me ordenó los criterios éticos del equipo.' },
        { autor: 'Paula V.', nivel: 'creator', texto: 'La prueba de copy con una sola variable me ordenó los tests. Antes probaba todo junto.' },
        { autor: 'Carlos G.', nivel: 'master', texto: 'La sección de precio en landing me ordenó una discusión pendiente con un cliente.' },
        { autor: 'Julieta T.', nivel: 'creator', texto: 'Me aflojó la estructura de storytelling. La usé en una campaña real la semana pasada.' },
        { autor: 'Nicolás H.', nivel: 'master', texto: 'El primer cuadro como decisión estratégica, no como efecto. Buen cambio de chip.' },
        { autor: 'Laura B.', nivel: 'senior', texto: 'El curso no te vende humo. Habla de sesgos y también de sus límites.' },
        { autor: 'Esteban W.', nivel: 'master', texto: 'La política de persuasión la aplicamos como equipo. Se acabaron las discusiones personales.' },
        { autor: 'Mariana L.', nivel: 'creator', texto: 'El sistema 1 y 2 me ordenó por qué ciertas piezas funcionan y otras no.' },
        { autor: 'Sofía R.', nivel: 'master', texto: 'Práctico al 100%. Todo lo que aprendí lo usé en un cliente real.' },
        { autor: 'Felipe J.', nivel: 'creator', texto: 'La parte de las opciones por defecto me ordenó la página de precios. Buenos resultados.' },
        { autor: 'Camila N.', nivel: 'senior', texto: 'Me aflojó que reconozca los límites. Eso hace el curso más confiable.' },
      ],
      'portafolio-que-habla': [
        { autor: 'Valeria C.', nivel: 'creator', texto: 'Me ordenó el portafolio entero. Pasé de doce piezas sueltas a cuatro que cuentan algo.' },
        { autor: 'Tomás R.', nivel: 'master', texto: 'El párrafo de contexto me ordenó cada proyecto. Ahora se entiende sin que yo explique.' },
        { autor: 'Ana Lucía G.', nivel: 'senior', texto: 'La parte de contar un error como decisión me ordenó cómo responder en entrevista.' },
        { autor: 'Nicolás B.', nivel: 'creator', texto: 'El orden por perfil me ordenó la cabeza. No es un orden correcto, es el orden para cada conversación.' },
        { autor: 'Sofía M.', nivel: 'master', texto: 'Mi portafolio web está mejor que el PDF. Pero tener los dos me ordenó.' },
        { autor: 'Cristian D.', nivel: 'creator', texto: 'Las cinco preguntas de entrevista las tengo ensayadas. Se me fue el blanco en la última.' },
        { autor: 'Laura V.', nivel: 'senior', texto: 'El módulo de resultados con límites me ordenó los resultados sin contexto.' },
        { autor: 'Gabriela P.', nivel: 'master', texto: 'El texto de pieza me ordenó el ritmo de lectura. Antes nadie se enteraba de qué era cada cosa.' },
        { autor: 'Julieta A.', nivel: 'creator', texto: 'Me costó dejar por escrito lo que queda afuera y por qué. Me ordenó las decisiones.' },
        { autor: 'Felipe S.', nivel: 'master', texto: 'Práctico y concreto. Salí con un portafolio armado, no con una galería.' },
        { autor: 'Mariana R.', nivel: 'senior', texto: 'La matriz de selección de proyectos me ordenó qué incluir. Menos es más.' },
        { autor: 'Esteban L.', nivel: 'creator', texto: 'El curso me ayudó a preparar la entrevista con el portafolio. Gran ayuda.' },
        { autor: 'Camila N.', nivel: 'master', texto: 'Repetí el módulo de defensa con una amiga y nos ayudó a las dos.' },
      ],
    },

    /* ------------------------------------------------------------
       TEXTOS DE INTERFAZ
       Todo el copy visible vive aquí (patrón {n} para reemplazar).
       ------------------------------------------------------------ */

    ui: {
      acceso: {
        sinSesionCta: 'Activa tu perfil',
        sinSesionTitulo: 'Activa tu perfil para desbloquear los cursos',
        sinSesionCopia: 'Los cursos extraclase se abren desde el nivel Creator. Creá tu perfil demo para probarlos.',
        nivelInsuficienteTitulo: 'Te falta {n} nivel',
        nivelInsuficienteTituloPlural: 'Te faltan {n} niveles',
        nivelInsuficienteCopia: 'Estos cursos se desbloquean en {nivel}. Seguí con tu ruta ZAG para llegar.',
        verComoSubir: 'Ver cómo subir de nivel',
        desbloqueaEn: 'Se desbloquea en {nivel}',
        candado: 'Se desbloquea en {nivel}',
        temarioTitulo: 'Temario completo',
        temarioCopia: 'Vas a ver todas las lecciones y sus duraciones. El contenido se abre al llegar a {nivel}.',
        sinAccesoLeccion: 'Necesitás nivel {nivel} para ver esta lección.',
        volverCatalogo: 'Volver a los cursos',
      },
      demo: {
        titulo: 'Perfil demo',
        nivelLabel: 'Nivel',
        crear: 'Crear perfil demo',
        listo: 'Perfil demo activado. Ya podés ver los cursos.',
        completaCurso: '(demo) completar este curso',
        reiniciar: 'Reiniciar demo de cursos',
        reiniciado: 'Demo de cursos reiniciada.',
      },
      hero: {
        pill: 'Aprende más',
        titulo1: 'Cursos',
        titulo2: 'extraclase',
        sub: 'Lo que el pensum no te cuenta, grabado por egresados que ya lo viven. Se desbloquea en Creator.',
      },
      catalogo: {
        eyebrow: 'Catálogo',
        tituloTodos: 'Todos los cursos',
        completados: 'Cursos completados: {n}',
        sellosGanados: 'Sellos ganados por cursos: {n}',
        proximoSello: 'Próximo Sello ZAG: {puntos} {n} de {total} cursos',
        selloGanado: 'Sellos ZAG ganados: {ganados} · próximo en {n} de {total}',
        tabs: {
          todos: 'Todos',
          enCurso: 'En curso',
          completados: 'Completados',
          sinIniciar: 'No iniciados',
        },
        moduloSingular: '{n} módulo',
        moduloPlural: '{n} módulos',
        leccionSingular: '{n} lección',
        leccionPlural: '{n} lecciones',
        duracion: '{n} h',
        duracionMin: '{n} min',
        progreso: '{n}%',
        certificadoListo: '🎓 Certificado listo',
        verCurso: 'Ver curso',
        sinFiltro: 'No hay cursos en esta categoría.',
      },
      curso: {
        volver: '← Cursos',
        contenido: 'Contenido del curso',
        progresoBarra: '{pct}% · {hechas} de {total} lecciones',
        kicker: 'Módulo {m} · Lección {l} · {min} min',
        anterior: '← Anterior',
        siguiente: 'Siguiente lección →',
        siguienteUltima: 'Ir al quiz →',
        marcar: '✓ Marcar como completada',
        completada: 'Completada ✓',
        videoProduccion: 'Video en producción · muy pronto',
        videoPlay: 'Reproducir vista previa',
        videoReproduciendo: 'Reproduciendo vista previa simulada…',
        tabDescripcion: 'Descripción',
        tabMateriales: 'Materiales',
        tabComentarios: 'Comentarios ({n})',
        puntosClave: 'Puntos clave',
        materialDemo: 'Material demo: el archivo real se sube pronto',
        sinMateriales: 'Esta lección no tiene materiales descargables.',
        sinComentarios: 'Todavía no hay comentarios. Sé la primera persona en romper lo obvio.',
        profesor: 'Tu profesor',
        agendar: 'Agenda mentoría con {nombre} →',
        modulo: 'Módulo {n}',
        leccionActual: 'Actual',
        modProgreso: '{hechas}/{total} ✓',
        quizFila: '📝 Quiz del módulo',
        quizPendiente: 'Pendiente',
        quizAprobado: 'Aprobado {p}/{t}',
        quizReintentar: 'Intentar de nuevo',
        certBloqueadoTitulo: '🎓 Certificado',
        certBloqueadoCopia: 'Completa todas las lecciones y aprueba los quizzes.',
        certListoTitulo: '🎓 ¡Tu certificado está listo!',
        verCertificado: 'Ver y descargar certificado',
        sinSesionDemo: 'Activa tu perfil para ver este contenido.',
      },
      quiz: {
        kicker: 'Quiz del módulo {n}',
        progreso: 'Pregunta {i} de {t}',
        enviar: 'Enviar respuestas',
        siguiente: 'Siguiente',
        anterior: 'Anterior',
        aprobado: '¡Aprobado!',
        casi: 'Casi.',
        reintentar: 'Intentar de nuevo',
        volverCurso: 'Volver al curso',
        tuRespuesta: 'Tu respuesta',
        correcta: 'Correcta',
        explicar: 'Por qué',
        sinResponder: 'Elegí una respuesta antes de enviar.',
        aprobadoAnunciado: 'Quiz aprobado. {n} de {t} correctas.',
        noAprobadoAnunciado: 'Quiz no aprobado. {n} de {t} correctas. Podés reintentar.',
      },
      certificado: {
        portalLine: 'PORTAL ZAG · 30 AÑOS PUBLICIDAD EAM',
        kicker: 'CERTIFICADO DE FINALIZACIÓN',
        seCertifica: 'Se certifica que',
        completo: 'completó el curso extraclase',
        duracion: 'Duración',
        modulos: 'Módulos',
        fecha: 'Fecha de finalización',
        codigo: 'Código de verificación',
        firmaDirector: 'Andrés Quintero · Director del programa de Publicidad EAM',
        nombreTitulo: '¿Con qué nombre sale tu certificado?',
        nombreCopia: 'Lo guardamos para los próximos cursos.',
        nombreLabel: 'Nombre completo',
        nombreCta: 'Generar certificado',
        nombrePorDefecto: 'Por defecto usamos el nombre de tu sesión: {nombre}.',
        sinTerminar: 'Aún no terminas este curso',
        sinTerminarCopia: 'Te faltan {n} lecciones y {q} quizzes por completar.',
        volverCurso: 'Volver al curso',
        descargar: 'Descargar PDF',
        verificar: 'Verificar certificado',
        verificarCopia: 'Ingresá el código del certificado para comprobarlo.',
        verificado: 'Certificado válido: {curso}.',
        noVerificado: 'No encontramos un certificado con ese código.',
        ligado: 'Este certificado se emitió en nombre de {nombre}.',
      },
      popup: {
        cursoTerminado: '🎓 ¡Terminaste {curso}! Tu certificado está listo.',
        selloTitulo: '¡Ganaste un Sello ZAG!',
        selloCopia: '{n} cursos extraclase completados. Suma para tu próximo nivel.',
        verCertificado: 'Ver certificado',
        seguir: 'Seguir aprendiendo',
        cerrar: 'Cerrar',
      },
    general: {
        anunciarLeccion: 'Lección marcada como completada.',
        anunciarDeshacer: 'Lección quitada de completadas.',
        anunciarCertificado: 'Certificado desbloqueado.',
      },
    },
  };
})(window);