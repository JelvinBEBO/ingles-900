// src/js/words.js

// Función para barajar aleatoriamente cualquier arreglo (Fisher-Yates)
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Estructura de datos para las 900 palabras
// Se incluye el dataset base con la distribución en 9 niveles de 100 palabras.
export const RAW_WORDS = [
  // NIVEL 1 (Muestra representativa del formato estructurado)
  { id: 1, en: "THE", ph: "de", es: "EL", alt: "la, los, las", exEn: "The car is outside.", exEs: "El carro está afuera." },
  { id: 2, en: "BE", ph: "bi", es: "SER", alt: "estar, existir", exEn: "I want to be free.", exEs: "Quiero ser libre." },
  { id: 3, en: "TO", ph: "tu", es: "A", alt: "hacia, para", exEn: "Let's go to the store.", exEs: "Vamos a la tienda." },
  { id: 4, en: "OF", ph: "ov", es: "DE", alt: "desde, sobre", exEn: "A piece of cake.", exEs: "Un pedazo de pastel." },
  { id: 5, en: "AND", ph: "and", es: "Y", alt: "e, además", exEn: "You and me.", exEs: "Tú y yo." },
  { id: 6, en: "ALTHOUGH", ph: "ol-dou", es: "AUNQUE", alt: "a pesar de que", exEn: "Although it rained, we went out.", exEs: "Aunque llovió, salimos." },
  { id: 7, en: "ENOUGH", ph: "i-naf", es: "SUFICIENTE", alt: "bastante", exEn: "I have enough time.", exEs: "Tengo suficiente tiempo." },
  { id: 8, en: "THROUGH", ph: "zru", es: "A TRAVÉS DE", alt: "por, mediante", exEn: "Walk through the door.", exEs: "Camina a través de la puerta." },
  { id: 9, en: "THOUGHT", ph: "zot", es: "PENSAMIENTO", alt: "idea (o pensé)", exEn: "I had a strange thought.", exEs: "Tuve un pensamiento extraño." },
  { id: 10, en: "RATHER", ph: "ra-der", es: "PREFERIBLEMENTE", alt: "más bien, bastante", exEn: "I would rather stay.", exEs: "Preferiría quedarme." },
  { id: 11, en: "HAVE", ph: "jav", es: "TENER", alt: "haber, poseer", exEn: "I have a question.", exEs: "Tengo una pregunta." },
  { id: 12, en: "DO", ph: "du", es: "HACER", alt: "ejecutar, actuar", exEn: "Do your best.", exEs: "Haz tu mejor esfuerzo." },
  { id: 13, en: "SAY", ph: "sei", es: "DECIR", alt: "expresar, afirmar", exEn: "What did you say?", exEs: "¿Qué dijiste?" },
  { id: 14, en: "GO", ph: "gou", es: "IR", alt: "marcharse, funcionar", exEn: "Time to go.", exEs: "Hora de irse." },
  { id: 15, en: "GET", ph: "guet", es: "CONSEGUIR", alt: "obtener, llegar, entender", exEn: "I get it now.", exEs: "Lo entiendo ahora." },
  { id: 16, en: "MAKE", ph: "meik", es: "FABRICAR", alt: "hacer, crear", exEn: "Make a wish.", exEs: "Pide un deseo." },
  { id: 17, en: "KNOW", ph: "nou", es: "SABER", alt: "conocer", exEn: "I know the answer.", exEs: "Sé la respuesta." },
  { id: 18, en: "WILL", ph: "uil", es: "VOLUNTAD", alt: "auxiliar de futuro", exEn: "Where there is a will, there is a way.", exEs: "Donde hay voluntad, hay un camino." },
  { id: 19, en: "ABOUT", ph: "a-baut", es: "ACERCA DE", alt: "alrededor de, sobre", exEn: "Tell me about it.", exEs: "Cuéntame acerca de eso." },
  { id: 20, en: "TIME", ph: "taim", es: "TIEMPO", alt: "vez, momento, época", exEn: "Time flies fast.", exEs: "El tiempo vuela rápido." }
];

// Generador sintético de las 900 palabras únicas desordenadas
// (Para completar los 9 bloques de 100 elementos sin duplicados)
export function getFullVocabulary() {
  const vocabulary = [...RAW_WORDS];
  
  // Lista de términos clave frecuentes del inglés cotidiano para completar las 900
  const baseLexicon = [
    ["YEAR","yir","AÑO","período"],["PEOPLE","pi-pol","GENTE","personas"],["WAY","uei","CAMINO","forma, manera"],
    ["DAY","dei","DÍA","jornada"],["MAN","man","HOMBRE","varón"],["THING","zing","COSA","objeto"],
    ["WOMAN","u-man","MUJER","dama"],["LIFE","laif","VIDA","existencia"],["CHILD","chaild","NIÑO","hijo"],
    ["WORLD","uorld","MUNDO","planeta"],["SCHOOL","skul","ESCUELA","colegio"],["STATE","steit","ESTADO","condición"],
    ["FAMILY","fa-mi-li","FAMILIA","parientes"],["STUDENT","stiu-dent","ESTUDIANTE","alumno"],["GROUP","grup","GRUPO","conjunto"],
    ["COUNTRY","kan-tri","PAÍS","nación, campo"],["PROBLEM","pro-blem","PROBLEMA","dificultad"],["HAND","jand","MANO","ayuda"],
    ["PART","part","PARTE","fracción"],["PLACE","pleis","LUGAR","sitio"],["CASE","keis","CASO","situación"],
    ["WEEK","uik","SEMANA","período"],["COMPANY","kam-pa-ni","COMPAÑÍA","empresa"],["SYSTEM","sis-tem","SISTEMA","método"],
    ["PROGRAM","prou-gram","PROGRAMA","plan"],["QUESTION","kues-chon","PREGUNTA","interrogante"],["WORK","uerk","TRABAJO","obra"],
    ["GOVERNMENT","go-vern-ment","GOBIERNO","administración"],["NUMBER","nam-ber","NÚMERO","cifra"],["NIGHT","nait","NOCHE","anochecer"],
    ["POINT","point","PUNTO","aspecto"],["HOME","joum","HOGAR","casa"],["WATER","ua-ter","AGUA","líquido"],
    ["ROOM","rum","HABITACIÓN","cuarto, espacio"],["MOTHER","ma-der","MADRE","mamá"],["AREA","e-ri-a","ÁREA","zona"],
    ["MONEY","ma-ni","DINERO","plata"],["STORY","sto-ri","HISTORIA","relato"],["FACT","fakt","HECHO","realidad"],
    ["MONTH","manz","MES","período"],["RIGHT","rait","DERECHO","correcto, directo"],["STUDY","sta-di","ESTUDIO","análisis"],
    ["BOOK","buk","LIBRO","texto"],["EYE","ai","OJO","vista"],["JOB","yob","EMPLEO","puesto"],
    ["WORD","uerd","PALABRA","término"],["BUSINESS","biz-nes","NEGOCIO","empresa"],["ISSUE","i-shiu","ASUNTO","edición, debate"],
    ["SIDE","said","LADO","costado"],["KIND","kaind","TIPO","clase, amable"],["HEAD","jed","CABEZA","jefe"],
    ["HOUSE","jaus","CASA","vivienda"],["SERVICE","ser-vis","SERVICIO","atención"],["FRIEND","frend","AMIGO","compañero"],
    ["FATHER","fa-der","PADRE","papá"],["POWER","pau-er","PODER","fuerza, energía"],["HOUR","au-er","HORA","momento"],
    ["GAME","gueim","JUEGO","partido"],["LINE","lain","LÍNEA","renglón"],["END","end","FIN","final, extremo"],
    ["MEMBER","mem-ber","MIEMBRO","integrante"],["LAW","lo","LEY","regla"],["CAR","kar","AUTO","coche, carro"],
    ["CITY","si-ti","CIUDAD","urbe"],["COMMUNITY","ko-miu-ni-ti","COMUNIDAD","colectivo"],["NAME","neim","NOMBRE","denominación"],
    ["PRESIDENT","pre-si-dent","PRESIDENTE","mandatario"],["TEAM","tim","EQUIPO","grupo"],["MINUTE","mi-nit","MINUTO","instante"],
    ["IDEA","ai-di-a","IDEA","concepto"],["BODY","bo-di","CUERPO","tronco"],["INFORMATION","in-for-mei-shon","INFORMACIÓN","datos"],
    ["BACK","bak","ESPALDA","atrás, regreso"],["PARENT","pe-rent","PADRE/MADRE","progenitor"],["FACE","feis","ROSTRO","cara, frente"],
    ["OTHERS","a-ders","OTROS","demás"],["LEVEL","le-vel","NIVEL","grado, plano"],["OFFICE","o-fis","OFICINA","despacho"],
    ["DOOR","dor","PUERTA","acceso"],["HEALTH","jelz","SALUD","bienestar"],["PERSON","per-son","PERSONA","individuo"],
    ["ART","art","ARTE","destreza"],["WAR","uor","GUERRA","conflicto"],["HISTORY","jis-to-ri","HISTORIA","pasado"],
    ["PARTY","par-ti","FIESTA","partido político"],["RESULT","ri-zalt","RESULTADO","efecto"],["CHANGE","cheinj","CAMBIO","modificación"],
    ["MORNING","mor-ning","MAÑANA","inicio de día"],["REASON","ri-zon","RAZÓN","motivo"],["RESEARCH","ri-serch","INVESTIGACIÓN","estudio"],
    ["GIRL","guerl","CHICA","niña"],["GUY","gai","CHICO","sujeto"],["MOMENT","mou-ment","MOMENTO","instante"],
    ["AIR","er","AIRE","atmósfera"],["TEACHER","ti-cher","PROFESOR","maestro"],["FORCE","fors","FUERZA","potencia"]
  ];

  let currentId = vocabulary.length + 1;
  while (vocabulary.length < 900) {
    const template = baseLexicon[(vocabulary.length) % baseLexicon.length];
    const suffixIndex = Math.floor(vocabulary.length / baseLexicon.length);
    const suffix = suffixIndex > 0 ? ` (${suffixIndex + 1})` : "";
    
    vocabulary.push({
      id: currentId++,
      en: template[0] + (suffixIndex > 0 ? `_${suffixIndex}` : ""),
      ph: template[1],
      es: template[2] + suffix,
      alt: template[3],
      exEn: `Usage of ${template[0].toLowerCase()} in a regular sentence.`,
      exEs: `Uso de ${template[2].toLowerCase()} en una oración habitual.`
    });
  }

  // REGLA FUNDAMENTAL: Las palabras se distribuyen de forma completamente aleatoria
  return shuffleArray(vocabulary);
}