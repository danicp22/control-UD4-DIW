// =====================================================================
// CarTuner Garaje · interfaz
// Une los botones, las opciones y los sonidos con la escena 3D.
// Patrón de toda la página: EVENTO del usuario → ACCIÓN de la página.
// =====================================================================
import * as Escena from './escena3d.js';
import { PRECIOS, REFORMAS, FUENTES, CURVA_ACELERON, RALENTI } from './datos.js';

const $ = (selector) => document.querySelector(selector);
const formulario = $('#opciones');   // contenedor de todas las opciones
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' });

const DE_SERIE = { carroceria: 'carmin', acento: 'negro', llantas: 'negro', pinzas: 'rojo', lunas: 'ninguna', altura: '0' };
const GRUPOS = Object.keys(DE_SERIE);

const estado = {
  puertas: false,
  capo: false,
  luces: false,
  motor: 'apagado',      // apagado · arrancando · ralenti
  giro: false,
  indice: 0,             // posición en el historial (para deshacer / rehacer)
  maximo: 0
};

const sonidos = {
  arranque: $('#snd-arranque'),
  ralenti: $('#snd-ralenti'),
  aceleron: $('#snd-aceleron'),
  apagado: $('#snd-apagado')
};

// ================================================================ configuración

function leerConfiguracion() {
  const config = {};
  GRUPOS.forEach((g) => { config[g] = opcionMarcada(g).value; });
  return config;
}

function opcionMarcada(grupo) {
  return formulario.querySelector(`input[name="${grupo}"]:checked`);
}

function nombreOpcion(grupo) {
  const input = opcionMarcada(grupo);
  const etiqueta = input.closest('label');
  return (etiqueta.querySelector('em, strong')).textContent;
}

function colorOpcion(input) {
  return input.dataset.hex;
}

// Cada muestra de color se pinta con el color de su atributo data-hex
function pintarMuestras() {
  formulario.querySelectorAll('.muestra input').forEach((input) => {
    input.nextElementSibling.style.setProperty('--c', input.dataset.hex);
  });
}

// Aplica la configuración del formulario al coche 3D
function aplicarAlCoche() {
  const carroceria = colorOpcion(opcionMarcada('carroceria'));
  Escena.pintar('Paint 1 Carmine', carroceria);

  const acento = opcionMarcada('acento');
  if (acento.value === 'carroceria') {
    Escena.pintar('Paint 2 Carmine', carroceria, { rugosidad: 0.3 });
  } else {
    Escena.pintar('Paint 2 Carmine', colorOpcion(acento), { rugosidad: Number(acento.dataset.rugosidad) });
  }

  const llantas = opcionMarcada('llantas');
  Escena.pintar('Rim1', colorOpcion(llantas), {
    metal: Number(llantas.dataset.metal),
    rugosidad: Number(llantas.dataset.rugosidad)
  });
  Escena.pintar('Brake', colorOpcion(opcionMarcada('pinzas')));

  const lunas = opcionMarcada('lunas');
  Escena.tintarLunas(Number(lunas.dataset.traseras), Number(lunas.dataset.delanteras));

  Escena.fijarAltura(Number(opcionMarcada('altura').value) / 1000);
}

function marcarEnFormulario(config) {
  GRUPOS.forEach((g) => {
    const input = formulario.querySelector(`input[name="${g}"][value="${config[g]}"]`);
    if (input) input.checked = true;
  });
}

// ================================================================ presupuesto

function lineasPresupuesto(config) {
  const lineas = [];
  const anadir = (nombre, precio, reforma, nota) => lineas.push({ nombre, precio, reforma, nota });

  if (config.carroceria !== DE_SERIE.carroceria) {
    anadir(`Vinilado completo · ${nombreOpcion('carroceria')}`, PRECIOS.vinilado, REFORMAS.color);
  }
  if (config.acento !== DE_SERIE.acento) {
    anadir(`Paneles de acento · ${nombreOpcion('acento')}`, PRECIOS.viniloParcial, REFORMAS.color);
  }
  if (config.llantas !== DE_SERIE.llantas) {
    anadir(`Acabado de llantas · ${nombreOpcion('llantas')}`, PRECIOS.pinturaLlantas, REFORMAS.llantas);
  }
  if (config.pinzas !== DE_SERIE.pinzas) {
    anadir(`Pintura de pinzas · ${nombreOpcion('pinzas')}`, PRECIOS.pinturaPinzas, REFORMAS.pinzas);
  }
  if (config.lunas === 'todas') {
    anadir('Láminas en todas las lunas', PRECIOS.laminasTodas, REFORMAS.lunasDelanteras);
  } else if (config.lunas !== DE_SERIE.lunas) {
    anadir(`Lámina en lunas traseras · ${nombreOpcion('lunas')}`, PRECIOS.laminasTraseras, REFORMAS.lunas);
  }
  if (config.altura === '30') {
    anadir('Muelles rebajados 30 mm', PRECIOS.muelles, REFORMAS.suspension);
    anadir('Homologación de la suspensión', PRECIOS.homologarSuspension, null);
  } else if (config.altura === '50') {
    anadir('Coilovers rebajados 50 mm', PRECIOS.coilovers, REFORMAS.suspension);
    anadir('Homologación de la suspensión', PRECIOS.homologarSuspension, null);
  }
  return lineas;
}

function chip(clase, texto, titulo = '') {
  const t = titulo ? ` title="${titulo}"` : '';
  return `<span class="chip chip-${clase}"${t}>${texto}</span>`;
}

const ESTADOS = { verificado: 'Verificado', estimado: 'Estimado', desactualizado: 'Desactualizado', 'sin-dato': 'Sin dato' };

function pintarPresupuesto(config) {
  const lineas = lineasPresupuesto(config);
  let total = 0;
  let minimo = 0;
  let maximo = 0;
  let sinPrecio = 0;

  $('#lineas').innerHTML = lineas.map((l) => {
    const p = l.precio;
    if (p) { total += p.medio; minimo += p.min; maximo += p.max; } else { sinPrecio += 1; }
    const estadoPrecio = p ? p.estado : 'sin-dato';
    const fuente = p ? FUENTES[p.fuente] : null;
    const chips = [chip(estadoPrecio, ESTADOS[estadoPrecio], fuente ? `${fuente.nombre} (${fuente.fecha})` : '')];
    if (l.reforma) chips.push(chip(l.reforma.tipo, l.reforma.texto, l.reforma.nota));
    return `<li>
      <span class="nombre">${l.nombre}</span>
      <span class="precio num">${p ? euros.format(p.medio) : '—'}</span>
      <span class="chips">${chips.join('')}</span>
      <p class="nota">${p ? p.nota : l.nota}</p>
    </li>`;
  }).join('');

  const ilegal = lineas.some((l) => l.reforma && l.reforma.tipo === 'ilegal');
  const reformas = lineas.filter((l) => l.reforma && l.reforma.tipo === 'reforma').length;
  let resumen = 'Coche de serie, sin cambios';
  if (lineas.length) {
    resumen = `${lineas.length} ${lineas.length === 1 ? 'partida' : 'partidas'}`;
    if (reformas) resumen += ` · ${reformas} ${reformas === 1 ? 'reforma' : 'reformas'} para la ITV`;
    if (ilegal) resumen += ' · no legal';
  }
  let rango = lineas.length ? `Entre ${euros.format(minimo)} y ${euros.format(maximo)}.` : 'Coche de serie, sin cambios.';
  if (sinPrecio) rango += ` ${sinPrecio} sin precio con fuente, no suman.`;

  animarNumero($('#total'), total);
  animarNumero($('#total-hud'), total);
  $('#resumen-hud').textContent = resumen;
  $('#rango').textContent = rango;
  $('#total-hud').classList.toggle('peligro', ilegal);
}

function animarNumero(elemento, destino) {
  const inicio = Number(elemento.dataset.valor || 0);
  const t0 = performance.now();
  elemento.dataset.valor = destino;
  function paso(ahora) {
    const k = Math.min(1, (ahora - t0) / 450);
    const suave = 1 - Math.pow(1 - k, 3);
    elemento.textContent = euros.format(Math.round(inicio + (destino - inicio) * suave));
    if (k < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

// ================================================================ historial (deshacer / rehacer)

function aDireccion(config) {
  return '#' + new URLSearchParams(config).toString();
}

function deDireccion() {
  const params = new URLSearchParams(location.hash.slice(1));
  const config = { ...DE_SERIE };
  GRUPOS.forEach((g) => {
    const valor = params.get(g);
    if (valor && formulario.querySelector(`input[name="${g}"][value="${valor}"]`)) config[g] = valor;
  });
  return config;
}

function guardarEnHistorial() {
  estado.indice += 1;
  estado.maximo = estado.indice;
  history.pushState({ indice: estado.indice }, '', aDireccion(leerConfiguracion()));
  actualizarBotonesHistorial();
}

function actualizarBotonesHistorial() {
  $('#atras').disabled = estado.indice <= 0;
  $('#adelante').disabled = estado.indice >= estado.maximo;
}

// popstate: el navegador avisa de que hemos ido atrás o adelante
window.addEventListener('popstate', (evento) => {
  const anterior = estado.indice;
  estado.indice = evento.state ? evento.state.indice : 0;
  marcarEnFormulario(deDireccion());
  refrescar();
  actualizarBotonesHistorial();
  avisar(estado.indice < anterior ? 'Cambio deshecho' : 'Cambio rehecho');
});

// ================================================================ refresco general

function refrescar() {
  const config = leerConfiguracion();
  aplicarAlCoche();
  pintarPresupuesto(config);
}

// change: el usuario elige una opción del panel
formulario.addEventListener('change', (evento) => {
  refrescar();
  guardarEnHistorial();
  const input = evento.target;
  if (input.name === 'lunas' && input.value === 'todas') {
    avisar('Esta configuración no pasaría la ITV', true);
  } else if (input.name === 'altura' && input.value !== '0') {
    avisar('Rebajar la suspensión es una reforma');
  } else {
    avisar(`${nombreOpcion(input.name)} aplicado`);
  }
});

// ================================================================ avisos

let temporizadorAviso;
function avisar(texto, peligro = false) {
  const aviso = $('#aviso');
  aviso.textContent = texto;
  aviso.classList.toggle('peligro', peligro);
  aviso.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('visible'), 2200);
}

function marcarBoton(id, activo) {
  $(id).setAttribute('aria-pressed', String(activo));
}

// ================================================================ acciones con onclick
// Estas funciones se llaman desde el atributo onclick del HTML.

function alternarPuertas() {
  estado.puertas = !estado.puertas;
  Escena.abrirPuertas(estado.puertas);
  marcarBoton('#btn-puertas', estado.puertas);
  avisar(estado.puertas ? 'Puertas abiertas' : 'Puertas cerradas');
}

function alternarCapo() {
  estado.capo = !estado.capo;
  Escena.abrirCapo(estado.capo);
  marcarBoton('#btn-capo', estado.capo);
  avisar(estado.capo ? 'Capó abierto' : 'Capó cerrado');
}

function alternarLuces() {
  estado.luces = !estado.luces;
  Escena.encenderLuces(estado.luces);
  marcarBoton('#btn-luces', estado.luces);
  avisar(estado.luces ? 'Luces encendidas' : 'Luces apagadas');
}

function alternarGiro() {
  estado.giro = !estado.giro;
  Escena.girarSolo(estado.giro);
  marcarBoton('#btn-giro', estado.giro);
}

function alternarMotor() {
  if (estado.motor === 'apagado') {
    reproducir(sonidos.arranque);
  } else {
    Object.values(sonidos).forEach((s) => { s.pause(); s.currentTime = 0; });
    reproducir(sonidos.apagado);
    cambiarMotor('apagado');
  }
}

function acelerar() {
  if (estado.motor !== 'ralenti') {
    avisar('Arranca primero el motor');
    return;
  }
  sonidos.aceleron.currentTime = 0;
  reproducir(sonidos.aceleron);
}

function restablecer() {
  marcarEnFormulario(DE_SERIE);
  refrescar();
  guardarEnHistorial();
  avisar('Coche de serie');
}

// Como este archivo es un módulo, sus funciones no son globales.
// Las publicamos en window para que el atributo onclick del HTML las encuentre.
Object.assign(window, {
  alternarPuertas, alternarCapo, alternarLuces, alternarGiro, alternarMotor,
  acelerar, restablecer, comprobarCompatibilidad
});

// ================================================================ motor: eventos de los audios

function reproducir(audio) {
  audio.play().catch(() => avisar('El navegador ha bloqueado el sonido', true));
}

function cambiarMotor(nuevo) {
  estado.motor = nuevo;
  const encendido = nuevo !== 'apagado';
  marcarBoton('#btn-motor', encendido);
  $('#btn-motor').textContent = encendido ? 'Apagar' : 'Arrancar';
  $('#btn-acelerar').disabled = nuevo !== 'ralenti';
  $('#cuentarrevoluciones').hidden = !encendido;
  document.body.classList.toggle('motor-encendido', encendido);
  Escena.vibrarMotor(encendido ? 0.0012 : 0);
}

// play del arranque: el motor empieza a girar
sonidos.arranque.addEventListener('play', () => {
  cambiarMotor('arrancando');
  avisar('Arrancando');
});

// ended del arranque: pasamos al ralentí, que suena en bucle
sonidos.arranque.addEventListener('ended', () => {
  if (estado.motor !== 'arrancando') return;
  sonidos.ralenti.currentTime = 0;
  reproducir(sonidos.ralenti);
  cambiarMotor('ralenti');
  avisar('Motor en marcha');
});

// play / ended del acelerón: más vibración mientras suena
sonidos.aceleron.addEventListener('play', () => {
  sonidos.ralenti.volume = 0.25;
  Escena.vibrarMotor(0.004);
});
sonidos.aceleron.addEventListener('ended', () => {
  sonidos.ralenti.volume = 1;
  if (estado.motor === 'ralenti') Escena.vibrarMotor(0.0012);
});

// cuentarrevoluciones: lee el tiempo de los audios en cada fotograma
function revoluciones() {
  if (estado.motor === 'apagado') return 0;
  if (estado.motor === 'arrancando') {
    const t = sonidos.arranque.currentTime;
    if (t < 1.0) return 250 + Math.sin(t * 47) * 60;
    if (t < 1.45) return 250 + 1650 * Math.pow((t - 1.0) / 0.45, 0.6);
    return RALENTI + (1900 - RALENTI) * Math.exp(-(t - 1.45) / 0.45);
  }
  if (!sonidos.aceleron.paused) {
    const i = Math.min(CURVA_ACELERON.length - 1, Math.floor(sonidos.aceleron.currentTime / 0.05));
    return CURVA_ACELERON[i];
  }
  return RALENTI + Math.sin(performance.now() / 90) * 15;
}

function moverAguja() {
  const rpm = revoluciones();
  const angulo = Math.min(rpm, 8000) / 8000 * 180;
  $('#aguja').setAttribute('transform', `rotate(${angulo.toFixed(1)} 100 100)`);
  $('#rpm').textContent = Math.round(rpm / 10) * 10;
  requestAnimationFrame(moverAguja);
}

// ================================================================ pestañas

const pestanas = [...document.querySelectorAll('[role="tab"]')];

function mostrarPestana(pestana) {
  pestanas.forEach((p) => {
    const activa = p === pestana;
    p.setAttribute('aria-selected', String(activa));
    p.tabIndex = activa ? 0 : -1;
    document.getElementById(p.getAttribute('aria-controls')).hidden = !activa;
  });
}

pestanas.forEach((p, i) => {
  p.addEventListener('click', () => mostrarPestana(p));
  p.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const siguiente = pestanas[(i + (e.key === 'ArrowRight' ? 1 : pestanas.length - 1)) % pestanas.length];
    mostrarPestana(siguiente);
    siguiente.focus();
  });
});

// ================================================================ vistas de cámara

document.querySelectorAll('[data-vista]').forEach((boton) => {
  boton.addEventListener('click', () => {
    document.querySelectorAll('[data-vista]').forEach((b) => b.classList.toggle('activa', b === boton));
    Escena.colocarVista(boton.dataset.vista);
  });
});

// ================================================================ clic sobre el coche 3D

$('#lienzo').addEventListener('pieza', (evento) => {
  const pieza = evento.detail;
  if (pieza === 'puerta') alternarPuertas();
  else if (pieza === 'capo') alternarCapo();
  else if (pieza === 'rueda') { mostrarPestana($('#tab-ruedas')); avisar('Ruedas'); }
  else { mostrarPestana($('#tab-exterior')); avisar('Carrocería'); }
});

// ================================================================ compartir y capturar

$('#btn-compartir').addEventListener('click', () => {
  if (!navigator.clipboard) {
    avisar('Copia la dirección de la barra del navegador');
    return;
  }
  navigator.clipboard.writeText(location.href)
    .then(() => avisar('Enlace copiado'))
    .catch(() => avisar('Copia la dirección de la barra del navegador'));
});

$('#btn-captura').addEventListener('click', () => {
  const enlace = document.createElement('a');
  enlace.href = Escena.capturarImagen();
  enlace.download = 'cartuner-garaje.png';
  enlace.click();
  avisar('Imagen descargada');
});

// ================================================================ compatibilidad

function nombreNavegador() {
  const ua = navigator.userAgent;
  const reglas = [[/Edg\/([\d]+)/, 'Microsoft Edge'], [/OPR\/([\d]+)/, 'Opera'], [/Firefox\/([\d]+)/, 'Mozilla Firefox'],
    [/Chrome\/([\d]+)/, 'Google Chrome'], [/Version\/([\d]+).*Safari/, 'Safari']];
  for (const [regla, nombre] of reglas) {
    const m = ua.match(regla);
    if (m) return `${nombre} ${m[1]}`;
  }
  return 'un navegador desconocido';
}

function comprobarCompatibilidad() {
  const audio = document.createElement('audio');
  const pruebas = [
    ['WebGL 2 para el 3D', !!document.createElement('canvas').getContext('webgl2')],
    ['Módulos de JavaScript e importmap', HTMLScriptElement.supports ? HTMLScriptElement.supports('importmap') : false],
    ['Audio OGG Vorbis', audio.canPlayType('audio/ogg; codecs="vorbis"') !== ''],
    ['Audio MP3', audio.canPlayType('audio/mpeg') !== ''],
    ['Desplegables <details>', 'open' in document.createElement('details')],
    ['Historial (deshacer y rehacer)', typeof history.pushState === 'function'],
    ['Selector CSS :has()', CSS.supports('selector(:has(a))')],
    ['Copiar al portapapeles', !!navigator.clipboard]
  ];
  $('#navegador').textContent = `Estás usando ${nombreNavegador()}.`;
  $('#compat').innerHTML = pruebas.map(([nombre, ok], i) =>
    `<li style="animation-delay:${i * 60}ms"><span class="${ok ? 'si' : 'no'}">${ok ? '✓' : '✗'}</span>${nombre.replace('<', '&lt;').replace('>', '&gt;')}</li>`
  ).join('');
}

// ================================================================ inicio

function mostrarProgreso(cargados, total) {
  const mb = (n) => (n / 1048576).toFixed(1).replace('.', ',');
  $('#carga-barra').style.transform = `scaleX(${Math.min(1, cargados / total)})`;
  $('#carga-mb').textContent = `${mb(cargados)} / ${mb(total)} MB`;
}

function iniciar() {
  pintarMuestras();
  marcarEnFormulario(deDireccion());
  history.replaceState({ indice: 0 }, '', aDireccion(leerConfiguracion()));
  pintarPresupuesto(leerConfiguracion());
  actualizarBotonesHistorial();
  requestAnimationFrame(moverAguja);

  Escena.iniciarEscena($('#lienzo'), mostrarProgreso)
    .then(() => {
      aplicarAlCoche();
      Escena.encenderLuces(false);
      $('#carga').classList.add('oculta');
    })
    .catch(() => {
      $('#carga').querySelector('.carga-texto').textContent = 'No se ha podido cargar el modelo 3D. Ábrelo desde un servidor (Live Server o GitHub Pages).';
    });
}

iniciar();
