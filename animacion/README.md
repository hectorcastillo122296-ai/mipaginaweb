# Del dato a la decisión: animación de 20 s

Anuncio animado de 20 segundos en 16:9 (1920x1080). Muestra una arquitectura de datos conectada, gobernada y preparada para la IA. Es una sola página HTML con CSS y JavaScript, sin librerías, imágenes ni videos externos. Las fuentes se cargan desde Google Fonts y, si no hay red, se usan las del sistema.

## Ver la animación

Abre `index.html` en el navegador. Arranca sola y tiene botones para pausar y reiniciar, además de una barra para moverte por la línea de tiempo.

- `Espacio`: pausa o reanuda.
- `R`: reinicia.

## Línea de tiempo

| Tiempo | Escena | Texto |
|---|---|---|
| 0–3 s | SAP, origen del dato | Todo comienza con un dato |
| 3–6 s | Extracción a SQL, tablas de aterrizaje y transformaciones | Extraer. Transformar. Validar. |
| 6–9 s | Data Marts por dominio | Datos preparados para el negocio |
| 9–12 s | Power BI y linaje del KPI hasta su origen | Cada indicador tiene una historia |
| 12–16 s | Capa transversal de Gobierno de Datos | Documentado. Trazable. Seguro. |
| 16–20 s | Conexión con una red de IA y cierre | Gobernar los datos hoy. Habilitar la IA del mañana. |

La línea amarilla recorre SAP → SQL → transformaciones → Data Marts → Power BI y luego conecta la capa de gobierno con cada etapa. Todo el estado visual se calcula a partir del tiempo `t` en la función `render(t)`, así que cualquier cuadro se puede reproducir con exactitud.

Las etiquetas son genéricas (`LND_01`, "KPI", gráficos sin ejes ni cifras). No hay datos reales ni logos de terceros.

## Guion de voz en off

Unas 50 palabras a ritmo pausado. Cada frase entra al inicio de su escena, con un margen para respirar.

| Entra en | Locución |
|---|---|
| 0,3 s | Todo comienza con un dato. |
| 3,4 s | Lo extraemos, lo transformamos y lo validamos. |
| 6,4 s | Los Data Marts lo preparan para el negocio. |
| 9,4 s | Cada indicador tiene una historia que podemos rastrear. |
| 12,4 s | Un gobierno de datos que documenta, traza y protege cada etapa. |
| 16,3 s | Gobernar los datos hoy es habilitar la IA del mañana. |

Indicaciones para la voz: tono sereno y seguro, ritmo medio, sin énfasis comercial exagerado. Del segundo 18 al 20 solo queda la música o el silencio, para que el texto de cierre se lea en pantalla.

Si grabas o generas la locución como un solo archivo de 20 s, guárdalo como `voz.mp3` (o `voz.wav`) en esta carpeta. `npm run render` lo mezcla automáticamente. También puedes indicar otro archivo con `VOZ=ruta/al/audio.mp3 npm run render`. Si el audio es más corto se completa con silencio, y si es más largo se recorta a 20 s.

## Exportar a MP4

Se necesitan Node 18 o superior y `ffmpeg` en el PATH.

```bash
cd animacion
npm install
npx playwright install chromium   # solo la primera vez
npm run render                    # genera del-dato-a-la-decision.mp4 (30 fps, 600 cuadros)
```

Opciones:

- `FPS=60 node render.cjs`: exporta a 60 fps.
- `node render.cjs salida.mp4`: cambia el archivo de salida.
- `npm run frames`: guarda solo algunas capturas PNG para revisar.

El script abre la página en Chromium sin interfaz, recorre la línea de tiempo cuadro por cuadro con `window.__seek(t)` y pasa cada captura a `ffmpeg` (H.264, yuv420p).
