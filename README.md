# CarTuner Garaje

Proyecto de la UD4 «Integración de contenido interactivo» (Diseño de Interfaces Web, 2.º DAW).
Configurador 3D del CT Concept basado en mi proyecto CarTuner. Puedes cambiar el color, las llantas,
las pinzas, las lunas y la altura, abrir las puertas de tijera y el capó, encender las luces y arrancar
el motor. El presupuesto usa precios con fuente e indica qué necesita homologación en España.

Autor: Daniel Calvé Pardo

## Cómo abrirlo

Tiene que abrirse desde un servidor, porque el modelo 3D y los módulos de JavaScript no cargan con doble clic:

- **VS Code + Live Server:** clic derecho en `index.html` → *Open with Live Server*.
- **Apache:** copia la carpeta a `/var/www/html/` y abre `http://localhost/cartuner-garaje/`.
- **GitHub Pages:** sube el contenido de la carpeta a un repositorio y activa Pages (rama `main`, carpeta raíz).

## Estructura

```
index.html              página completa
css/estilos.css         estilos, efectos :hover y animaciones
js/configurador.js      interfaz: eventos de botones, opciones, audio, historial y presupuesto
js/escena3d.js          escena 3D con Three.js: modelo, cámara, puertas, capó, luces y pintura
js/datos.js             precios, fuentes y situación legal de cada modificación
modelos/ct-concept.glb  modelo 3D (Car Concept, CC BY 4.0)
audio/                  sonidos del motor en OGG y MP3
fuentes/                Michroma y Archivo (SIL OFL)
vendor/three/           Three.js r187 (licencia MIT), sin dependencias externas
img/icono.svg           icono de la pestaña
```

## Qué cubre de la rúbrica

| Criterio | Dónde está |
|---|---|
| Evento `onclick` (30 %) | Botones Puertas, Capó, Luces, Arrancar, Acelerar, 360°, Volver a serie y Comprobar compatibilidad. Deshacer y rehacer usan `onclick="history.back()"` y `onclick="history.forward()"`, como el ejemplo de la unidad |
| Efecto `:hover` (25 %) | Botones que crecen y cambian de fondo, muestras de color que crecen y brillan, tarjetas que giran un poco (como el ejemplo `.tarjeta:hover`), menú con subrayado y desplegables |
| `<details>/<summary>` (25 %) | Secciones «¿Qué hay que homologar?», «Ficha del CT Concept» y «Cómo funciona» |
| Compatibilidad (10 %) | Comprobado en Google Chrome (escritorio y móvil). Hay un botón que revisa en directo lo que soporta el navegador |
| Código limpio (10 %) | JS separado en tres archivos (datos, escena 3D e interfaz) y comentado. HTML y CSS validados en el W3C sin errores ni avisos. JS revisado con ESLint sin errores |
| Bonus `addEventListener()` (+10 %) | Todo el resto de eventos va en el `.js` externo: `change`, `click`, `keydown`, `popstate`, `pointerup` y los eventos de audio `play` y `ended` |

Extra de la unidad: el sonido es interactivo (el `ended` del arranque lanza el ralentí y el acelerón mueve el
cuentarrevoluciones), el coche 3D responde a clics sobre sus piezas y la animación usa transiciones CSS3 y WebGL.

## Comprobar en un segundo navegador

La rúbrica pide probarlo en dos navegadores. Ábrelo en **Firefox** y revisa esto en dos minutos:

1. Carga el coche 3D y se puede girar con el ratón.
2. Al elegir otro color, el coche cambia y aparece la línea en el presupuesto.
3. Puertas, Capó y Luces funcionan.
4. Arrancar suena y aparece el cuentarrevoluciones. Acelerar sube la aguja.
5. Deshacer y rehacer recuperan la configuración anterior.
6. Los desplegables se abren y se cierran.
7. En «Cómo funciona» → «Comprobar la compatibilidad», todo sale con ✓.

Si todo va bien, cambia en este README la fila de compatibilidad por «Comprobado en Google Chrome y Mozilla Firefox».

## Créditos

- Modelo 3D: [Car Concept](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept) de Eric Chadwick, © 2024 Darmstadt Graphics Group GmbH, licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es). Modificado en tiempo real.
- Three.js r187, licencia MIT.
- Tipografías Michroma y Archivo, licencia SIL Open Font License 1.1.
- Sonidos del motor sintetizados por código para este proyecto.
- Precios y normativa: los datos de CarTuner, con sus fuentes en `js/datos.js`.
