# Directiva: Catálogo Dinámico + Estructura de Sitio

> **Actualización 2026-09-13**: Se agregaron correcciones de responsividad mobile.
> Ver sección "Responsividad Mobile" al final.
>
> **Actualización 2026-09-13 (tarde)**: Cambios A/B/C implementados.
> - `contenidoVisual` aún NO existe en el JSON de GitHub. El código lo lee con fallback graceful — cuando el campo aparezca, las imágenes se mostrarán automáticamente sin cambios de código.
> - Claves esperadas: `contenidoVisual.hero.{principal,secundaria1,secundaria2}`, `contenidoVisual.esenciaAnlu.{etiquetaAnlu,percheros,vestidoEspalda}`, `contenidoVisual.categorias.{<nombre_categoria>}`.
> - Categorías en Inicio ahora se filtran por stock (igual que en Tienda).

## Objetivo
Reorganizar el sitio Anlu Store en dos páginas (index.html y tienda.html)
y conectar ambas páginas dinámicamente al archivo `catalogo-mock.json`.

---

## Entradas
- `vidriera/Storefront.dc.html` → origen de la página de Inicio
- `tienda/Tienda.dc.html` → origen de la página Tienda
- `catalogo-mock.json` → fuente única de verdad de productos y novedades

## Salidas
- `index.html` → página de Inicio (raíz del sitio)
- `tienda.html` → página Tienda (raíz del sitio)
- `assets/` → logo y recursos compartidos
- `_ds/` → bundle del design system compartido
- `directivas/` y `scripts/` → carpetas de gestión interna

---

## Estructura de Archivos Objetivo

```
Anne paginaWeb/
├── index.html               ← Inicio (ex-vidriera)
├── tienda.html              ← Tienda (ex-tienda)
├── catalogo-mock.json       ← Fuente de datos
├── assets/
│   └── logo.png
├── _ds/
│   └── anlu-store-design-system-.../
│       ├── _ds_bundle.js
│       ├── styles.css
│       └── tokens/
├── ds-base.js               ← Cargador del DS (ruta unificada)
├── support.js               ← Runtime DC (copia única)
├── directivas/
│   └── catalogo_dinamico_SOP.md
└── scripts/
    └── (vacío por ahora)
```

---

## Lógica de Datos

### Productos (en ambas páginas)
- Fetch a `catalogo-mock.json` al montar el componente.
- Cada `producto` del array se mapea a las propiedades que espera `ProductCard`:
  - `name` ← `nombre`
  - `price` ← `precio` formateado con `$` y puntos de miles
  - `category` ← `categoria`
  - `badge` ← `"Nuevo"` si `nuevo === true`, `""` si no
  - `stock` ← `"disponible"` si `variante.stock > 0`, `"agotado"` si `variante.stock === 0`
  - **Nota**: `stock` es un número (cantidad de unidades). `0` = agotado, `> 0` = disponible.
    No usar `true`/`false` — ese esquema fue reemplazado el 2026-09-08.
  - `colors` ← array de `color` de cada variante
  - `images` ← array de `imagenes` de la variante activa
  - `talles` ← array `talles` de la variante activa
  - `id` ← id del producto (para anchor y scroll)

### Variante activa
- Por defecto: primera variante del producto.
- Al cambiar color en el selector: buscar la variante cuyo `color` coincida.
- Actualizar imágenes, talles y estado de stock según la variante elegida.

### Novedades (Inicio)
- Filtrar `novedades` donde `activo === true`.
- Ordenar por `orden` ascendente.
- Cada slide del carrusel usa `imagen` del objeto novedad.
- Al hacer clic en un slide → navegar a `tienda.html?prenda=<id_producto>`.

### Sección "Novedades" del Inicio (ProductCards)
- Solo incluir productos donde `nuevo === true`.

---

## Comportamiento de Selección Múltiple (localStorage)

- Clave localStorage: `anlu_seleccion`
- Valor: array JSON `[{ id, name, price, image, category, size, color }, ...]`
- **La selección se identifica por `id` del producto + `color` + `size`, NUNCA por nombre.**
  Dos productos distintos pueden llamarse igual (ej. "Blusa baby elisas": AN-002 Coral y AN-003 Celeste).
  Identificar por nombre marcaba ambos como "Seleccionada" y no permitía elegirlos por separado.
- Ítems viejos guardados sin `id` se ignoran (el bridge los filtra al leer y el store rechaza `add` sin id).
- Al presionar "Seleccionar" en un ProductCard: push del item al array.
- Al presionar "Finalizar compra" (SelectionBar): abrir WhatsApp con la lista completa.
- Al cargar cualquier página: leer el localStorage y mostrar el contador en SelectionBar.
- Esta selección persiste entre navegaciones (index ↔ tienda).

---

## Mensaje de WhatsApp

### Botón "Comprar" (un solo producto):
```
Hola! Quisiera comprar:
- [nombre] · Color: [color] · Talla: [talla]
Precio: [precio formateado]
```

### Botón "Finalizar compra" (SelectionBar, multi-producto):
```
Hola! Quisiera encargar:
1. [nombre] · Color: [color] · Talla: [talla] · [precio]
2. ...
Total estimado: $XXX.XXX
```

---

## Restricciones y Casos Borde

- Las páginas `.dc.html` usan el runtime `support.js` de Claude Design, que
  interpreta los templates `x-dc`, `sc-for`, `sc-if` y `x-import`.
  **No eliminar** `support.js` ni los tags `<x-dc>`.
- Los componentes `x-import` (ProductCard, Carousel, etc.) son provistos por
  `_ds_bundle.js`. Solo se les pueden pasar props declaradas en el DS.
  Para lógica extra (selección, localStorage), agregar JS vanilla **fuera** del
  template `<x-dc>` pero dentro del mismo archivo.
- El DS usa `DCLogic` como clase base; el state se maneja con `this.setState({})`.
- Las rutas de `ds-base.js` y `support.js` deben ser relativas a la raíz del
  sitio (ambas páginas en la misma carpeta raíz).
- `fetch('catalogo-mock.json')` funciona con file:// solo si el servidor local
  sirve correctamente los archivos. Para producción, cualquier servidor HTTP
  estático es suficiente.

### Celdas con varios valores (hoja Variantes) — apaño conocido
- `color` con comas ("Rojo, Negro, Blanco") → cada uno es un color elegible distinto (se recortan espacios, se descartan
  vacíos y repetidos sin distinguir mayúsculas/acentos). Esos colores **comparten stock, fotos y talles de esa fila**
  (limitación conocida, no resuelta a propósito). El mensaje de WhatsApp lleva solo el color que eligió la clienta.
- `talles` (string o array): separados por coma, salto de línea o espacios; se descartan vacíos. Regla de espacios:
  solo se separa por espacios si TODAS las partes son tallas ("S M L", "28 30 32"); texto libre como "Talla 6" o
  "Talla única" queda como un único talle. Si hay un solo talle, el selector lo muestra ya elegido.
  Nota: para varios talles con texto libre, usar comas o saltos de línea ("Talla 6, Talla 8").
- `imagenes` (string o array): separadas por coma o salto de línea; se descarta todo lo que no empiece con `http(s)://`.
  Nota: un link que contenga una coma se cortaría (no ocurre con los links de Drive actuales).
- Los helpers (`parseColores`, `parseTalles`, `parseImagenes`, `coloresDe`) están duplicados en `index.html` y
  `tienda.html`; si se cambia uno, cambiar el otro. Script: `scripts/datos_variantes_y_colores.py` (idempotente).
- Se usa la primera variante para talles e imagen de la card (comportamiento previo); los colores son la unión de todas.

### Círculos de color (ProductOptionsModal, copia raíz de `_ds_bundle.js`)
- Búsqueda de nombre sin distinguir mayúsculas ni acentos (`SWATCHES` + `normColor`). Para sumar un color nuevo,
  agregarlo a `SWATCHES`. Si no está, se prueba como color CSS (`CSS.supports`).
- Nota: no usar el nombre tal cual como `background` (un nombre en español como "Celeste" no es CSS válido y el
  círculo quedaba blanco/invisible). Color no reconocido: círculo con borde violeta y la inicial adentro (2-3 letras si
  dos desconocidos comparten inicial). Todos los círculos llevan borde visible (los claros como Blanco/Crema se ven).
- Prueba: `.tmp/cdp_datos_test.mjs` (catálogo simulado, Edge headless).

### Hallazgos del DS Bundle (críticos para no re-investigar)

- **`selection` NO se expone** por defecto al namespace público `AnluStoreDesignSystem_2c1944`.
  Solo vive en `__ds_scope` (closure interno). **Solución**: añadir la línea
  `__ds_ns.selection = __ds_scope.selection;` al final del `_ds_bundle.js` de la raíz
  (la copia en `_ds/`, no los originales en `vidriera/_ds/`).

- **`ProductCard`** acepta estas props:
  - `product-id` (llega como prop `productId`), `name`, `price`, `image`, `badge`, `category`, `phone`, `stock`, `sizes`, `colors`, `highlight`
  - `product-id` es obligatorio en la práctica: es la identidad de la selección. Si falta, la card cae al `name`
    (reintroduce el bug de nombres duplicados). Pasar siempre `product-id="{{ p.id }}"`.
  - Usar el atributo en kebab-case (`product-id`), no camelCase: el runtime DC parsea el HTML dos veces y los
    atributos camelCase se minusculizan en el primer parseo.
  - `sizes`: array de strings ej. `['S','M','L']`
  - `colors`: array de strings ej. `['Lila','Beige']`
  - `stock`: string `'disponible'` o `'agotado'`
  - El componente abre un modal (`ProductOptionsModal`) interno para elegir talla/color
    antes de Comprar o Seleccionar. No necesita lógica externa para eso.

- **`Carousel`** acepta `slides` como array de `{ image, label, product }`:
  - `image`: URL de la imagen del slide
  - `label`: texto descriptivo
  - `product`: string que se pasa como `?prenda=<product>` en la URL de destino
  - `href`: URL base de destino (ej. `'./tienda.html'`)

- **`SelectionBar`**: recibe solo `phone`. Muestra el drawer de selección.
  Internamente usa `__ds_scope.selection` (el store en memoria).

- **Store `selection` (API por id)**: `keyOf(item)` = `id|color|size`; `isSelected(id)`; `add(item)` (ignora si no hay id);
  `remove(key)` (una prenda concreta, usado por el panel "Finalizar compra"); `removeById(id)` (deseleccionar desde la card);
  `toggle(item)`. El cambio se aplica solo en la copia raíz `_ds/`. Las copias legacy `tienda/_ds` y `vidriera/_ds`
  usan datos estáticos sin id: **no tocarlas** (quedarían sin poder seleccionar). Script: `scripts/seleccion_por_id.py` (idempotente).

- **Trampa conocida — NO sobreescribir `window.ANLU.phone` desde las páginas**: la línea
  `if (window.ANLU) window.ANLU.phone = ANLU_PHONE;` se reportó como causa de que las imágenes del hero desaparecieran
  (se quitó en el commit 9154591). El teléfono se define en `phone=` del `SelectionBar` y en el bundle; no agregar overrides.

- **Prueba E2E de selección**: `.tmp/cdp_seleccion_test.mjs` (Edge headless + CDP, levanta su propio `http.server`) cubre
  Coral/Celeste por separado, panel, mensaje de WhatsApp, selección vieja sin id y persistencia. Nota: la card recuerda la
  última talla/color elegidos, así que al re-seleccionar no vuelve a abrir el modal.

- **Bridge localStorage**: el `initSelectionBridge()` debe llamarse ANTES de que
  el componente monte. Espera activamente (polling 100ms) a que `AnluStoreDesignSystem_2c1944.selection`
  esté disponible (el bundle carga async). Luego hidrata el store con el localStorage
  y se suscribe a cambios para guardar.


---

## Pasos de Ejecución

1. Copiar assets compartidos a la raíz.
2. Generar `index.html` desde `vidriera/Storefront.dc.html` con:
   - Rutas corregidas (`./assets/logo.png`, `./ds-base.js`, `./support.js`)
   - Links de navegación corregidos (`./tienda.html`)
   - Script de datos reemplazado por fetch dinámico a `catalogo-mock.json`
3. Generar `tienda.html` desde `tienda/Tienda.dc.html` con las mismas correcciones.
4. Crear `ds-base.js` raíz apuntando al `_ds/` compartido.
5. Copiar `support.js` a la raíz.
6. Verificar que todos los archivos existen y las rutas son correctas.
