// =====================================================================
// CarTuner Garaje · datos
// Precios, fuentes y situación legal de cada modificación.
// Son los mismos datos del configurador CarTuner, traducidos al español.
// Un precio solo se suma al presupuesto si tiene una fuente.
// =====================================================================

export const FUENTES = {
  mapfreVinilo: {
    nombre: 'Mapfre Motor, precio de vinilar un coche',
    url: 'https://www.motor.mapfre.es/consejos-practicos/consejos-para-ahorrar/precio-vinilar-coche/',
    fecha: 'abril de 2022'
  },
  sensorVinilo: {
    nombre: 'Sensor Automotriz, vinilar un coche en taller',
    url: 'https://sensorautomotriz.com/preguntas-frecuentes/cuanto-cuesta-vinilar-un-coche-en-taller',
    fecha: 'sin fecha'
  },
  hrMuelles: {
    nombre: 'Precio de los muelles H&R según Auto Bild',
    url: 'https://www.autobild.de/artikel/h-r-vw-golf-8-gti-gtd-clubsport-2021-tuning-preis-fahrwerk-20342071.html',
    fecha: 'julio de 2021'
  },
  certSuspension: {
    nombre: 'Certicalia, precio de homologar la suspensión',
    url: 'https://www.certicalia.com/homologar-suspension/precio',
    fecha: 'marzo de 2025'
  },
  race: {
    nombre: 'RACE, el Manual de Reformas explicado',
    url: 'https://www.race.es/manual-reformas-vehiculos',
    fecha: '2026'
  },
  tfg: {
    nombre: 'TFG de la UMH sobre el Manual de Reformas (rev. 7)',
    url: 'https://dspace.umh.es/bitstream/11000/37202/1/TFG-Contreras%20L%c3%b3pez%2c%20Pablo.pdf',
    fecha: '2024'
  },
  tuvLunas: {
    nombre: 'TÜV SÜD, cristales tintados y láminas en la ITV',
    url: 'https://www.tuvsud.com/es-es/centro-recursos/articulos-de-opinion/cristales-tintados-y-laminas-adhesivas-en-la-itv',
    fecha: 'sin fecha'
  },
  boeManual: {
    nombre: 'BOE-A-2026-2709, Manual de Reformas rev. 7 corr. 2',
    url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-2709',
    fecha: '5 de febrero de 2026'
  },
  zurichLunas: {
    nombre: 'Zurich, precio de tintar los cristales del coche',
    url: 'https://www.zurich.es/blog/cristales-tintados-itv',
    fecha: 'sin fecha'
  },
  testcochesLunas: {
    nombre: 'Testcoches, cuánto cuesta tintar los cristales',
    url: 'https://testcoches.es/ayuda/cuanto-cuesta-tintar-los-cristales-del-coche/',
    fecha: 'sin fecha'
  },
  foliatecPinzas: {
    nombre: 'Globerada, kit de pintura de pinzas Foliatec',
    url: 'https://www.globerada.com/precios/foliatec-lote-de-pintura-brillante-para-frenos.html',
    fecha: '2026'
  },
  pinturaLlantas: {
    nombre: 'Recambioscoche.es, pintura para llantas (juego de 4)',
    url: 'https://www.recambioscoche.es/foliatec-21035910.html',
    fecha: '2026'
  },
  vinilo: {
    nombre: 'Coches.com, precio del metro cuadrado de vinilo',
    url: 'https://noticias.coches.com/consejos/poner-vinilo-coche/341008',
    fecha: 'sin fecha'
  },
  coiloversBaratos: {
    nombre: 'ManoMano, coilovers maXpeedingrods',
    url: 'https://www.manomano.es/p/ajustable-amortiguadores-coilovers-para-vw-golf-mk7-12-20-suspensin-roscada-65546964',
    fecha: '2026'
  },
  coiloversKW: {
    nombre: 'eBay, coilovers KW V1 Inox',
    url: 'https://www.ebay.es/p/625682761',
    fecha: '2026'
  },
  muchoVinilo: {
    nombre: 'MuchoNeumático, cuánto cuesta vinilar un coche en 2026',
    url: 'https://www.muchoneumatico.com/blog/?p=13470',
    fecha: '2026'
  },
  cimalab: {
    nombre: 'CIMALAB, qué cambia en la revisión 7 del Manual',
    url: 'https://www.cimalab.com/manual-de-reformas-que-cambia-en-la-revision-7/',
    fecha: '2022'
  }
};

// estado: verificado · estimado · desactualizado · sin-dato
export const PRECIOS = {
  vinilado: {
    estado: 'estimado', min: 650, medio: 1500, max: 3000, fuente: 'mapfreVinilo',
    nota: 'Desde unos 650 € (Mapfre, 2022). En 2026, un vinilado completo de un turismo cuesta de media entre 1.500 y 3.000 € (MuchoNeumático).'
  },
  viniloParcial: {
    estado: 'estimado', min: 100, medio: 150, max: 200, fuente: 'vinilo',
    nota: 'Unos 4 m² de vinilo para techo y taloneras, a 25–50 € el m². Sin mano de obra.'
  },
  pinturaLlantas: {
    estado: 'estimado', min: 37, medio: 58, max: 78, fuente: 'pinturaLlantas',
    nota: 'Kit de pintura para las 4 llantas (Foliatec o Mibenco), aplicándolo tú. En un taller cuesta más.'
  },
  pinturaPinzas: {
    estado: 'estimado', min: 21, medio: 28, max: 35, fuente: 'foliatecPinzas',
    nota: 'Kit de pintura de pinzas Foliatec de 3 componentes, aplicándolo tú. En un taller cuesta más.'
  },
  laminasTraseras: {
    estado: 'estimado', min: 70, medio: 150, max: 300, fuente: 'zurichLunas',
    nota: 'Entre 70 y 150 € en un compacto (Testcoches); entre 90 y 300 € según el coche y los cristales (Zurich).'
  },
  laminasTodas: {
    estado: 'estimado', min: 90, medio: 200, max: 300, fuente: 'zurichLunas',
    nota: 'Precio orientativo de laminar más cristales (Zurich). No pasaría la ITV: quita la lámina de las lunas delanteras.'
  },
  coilovers: {
    estado: 'estimado', min: 353, medio: 880, max: 1408, fuente: 'coiloversBaratos',
    nota: 'Desde unos 353 € un kit económico (maXpeedingrods) hasta 1.408 € un KW V1 Inox. Este prototipo no tiene pieza de catálogo.'
  },
  muelles: {
    estado: 'desactualizado', min: 354, medio: 354, max: 354, fuente: 'hrMuelles',
    nota: 'Precio de los muelles H&R de un Golf 8 GTI en 2021. Solo de referencia: este prototipo no tiene pieza de catálogo.'
  },
  homologarSuspension: {
    estado: 'estimado', min: 150, medio: 240, max: 600, fuente: 'certSuspension',
    nota: 'Media de 240 €, entre 150 y 600 € según Certicalia.'
  }
};

export const REFORMAS = {
  color: {
    tipo: 'no-reforma', texto: 'No es reforma', fuente: 'race',
    nota: 'Cambiar el color con pintura o vinilo no es una reforma. Si el color figura en la tarjeta ITV, se anota.'
  },
  llantas: {
    tipo: 'no-reforma', texto: 'No es reforma', fuente: 'cimalab',
    nota: 'Aquí solo cambia el acabado. Con el mismo diámetro, bombeo y neumáticos equivalentes no hay reforma (código 4.4).'
  },
  pinzas: {
    tipo: 'no-reforma', texto: 'No es reforma', fuente: 'boeManual',
    nota: 'Pintar las pinzas de serie no cambia el sistema de frenos. Cambiar piezas del freno sería la reforma 7.1.'
  },
  lunas: {
    tipo: 'no-reforma', texto: 'No es reforma', fuente: 'tuvLunas',
    nota: 'Solo en las lunas traseras y con lámina homologada, con certificado y marcado. Se revisa en la ITV periódica.'
  },
  lunasDelanteras: {
    tipo: 'ilegal', texto: 'No legal', fuente: 'tuvLunas',
    nota: 'No se permiten láminas en el parabrisas ni en las ventanillas delanteras. No pasaría la ITV.'
  },
  suspension: {
    tipo: 'reforma', texto: 'Reforma 5.1', fuente: 'tfg',
    nota: 'Muelles, coilovers y suspensión neumática entran en la 5.1. Piden proyecto técnico, certificado final de obra, informe de conformidad y certificado de taller.'
  }
};

// Revoluciones del acelerón cada 50 ms (sale del mismo cálculo que genera el sonido)
export const CURVA_ACELERON = [850, 1440, 1950, 2400, 2790, 3140, 3440, 3710, 3940, 4150, 4330, 4480,
  4620, 4740, 4850, 4940, 5020, 5090, 5160, 5210, 5260, 5300, 5340, 4950, 4590, 4270, 3970, 3700, 3450,
  3220, 3020, 2830, 2660, 2500, 2360, 2230, 2110, 2000, 1900, 1810, 1720, 1650, 1580, 1520, 1460, 1400,
  1360, 1310, 1270, 1240, 1200, 1170, 1140, 1120, 1090, 1070, 1050, 1040, 1020, 1010, 990, 980, 970,
  960, 950, 940, 930, 930];

export const RALENTI = 850;
