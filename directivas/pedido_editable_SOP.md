# Directiva: Pedido editable, galería y stock en gris (Etapa 6 del panel)

> Pedido de la dueña (2026-10-26). Fuente de verdad: `BRIEF_ANLU_ADMIN.md` §10, Etapa 6 (repo `anlu-store-admin`).

## Qué ve la clienta

**Tarjeta de cada prenda** (Inicio → Novedades y Tienda)
- Foto de portada = la primera foto del **primer color con stock**.
- "Disponible" / "Agotado": la prenda se ve **Agotado solo si no queda stock en ningún color**. Antes miraba solo el primer color.
- Si tiene varios colores: "3 colores" o "2 de 3 colores disponibles".
- Rebaja: etiqueta `-20%`, precio viejo tachado y el nuevo.
- Botones: **Comprar** (manda solo esa prenda por WhatsApp) y **Agregar al pedido** (o "Agregar otra" si ya está en el pedido).
- Tocar la foto abre la ventana de la prenda.

**Ventana de la prenda**
- **Galería** con todas las fotos del color elegido: se desliza con el dedo, tiene flechas, contador "2 / 12" y puntitos.
- Al tocar otro color, la galería cambia a las fotos de ese color.
- **Colores y tallas sin stock en gris y tachados.** Un color agotado se puede tocar para ver sus fotos, pero no deja agregarlo. Una talla agotada no se puede tocar.
- Si al color le queda **una sola talla con stock**, la elige sola. Con 3 o menos unidades avisa "¡Quedan 2!".
- La cantidad no pasa del stock.
- **Para agregar al pedido se cuenta lo que queda** (stock menos lo que ya está en el pedido, incluidos los combos). Si la única unidad ya está en el pedido, la talla sale gris "ya en tu pedido", la tarjeta dice **"Ya está en tu pedido"** y la ventana avisa "La única que queda ya está en tu pedido.". "Comprar" directo sigue disponible: manda solo esa prenda (arreglo del 2026-10-26).

**Combos** (Inicio → Combos)
- **Agregar al pedido** abre una ventana para elegir color y talla de **cada prenda del combo** (un "Trío de bodys" son 3 piezas).
- Solo se ofrecen los colores y tallas que la dueña dejó entrar en el combo (`colores` / `talles` del JSON, Etapa 6A). Las tallas que no entran no aparecen; las que entran pero no tienen stock, en gris.
- Si alguna prenda del combo no tiene stock en lo que entra, el combo dice **Agotado**. Si hay stock pero ya está en el pedido, dice **Ya está en tu pedido**.
- Cada pieza cuenta lo que eligieron las otras piezas del mismo combo: si las piezas 1 y 2 usan las 2 unidades de Negro S, en la pieza 3 Negro sale en gris.
- Debajo queda el enlace "Consultar por WhatsApp", como antes.

**Barra de abajo** (aparece cuando hay algo en el pedido)
- Izquierda **Editar compra** → abre "Tu pedido".
- Derecha **Finalizar compra (n)** → abre WhatsApp **directo** con todo el pedido. Si falta elegir algo o se pasa del stock, en vez de abrir WhatsApp abre "Tu pedido" con lo que hay que arreglar en rojo.

**Tu pedido** (panel lateral)
- Cada prenda: foto del color elegido, precio con `-%` y tachado, **Color** y **Talla** para cambiar (las agotadas aparecen deshabilitadas), cantidad − / + (no pasa del stock) y **X** para quitar.
- Cada combo en una caja lila: nombre, precio, "Ahorras $X", cantidad del combo, cada pieza con su Color/Talla (solo lo que entra) y **X**.
- Avisos en rojo: "Elige color y talla.", "Solo quedan 2 en Negro talla S." (contando prendas sueltas + combos), "Se agotó…", "… no entra en este combo.", "Esta prenda ya no está disponible."
- Abajo: total, cuánto ahorra, **Finalizar compra** y "Vaciar pedido" (pide confirmación).

**Mensaje de WhatsApp**
```
¡Hola Anlu! Quiero hacer este pedido:

• 2 × Body básico (AN-010) — Color Negro — Talla S — $32.000 c/u (antes $40.000, -20%)
• 1 × Combo "Body + Jean" — $100.000
   - Body básico: Beige, talla M
   - Jean: Azul, talla 8

Total: $164.000 (ahorro $36.000)

¿Me confirmas disponibilidad y el envío, por favor?
```

## Archivos

| Archivo | Qué hace |
|---|---|
| `js/pedido.js` | **Lógica sin nada visual** (`window.AnluPedido`): normaliza el `catalogo.json` (el del panel y el viejo de la planilla), stock por color y talla, lo que entra en cada combo, el pedido (agregar, cambiar, juntar líneas iguales, quitar), topes de cantidad, avisos, totales, mensaje y enlace de WhatsApp, y el guardado en `localStorage`. El **número de WhatsApp** de los pedidos está acá (`TELEFONO`). |
| `js/tienda-ui.js` | **Piezas visuales** (`window.AnluTienda`): `ProductCard`, `BotonesCombo`, `PedidoBar` (barra + "Tu pedido" + aviso "Agregaste…"), la ventana con galería y la de combos. Usa React global (lo carga `support.js`). |
| `index.html` / `tienda.html` | Cargan los dos archivos en `<head>`, llaman a `AnluPedido.store.setCatalogo(data)` al leer el catálogo y usan `<x-import component-from-global-scope="AnluTienda.…">`. |

**Por qué archivos propios y no el design system:** el bundle `_ds/.../_ds_bundle.js` se genera desde Design Composer. Si se regenera, cualquier cambio hecho a mano adentro se pierde. Por eso todo lo nuevo vive en `js/` y el bundle queda como estaba. `ProductCard`, `ProductOptionsModal` y `SelectionBar` del design system **ya no se usan** en las páginas. El parche `priceBefore` sigue en el bundle, pero ya no hace falta.

## Datos que usa

- `productos[].variantes[]`: `color`, `imagenes` (todas, para la galería) y `tallesDetalle` (stock por talla).
- **Compatibilidad con el JSON viejo de la planilla** (el que está publicado hasta el cambio final): no trae `tallesDetalle`. Se usan `talles` (solo las que tienen stock) y `stock` del color; ahí el stock exacto no se sabe, así que no se limita la cantidad. `"Rojo, Negro"` en una fila son dos colores, y las fotos pueden venir separadas por coma.
- `precioOferta`: precio rebajado y `-%`.
- `combos[].productos[]`: `id`, `nombre`, `cantidad`, `colores` y `talles` (`null` = entran todos).

## Guardado

- `localStorage["anlu_pedido"] = { v: 1, items: [...] }`, así el pedido sigue al pasar de Inicio a Tienda y al volver otro día.
- Lo que una clienta había elegido con el botón "Seleccionar" del sitio anterior (`anlu_seleccion`) pasa solo al pedido la primera vez, y se borra la clave vieja.
- Sin `localStorage` (modo privado, bloqueado) el pedido funciona igual mientras la página esté abierta.
- Los precios y el stock **no** se guardan: se leen siempre del catálogo, así que si la dueña cambia un precio, el pedido muestra el nuevo.

## Verificación del arreglo "lo que queda" (2026-10-26, noche)
- Lógica: 44 comprobaciones.
- Navegador a 375 × 812: 71 comprobaciones, dos veces seguidas. Incluye:
  - Prenda de 1 unidad que no se puede agregar dos veces.
  - Talla con todo en el pedido, en gris.
  - "Comprar" que sigue activo.
  - Combo que no alcanza por lo que ya está en el pedido.
  - Pieza 3 sin Negro S.
  - Galería que arranca de cero al cambiar de color.

## Verificación (2026-10-26)

- `js/pedido.js` probado en Node (**37 comprobaciones**): galería por color, agotado por prenda y por color, portada, rebaja, opciones del combo, piezas, combo agotado, juntar líneas, topes, avisos de stock compartido entre prendas y combos, totales, mensaje, JSON viejo, migración de "Seleccionar", guardado y modo privado.
- Navegador a 375 × 812 con un catálogo simulado (**61 comprobaciones**): tarjetas, galería (flechas y deslizar), grises, autoselección, "¡Queda 1!", tope de cantidad, agregar, barra (Editar a la izquierda, botones de 56 px), Comprar directo, Tu pedido (cambiar color/talla, opciones agotadas deshabilitadas, avisos que aparecen y desaparecen, X), combos (solo lo que entra, no deja agregar incompleto, agrupado con ahorro), Finalizar bloqueado con avisos y directo sin avisos, mensaje, vaciar, el pedido sigue entre páginas, sin scroll horizontal, sin errores de JavaScript y compatibilidad con el JSON viejo.
- Capturas en escritorio (1280 × 900): la ventana queda centrada y "Tu pedido" se abre a la derecha.
