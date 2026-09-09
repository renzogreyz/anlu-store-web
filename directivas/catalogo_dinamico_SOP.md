# Directiva: Catálogo Dinámico + Estructura de Sitio

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
- Valor: array JSON `[{ id, nombre, color, talla, precio }, ...]`
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

### Hallazgos del DS Bundle (críticos para no re-investigar)

- **`selection` NO se expone** por defecto al namespace público `AnluStoreDesignSystem_2c1944`.
  Solo vive en `__ds_scope` (closure interno). **Solución**: añadir la línea
  `__ds_ns.selection = __ds_scope.selection;` al final del `_ds_bundle.js` de la raíz
  (la copia en `_ds/`, no los originales en `vidriera/_ds/`).

- **`ProductCard`** acepta estas props:
  - `name`, `price`, `image`, `badge`, `category`, `phone`, `stock`, `sizes`, `colors`, `highlight`
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
