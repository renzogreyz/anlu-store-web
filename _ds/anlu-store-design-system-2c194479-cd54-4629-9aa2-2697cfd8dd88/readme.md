# Anlu Store — Design System

**Anlu Store** es un emprendimiento de indumentaria femenina. El sitio es una **vidriera
digital**: muestra el catálogo organizado por categorías y cada prenda termina en un botón
**"Consultar por WhatsApp"** que abre un chat con la vendedora con el nombre de la prenda
precargado. **No hay carrito, checkout, ni cuentas de usuario** — cualquier diseño que los
incluya está fuera de marca.

Categorías de producto (las seis, siempre en este orden): **Blusas · Bodys · Trajes de baño ·
Vestidos · Jeans · Pijamas**.

## Fuentes de este sistema
- Referencia visual entregada por la clienta: `uploads/WhatsApp Image 2026-08-31 at 11.41.34.jpeg`
  (mockup completo del home: topbar violeta, hero lavanda, categorías circulares, grilla de
  producto, franja de beneficios, newsletter, footer).
- Briefing de marca en el chat: paleta exacta, objetivo del sitio, estructura sugerida.
- **No** se entregaron: repositorio de código, archivo de Figma, archivos de fuentes, logo
  vectorial ni fotografía de producto. Todo lo relacionado con esos ítems está marcado abajo
  como sustitución o placeholder.

## Índice
| Archivo | Qué contiene |
| --- | --- |
| `styles.css` | Único punto de entrada CSS (solo `@import`) |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `radius-shadow`, `motion`, `base` |
| `components/core/` | Button, IconButton, Badge, GoldDivider, SectionHeading, Icon, PhotoFrame |
| `components/forms/` | Input |
| `components/commerce/` | ProductCard, CategoryCircle, WhatsAppButton, FeatureItem, PromoBanner |
| `guidelines/*.card.html` | Fichas de fundamentos (color, tipografía, espaciado, marca) |
| `ui_kits/anlu-store/` | Recreación interactiva del storefront (ver su README) |
| `thumbnail.html` | Tile del sistema |
| `SKILL.md` | Envoltura para usar este sistema como Agent Skill |

## Components
Cada componente tiene `<Name>.jsx`, `<Name>.d.ts` y `<Name>.prompt.md`.

- **Core** — `Button`, `IconButton`, `Badge`, `GoldDivider`, `SectionHeading`, `Icon`, `PhotoFrame`
- **Forms** — `Input`
- **Commerce** — `ProductCard`, `ProductOptionsModal`, `SelectionBar`, `Carousel`, `CategoryCircle`, `WhatsAppButton`, `FeatureItem`, `PromoBanner`

`Carousel` es el carrusel de novedades/eventos del Inicio: una imagen por slide, cantidad
variable, autoplay con pausa al hover, puntos de navegación y clic que lleva a la Tienda con
`?prenda=<nombre>`; la Tienda hace scroll a esa tarjeta y la resalta ~2s (`highlight`).

### Flujo de compra (sin carrito)
1. Cada tarjeta muestra stock (**Disponible / Agotado**). Agotada = botones deshabilitados.
2. "Comprar" y "Seleccionar" exigen **talla + color**: el primer clic abre `ProductOptionsModal`
   (tallas S/M/L/XL y swatches de color de esa prenda).
3. "Comprar" abre WhatsApp con prenda + talla + color.
4. "Seleccionar" marca la tarjeta (borde violeta, fondo lila, ✓) y la suma al store compartido.
5. Con 1+ prendas seleccionadas aparece el botón flotante **"Finalizar compra (n)"**
   (`SelectionBar`), que abre un drawer con miniatura, nombre, talla, color y precio de cada
   prenda, opción de quitar, y un envío único por WhatsApp.
No hay carrito persistente, checkout ni cuentas: el pedido siempre termina en un chat.

### Intentional additions
No existía una librería de componentes de origen (solo briefing + una imagen de referencia),
así que el set se derivó de lo visible en la referencia:
- `Icon` — envoltorio de la familia Lucide para mantener un solo peso de trazo.
- `PhotoFrame` — la marca es 60% fotografía; sin fotos reales, este placeholder evita que los
  layouts se lean mal. Reemplazable pasando `src`.
- `GoldDivider` — el separador dorado es un motivo recurrente en la referencia.
- `WhatsAppButton` — no es un botón genérico: encapsula el único flujo de conversión.
Se omitieron a propósito primitivas habituales que la marca no usa (Toast, Tabs, Dialog,
Avatar, Select, Switch): no aparecen en la referencia ni en el flujo vidriera.

## CONTENT FUNDAMENTALS
**Idioma:** **español de Colombia**, siempre en **"tú"** (nunca "vos" ni "ustedes" formal):
"Siéntete única, siéntete tú", "Escríbenos y te ayudamos", "Pagas cuando recibes tu pedido".
La marca habla como *nosotras* ("En Anlu creemos que…"), nunca como "yo" ni en tercera persona.
Vocabulario colombiano de confianza en las promesas del sitio: **"Envíos a toda Colombia"**,
**"Pago contraentrega disponible"**, **"Compra 100% segura"**, "2 a 5 días hábiles según ciudad".

**Tono:** cálido, aspiracional, cercano; nunca de descuento agresivo ni urgencia
("¡ÚLTIMAS HORAS!" está fuera de marca). Frases cortas, una idea por línea.

**Casing:**
- Eyebrows y botones: **MAYÚSCULAS** con tracking amplio — `SIÉNTETE ÚNICA, SIÉNTETE TÚ`, `VER COLECCIÓN`.
- Títulos de sección: MAYÚSCULAS en serif ligera — `NUEVA COLECCIÓN`.
- Titular de hero: sentence case en serif, con la palabra clave en **itálica violeta** —
  "Ropa que realza tu *esencia*".
- Nombres de prenda: Title Case — "Vestido Lila Satinado".
- Cuerpo: sentence case, sin punto final en frases de una línea dentro de tarjetas.

**Longitudes:** eyebrow ≤ 5 palabras · titular ≤ 6 palabras · párrafo de apoyo ≤ 22 palabras ·
botón 1–3 palabras.

**Precios:** pesos colombianos. `$159.900 COP` — punto de miles, sin decimales; la tarjeta
renderiza "COP" en sans 11px junto al precio en serif.

**Emoji:** no. El "emoji" de la marca son los motivos dorados (destello ✦, luna) dibujados como
íconos, nunca caracteres emoji. Unicode decorativo permitido solo en separadores (·).

**Ejemplos canónicos:**
- CTA producto: "Comprar" (con ícono de WhatsApp) + "Seleccionar" como acción secundaria
- Mensaje precargado: `¡Hola Anlu! Quiero comprar "Vestido Lila Satinado" en talla M, color Lila. ¿Me confirmas disponibilidad y el envío?`
- Pedido múltiple: `¡Hola Anlu! Quiero comprar estas prendas: • … — Talla M — Color Lila — $159.900 COP`
- Sección beneficios: "Envíos a toda Colombia, rápidos y seguros." · "Pagas cuando recibes tu pedido."
- Estado vacío: "Todavía no tenemos prendas para esa búsqueda. Escríbenos y te ayudamos a encontrarla."
- Newsletter: "Sé parte de Anlu · Recibe novedades, nuevos lanzamientos y sorpresas especiales."

## VISUAL FOUNDATIONS
**Color.** Cinco valores de marca: lavanda `#C4B5FD`, violeta profundo `#7D5BA6` (acento y
botones), lila muy claro `#EDE1FF` (fondos suaves), crema `#FDF6EE` (fondos cálidos), dorado
`#D4AF37` (solo detalle). Regla: **violeta actúa, lila y crema contienen, dorado adorna**.
El dorado nunca se usa como relleno de botón ni como color de texto de cuerpo. Máximo dos
fondos por página (crema + lila) sobre blanco. El topbar es el único bloque oscuro (`--violet-900`).

**Tipografía.** *Cormorant Garamond* (serif elegante, peso 300) para display, logo y precios;
*Jost* (sans geométrica, 300/400/500) para cuerpo, nav, botones y eyebrows. La itálica de la
serif es un recurso expresivo reservado a **una palabra por titular**. Eyebrows a 11px con
tracking .22em; botones a 12px con .14em.

**Espaciado y layout.** Base 8 (escala 4→128). Contenedor 1200px, gutter 24px, secciones con
96px verticales, grilla de producto con gap 18px (5-up en home, 4-up en catálogo, círculos de
categoría en una sola fila de 6). Header sticky con blur; nada más es fijo. Mucho aire: el
espacio en blanco es parte de la marca.

**Fondos.** Blanco por defecto; degradados **muy** suaves y de bajo contraste: `--grad-hero`
(lavanda diagonal), `--grad-banner` (lila horizontal), `--grad-warm` (crema → lila). Sin
texturas, sin patrones repetidos, sin ilustraciones dibujadas a mano. Los únicos elementos
gráficos son destellos y lunas doradas dispersas con opacidad .5–.8 sobre fondos lilas —
nunca sobre un rostro.

**Fotografía.** Protagonista y grande. Cálida, luz suave y difusa, wardrobe lavanda/crema
sobre interiores neutros; piel cálida, sin blanco y negro, sin grano, sin filtros fríos.
Recortes 3/4 para producto, 4/5 editorial, 21/9 para banners. Sin gradientes de protección
sobre la foto: el texto va al lado, no encima (excepción: badges y el corazón de favoritos,
que son cápsulas — badge dorado sólido, corazón en cápsula blanca con sombra suave).

**Radios.** 4 badges · 8 botones y campos · 12 tarjetas de producto · 18 banners y bloques
editoriales · 28 contenedores grandes · círculo perfecto para categorías. Nada de cuadrado a 0.

**Tarjetas.** Fondo blanco, borde hairline `#E7DFF0`, radio 12, sombra `--shadow-soft`
(violeta al 6%). En hover: sube 3px y pasa a `--shadow-card`. Sin borde de color a la izquierda,
sin sombras negras, sin sombras internas salvo el highlight opcional `--shadow-inset-top`.

**Bordes.** Siempre 1px. Neutro `--border-subtle` para estructura; `--border-gold` (dorado al
25%) para anillos de categoría y detalles premium, que pasan a dorado pleno en hover.

**Sombras.** Tres niveles, todas de violeta translúcido: `soft` (reposo), `card` (hover),
`lift` (elementos flotantes). Nunca `rgba(0,0,0,…)`.

**Movimiento.** Discreto: 140/240/420ms con `--ease-soft`. Fades y elevaciones cortas. Sin
bounce, sin parallax, sin animación de entrada por scroll más allá de un fade de 240ms.

**Hover.** Botón primario → violeta más oscuro (`--violet-800`). Secundario/ghost → fondo lila
`--lilac-50` y borde violeta. Enlaces → `--violet-900`. Tarjetas → elevación. Círculos de
categoría → suben 3px y el anillo se vuelve dorado. Nunca solo opacidad.

**Press.** `scale(.985)` más el tono más oscuro (`--violet-900`); sin desplazamiento.

**Foco.** Anillo `--shadow-focus` (violeta 400 al 45%) de 3px + borde `--violet-400`.

**Transparencia y blur.** Solo en dos lugares: header sticky (`rgba(255,255,255,.92)` +
`blur(10px)`) y cápsulas sobre fotografía. El resto es opaco.

## ICONOGRAPHY
- **No se entregaron íconos.** Se usa **Lucide** (trazo 2px, redondeado) como sustitución
  documentada, cargada desde CDN (`unpkg.com/lucide-static@0.454.0`) y teñida por CSS mask en
  el componente `Icon` — así todos los íconos heredan tokens de color.
- Glifos de interfaz: `search`, `heart`, `x`, `arrow-right`, `truck`, `refresh-cw`,
  `message-circle`, `instagram`, `facebook`, `mail`, `image`, `gift`.
- Motivos de marca: `sparkles`, `sparkle`, `moon`, `star` — **siempre en dorado**, 14–34px.
- El logotipo de WhatsApp es el oficial, servido desde `cdn.simpleicons.org/whatsapp` (blanco
  sobre violeta, violeta sobre claro). No redibujar.
- Sin fuente de íconos propia, sin sprite, sin PNG. **Sin emoji.**
- Nunca se dibujan SVG a mano para representar íconos o el logo.

## Sustituciones y faltantes (para revisar con la clienta)
1. **Fuentes:** no se entregaron archivos. Sustitución: Cormorant Garamond + Jost (Google
   Fonts, vía `@import` en `tokens/fonts.css`). Si existen fuentes oficiales, enviarlas y se
   reemplazan con `@font-face` local.
2. **Logo:** entregado por la clienta como `assets/logo.png` (PNG transparente, 1522×797,
   ≈1.91:1) — script lavanda bordado con luna y destellos dorados. Se usa a **52px de alto,
   ancho automático** en el header (42px en el footer del UI kit). Falta la versión vectorial
   (`logo.svg`) y una variante para fondos oscuros.
3. **Fotografía:** todo es placeholder `PhotoFrame`. Hacen falta fotos reales de producto
   (3/4) y 2–3 editoriales.
4. **Íconos:** Lucide como sustituto del set no provisto.
5. **Teléfono de WhatsApp:** `+57 320 123 4567` es de muestra; reemplazar en `data.js` y en el
   default de `WhatsAppButton`.
