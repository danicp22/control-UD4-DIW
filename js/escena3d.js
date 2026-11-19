// =====================================================================
// CarTuner Garaje · escena 3D
// Carga el modelo CT Concept con Three.js y ofrece funciones sencillas
// (pintar, abrir puertas, encender luces...) para que la interfaz las use.
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ARRIBA = new THREE.Vector3(0, 1, 0);

// Posiciones de cámara: [posición, punto al que mira]
const VISTAS = {
  exterior: [[5.3, 1.7, 5.6], [0, 0.45, 0]],
  lateral: [[7.4, 1.0, 0.2], [0, 0.5, 0]],
  trasera: [[-4.4, 1.8, -5.8], [0, 0.5, 0]],
  frontal: [[0.2, 1.0, 7.4], [0, 0.5, 0]],
  interior: [[0, 1.13, -0.12], [0, 0.93, 0.78]]
};

let renderer, escena, camara, controles, coche;
let lienzo;
const materiales = {};            // materiales del modelo por nombre
const piezas = {};                // nodos que se mueven (puertas, capó, ruedas)
const animaciones = [];           // valores que se acercan poco a poco a su objetivo
let vibracion = 0;                // intensidad de la vibración del motor
let alturaActual = 0;
let focos = [];
let vistaObjetivo = null;

// ---------------------------------------------------------------- utilidades

// Valor que se anima hacia un objetivo en cada fotograma
function animable(inicial, alCambiar) {
  const a = { valor: inicial, objetivo: inicial, alCambiar };
  animaciones.push(a);
  return a;
}

// Gira una pieza alrededor de un eje expresado en coordenadas del mundo
function girarEnMundo(pieza, ejeMundo, angulo) {
  const qPadre = new THREE.Quaternion();
  pieza.parent.getWorldQuaternion(qPadre);
  const ejeLocal = ejeMundo.clone().applyQuaternion(qPadre.invert()).normalize();
  const giro = new THREE.Quaternion().setFromAxisAngle(ejeLocal, angulo);
  pieza.quaternion.copy(pieza.userData.giroInicial).premultiply(giro);
}

function texturaSuelo() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, '#24282e');
  grad.addColorStop(0.2, '#16191d');
  grad.addColorStop(1, '#0b0d10');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texturaSombra() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.85)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.45)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// ---------------------------------------------------------------- arranque

export async function iniciarEscena(canvas, alProgresar) {
  lienzo = canvas;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  escena = new THREE.Scene();
  escena.background = new THREE.Color('#0b0d10');
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.75;

  camara = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
  controles = new OrbitControls(camara, canvas);
  controles.enableDamping = true;
  controles.enablePan = false;
  controles.maxPolarAngle = Math.PI * 0.49;
  controles.minDistance = 3.2;
  controles.maxDistance = 13;
  controles.autoRotateSpeed = 1.2;
  colocarVista('exterior', true);

  const luz = new THREE.DirectionalLight('#ffffff', 1.4);
  luz.position.set(2, 6, 3);
  escena.add(luz);

  const suelo = new THREE.Mesh(
    new THREE.CircleGeometry(40, 96),
    new THREE.MeshBasicMaterial({ map: texturaSuelo(), toneMapped: false })
  );
  suelo.rotation.x = -Math.PI / 2;
  escena.add(suelo);

  window.addEventListener('resize', ajustarTamano);
  ajustarTamano();
  bucle();

  return new Promise((resolver, rechazar) => {
    new GLTFLoader().load('modelos/ct-concept.glb', (gltf) => {
      prepararModelo(gltf.scene);
      resolver();
    }, (e) => {
      if (alProgresar) alProgresar(e.loaded, e.total || 5873740);
    }, rechazar);
  });
}

function prepararModelo(modelo) {
  coche = new THREE.Group();
  coche.add(modelo);
  escena.add(coche);

  // centrar el coche y apoyarlo en el suelo
  const caja = new THREE.Box3().setFromObject(modelo);
  const centro = caja.getCenter(new THREE.Vector3());
  modelo.position.set(-centro.x, -caja.min.y, -centro.z);

  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(caja.max.x - caja.min.x + 1.2, caja.max.z - caja.min.z + 1.4),
    new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false })
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.002;
  escena.add(sombra);

  modelo.traverse((o) => {
    if (o.isMesh) {
      const lista = Array.isArray(o.material) ? o.material : [o.material];
      lista.forEach((m) => { if (m.name) materiales[m.name] = m; });
    }
  });

  // las lunas traseras llevan su propio material para poder tintarlas solas
  const cristal = materiales.Glass;
  materiales.GlassTrasero = cristal.clone();
  ['BodyWindowsRearSides', 'BodyRearwindow'].forEach((nombre) => {
    const n = modelo.getObjectByName(nombre);
    n.traverse((o) => { if (o.isMesh) o.material = materiales.GlassTrasero; });
  });

  // piezas móviles: guardamos su giro y posición de partida
  const nombres = {
    puertaI: 'BodyDoorLColor1', puertaD: 'BodyDoorRColor1', capo: 'BodyHood',
    ruedaDI: 'WheelFrontL', ruedaDD: 'WheelFrontR', ruedaTI: 'WheelRearL', ruedaTD: 'WheelRearR'
  };
  Object.entries(nombres).forEach(([clave, nombre]) => {
    const n = modelo.getObjectByName(nombre);
    n.userData.giroInicial = n.quaternion.clone();
    n.userData.posInicial = n.position.clone();
    n.userData.pieza = clave;
    piezas[clave] = n;
  });

  // las puertas se abren en tijera (hacia arriba) girando sobre el eje transversal
  piezas.puertas = animable(0, (v) => {
    girarEnMundo(piezas.puertaI, new THREE.Vector3(1, 0, 0), v * 1.2);
    girarEnMundo(piezas.puertaD, new THREE.Vector3(1, 0, 0), v * 1.2);
  });
  piezas.capoAbierto = animable(0, (v) => {
    girarEnMundo(piezas.capo, new THREE.Vector3(1, 0, 0), v * 0.62);
  });
  piezas.altura = animable(0, (v) => {
    alturaActual = v;
    coche.position.y = -v;
    ['ruedaDI', 'ruedaDD', 'ruedaTI', 'ruedaTD'].forEach((r) => {
      const rueda = piezas[r];
      const q = new THREE.Quaternion();
      rueda.parent.getWorldQuaternion(q);
      const arribaLocal = ARRIBA.clone().applyQuaternion(q.invert());
      rueda.position.copy(rueda.userData.posInicial).addScaledVector(arribaLocal, v);
    });
  });

  // focos delanteros (se encienden con las luces)
  [-0.6, 0.6].forEach((x) => {
    const foco = new THREE.SpotLight('#dfe8ff', 0, 14, 0.42, 0.6, 1.2);
    foco.position.set(x, 0.65, 2.1);
    foco.target.position.set(x * 1.4, 0, 7);
    escena.add(foco, foco.target);
    focos.push(foco);
  });

  // clic sobre el coche: avisa a la interfaz de qué pieza se ha tocado
  activarClicEnPiezas(modelo);
}

// ---------------------------------------------------------------- bucle

function ajustarTamano() {
  const ancho = lienzo.clientWidth;
  const alto = lienzo.clientHeight;
  renderer.setSize(ancho, alto, false);
  camara.aspect = ancho / alto;
  camara.fov = camara.aspect < 0.9 ? 62 : (ancho < 700 ? 48 : 35);
  camara.updateProjectionMatrix();
}

const reloj = new THREE.Timer();
function bucle() {
  requestAnimationFrame(bucle);
  reloj.update();
  const dt = Math.min(reloj.getDelta(), 0.05);
  const t = reloj.getElapsed();

  animaciones.forEach((a) => {
    if (Math.abs(a.objetivo - a.valor) > 0.0005) {
      a.valor += (a.objetivo - a.valor) * Math.min(1, dt * 5);
      a.alCambiar(a.valor);
    }
  });

  if (coche) {
    coche.position.x = Math.sin(t * 61) * vibracion * 0.6;
    coche.position.y = -alturaActual + Math.sin(t * 47) * vibracion;
    coche.rotation.z = Math.sin(t * 33) * vibracion * 0.25;
  }

  if (vistaObjetivo) {
    camara.position.lerp(vistaObjetivo.pos, Math.min(1, dt * 3));
    controles.target.lerp(vistaObjetivo.mira, Math.min(1, dt * 3));
    if (camara.position.distanceTo(vistaObjetivo.pos) < 0.02) vistaObjetivo = null;
  }
  controles.update();
  renderer.render(escena, camara);
}

// ---------------------------------------------------------------- clic en piezas

function activarClicEnPiezas(modelo) {
  const rayo = new THREE.Raycaster();
  let inicio = null;
  lienzo.addEventListener('pointerdown', (e) => { inicio = [e.clientX, e.clientY]; });
  lienzo.addEventListener('pointerup', (e) => {
    if (!inicio || Math.hypot(e.clientX - inicio[0], e.clientY - inicio[1]) > 6) return;
    const r = lienzo.getBoundingClientRect();
    const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rayo.setFromCamera(p, camara);
    const toque = rayo.intersectObject(modelo, true)[0];
    if (!toque) return;
    let o = toque.object;
    while (o && !o.userData.pieza) o = o.parent;
    const pieza = o ? o.userData.pieza : 'carroceria';
    lienzo.dispatchEvent(new CustomEvent('pieza', { detail: pieza.startsWith('rueda') ? 'rueda' : pieza.replace(/[ID]$/, '') }));
  });
}

// ---------------------------------------------------------------- API para la interfaz

export function pintar(material, hex, acabado = {}) {
  const m = materiales[material];
  if (!m) return;
  m.color.set(hex);
  if (acabado.metal !== undefined) m.metalness = acabado.metal;
  if (acabado.rugosidad !== undefined) m.roughness = acabado.rugosidad;
}

export function tintarLunas(traseras, delanteras) {
  const tono = (cantidad) => new THREE.Color('#ffffff').lerp(new THREE.Color('#14171b'), cantidad);
  if (!materiales.Glass) return;
  materiales.GlassTrasero.color.copy(tono(traseras));
  materiales.Glass.color.copy(tono(delanteras));
}

export function fijarAltura(metros) {
  if (!coche) return;
  piezas.altura.objetivo = metros;
}

export function abrirPuertas(abrir) {
  if (!coche) return;
  piezas.puertas.objetivo = abrir ? 1 : 0;
}

export function abrirCapo(abrir) {
  if (!coche) return;
  piezas.capoAbierto.objetivo = abrir ? 1 : 0;
}

export function encenderLuces(encender) {
  if (!coche) return;
  materiales.Headlight.emissiveIntensity = encender ? 16 : 2;
  materiales.Brakelight.emissiveIntensity = encender ? 5 : 0.8;
  focos.forEach((f) => { f.intensity = encender ? 40 : 0; });
}

export function vibrarMotor(intensidad) {
  vibracion = intensidad;
}

export function colocarVista(nombre, inmediato = false) {
  const [pos, mira] = VISTAS[nombre];
  const destino = { pos: new THREE.Vector3(...pos), mira: new THREE.Vector3(...mira) };
  const dentro = nombre === 'interior';
  controles.minDistance = dentro ? 0.05 : 3.2;
  controles.maxDistance = dentro ? 0.8 : 13;
  controles.maxPolarAngle = dentro ? Math.PI : Math.PI * 0.49;
  if (inmediato) {
    camara.position.copy(destino.pos);
    controles.target.copy(destino.mira);
  } else {
    vistaObjetivo = destino;
  }
}

export function girarSolo(activar) {
  controles.autoRotate = activar;
}

export function capturarImagen() {
  renderer.render(escena, camara);
  return renderer.domElement.toDataURL('image/png');
}
