/* ═══════════════════════════════════════════════════════════════
   Anlu Store — Piezas visuales de la tienda (Etapa 6B y 6C)
   Doc: directivas/pedido_editable_SOP.md
   ───────────────────────────────────────────────────────────────
   Se usan desde index.html y tienda.html con:
     <x-import component-from-global-scope="AnluTienda.ProductCard" producto-id="AN-001">
     <x-import component-from-global-scope="AnluTienda.BotonesCombo" combo-id="...">
     <x-import component-from-global-scope="AnluTienda.PedidoBar">
   La lógica (stock, precios, mensaje) vive en js/pedido.js (window.AnluPedido).
   Son archivos del sitio, NO del design system: si se regenera el
   design system, esto no se pierde.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function iniciar() {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    const P = window.AnluPedido;
    const store = P.store;
    const h = React.createElement;
    const { useState, useEffect, useRef, useCallback } = React;

    // ─── Colores y tipografías (tokens del design system, con respaldo) ─────
    const C = {
      violeta: 'var(--violet-700, #7D5BA6)',
      violetaOscuro: '#4A2E63',
      lila: 'var(--lilac-50, #F6EFFF)',
      lilaClaro: '#EDE1FF',
      crema: '#FDF6EE',
      dorado: '#B8942B',
      titulo: 'var(--text-heading, #2E2434)',
      cuerpo: 'var(--text-body, #4B4055)',
      suave: 'var(--text-muted, #6F6379)',
      borde: 'var(--border-subtle, #E7DFF0)',
      gris: '#B3AABB',
      grisFondo: '#F4F1F6',
      error: '#B3261E',
      fondoError: '#FDECEA',
      blanco: '#FFFFFF',
    };
    const F = {
      display: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
      sans: "var(--font-sans, 'Jost', Arial, sans-serif)",
    };
    const eyebrow = { fontFamily: F.sans, fontSize: 10, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase' };

    // ─── Íconos (inline, sin depender de servicios externos) ────────────────
    const ICONOS = {
      x: 'M18 6 6 18M6 6l12 12',
      menos: 'M5 12h14',
      mas: 'M12 5v14M5 12h14',
      check: 'M20 6 9 17l-5-5',
      bolsa: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
      izq: 'm15 18-6-6 6-6',
      der: 'm9 18 6-6-6-6',
    };
    const Icono = ({ nombre, size = 18, color = 'currentColor' }) =>
      h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', style: { display: 'block', flex: '0 0 auto' } },
      h('path', { d: ICONOS[nombre] }));
    const WhatsApp = ({ size = 16, color = '#FFFFFF' }) =>
      h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: color, 'aria-hidden': 'true', style: { display: 'block', flex: '0 0 auto' } },
        h('path', { d: 'M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z' }));

    // ─── Store → React ──────────────────────────────────────────────────────
    function usePedido() {
      const [, forzar] = useState(0);
      useEffect(() => store.subscribe(() => forzar((n) => n + 1)), []);
      return store;
    }

    // Canal chico entre piezas: abrir el panel del pedido y mostrar un aviso
    const ui = (() => {
      const oyentes = new Set();
      return {
        on: (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); },
        emitir: (evento) => oyentes.forEach((fn) => fn(evento)),
      };
    })();
    const abrirPedido = (motivo) => ui.emitir({ tipo: 'abrir', motivo });
    const avisar = (texto, conBoton) => ui.emitir({ tipo: 'aviso', texto, conBoton });

    // Bloquear el scroll de la página mientras hay una ventana abierta
    let bloqueos = 0;
    function useBloquearScroll(activo) {
      useEffect(() => {
        if (!activo) return undefined;
        bloqueos += 1;
        document.documentElement.style.overflow = 'hidden';
        return () => {
          bloqueos -= 1;
          if (bloqueos === 0) document.documentElement.style.overflow = '';
        };
      }, [activo]);
    }
    function useEscape(activo, fn) {
      useEffect(() => {
        if (!activo) return undefined;
        const tecla = (e) => { if (e.key === 'Escape') fn(); };
        window.addEventListener('keydown', tecla);
        return () => window.removeEventListener('keydown', tecla);
      }, [activo, fn]);
    }
    const portal = (nodo) => (ReactDOM && ReactDOM.createPortal ? ReactDOM.createPortal(nodo, document.body) : nodo);

    // ─── Piezas chicas ──────────────────────────────────────────────────────
    function Precio({ final, antes, descuento, grande, sufijo }) {
      return h('div', { style: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 8px' } },
        antes ? h('span', { style: { textDecoration: 'line-through', color: C.suave, fontFamily: F.sans, fontSize: grande ? 14 : 12 } }, P.formatPrecio(antes)) : null,
        h('span', { style: { fontFamily: F.display, fontSize: grande ? 26 : 20, color: C.violeta, lineHeight: 1.1 } }, P.formatPrecio(final),
          h('span', { style: { fontFamily: F.sans, fontSize: 11, color: C.suave, marginLeft: 4 } }, sufijo || 'COP')),
        descuento ? h(Etiqueta, null, '-' + descuento + '%') : null);
    }
    const Etiqueta = ({ children, tono }) =>
      h('span', { style: { ...eyebrow, letterSpacing: '.08em', fontSize: 10, padding: '3px 7px', borderRadius: 4, whiteSpace: 'nowrap',
        background: tono === 'dorado' ? '#FBF3DC' : C.violeta, color: tono === 'dorado' ? C.dorado : C.blanco } }, children);

    function Stepper({ valor, min = 1, max = 99, onCambiar, etiqueta }) {
      const boton = (icono, nuevo, deshabilitado, aria) => h('button', {
        type: 'button', 'aria-label': aria, disabled: deshabilitado, onClick: () => onCambiar(nuevo),
        style: { width: 40, height: 44, border: 0, background: 'transparent', cursor: deshabilitado ? 'default' : 'pointer',
          color: deshabilitado ? C.gris : C.violeta, display: 'grid', placeItems: 'center' },
      }, h(Icono, { nombre: icono, size: 16 }));
      return h('div', { role: 'group', 'aria-label': etiqueta,
        style: { display: 'inline-flex', alignItems: 'center', border: '1px solid ' + C.borde, borderRadius: 8, background: C.blanco } },
        boton('menos', Math.max(min, valor - 1), valor <= min, 'Uno menos'),
        h('span', { 'aria-live': 'polite', style: { minWidth: 28, textAlign: 'center', fontFamily: F.sans, fontSize: 15, color: C.titulo } }, valor),
        boton('mas', Math.min(max, valor + 1), valor >= max, 'Uno más'));
    }

    function BotonPrincipal({ children, onClick, deshabilitado, secundario, chico, tipoWhatsApp, estilo }) {
      return h('button', {
        type: 'button', onClick, disabled: deshabilitado,
        style: {
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: chico ? 40 : 48,
          padding: chico ? '8px 6px' : '12px 18px', borderRadius: 8, cursor: deshabilitado ? 'not-allowed' : 'pointer',
          fontFamily: F.sans, fontSize: chico ? 11 : 12, fontWeight: 500, letterSpacing: chico ? '.05em' : '.08em', textTransform: 'uppercase',
          lineHeight: 1.2, textAlign: 'center',
          border: '1px solid ' + (secundario && !deshabilitado ? C.violeta : deshabilitado && secundario ? C.borde : 'transparent'),
          background: deshabilitado ? C.grisFondo : secundario ? C.blanco : C.violeta,
          color: deshabilitado ? C.gris : secundario ? C.violeta : C.blanco,
          ...estilo,
        },
      }, tipoWhatsApp && !deshabilitado ? h(WhatsApp, { color: secundario ? '#7D5BA6' : '#FFFFFF' }) : null, children);
    }

    /** Botón chico de color o talla. Sin stock: gris y tachado. */
    function Opcion({ texto, elegida, agotada, onElegir, deshabilitada, motivo }) {
      const porque = motivo || (agotada ? 'agotado' : '');
      return h('button', {
        type: 'button', 'aria-pressed': elegida, disabled: deshabilitada,
        'aria-label': texto + (porque ? ' (' + porque + ')' : ''), title: porque ? porque.charAt(0).toUpperCase() + porque.slice(1) : texto, onClick: onElegir,
        style: {
          minHeight: 44, minWidth: 48, padding: '0 14px', borderRadius: 8, fontFamily: F.sans, fontSize: 13, fontWeight: 500,
          cursor: deshabilitada ? 'not-allowed' : 'pointer', textDecoration: agotada ? 'line-through' : 'none',
          border: '1px solid ' + (elegida ? C.violeta : C.borde),
          background: elegida ? (agotada ? C.grisFondo : C.violeta) : agotada ? C.grisFondo : C.blanco,
          color: elegida && !agotada ? C.blanco : agotada ? C.gris : C.cuerpo,
          boxShadow: elegida && agotada ? 'inset 0 0 0 1px ' + C.violeta : 'none',
        },
      }, texto);
    }

    // ─── Galería deslizable ─────────────────────────────────────────────────
    function Galeria({ imagenes, nombre }) {
      const [actual, setActual] = useState(0);
      const ref = useRef(null);
      const total = imagenes.length;
      useEffect(() => {
        setActual(0);
        if (ref.current) ref.current.scrollLeft = 0;
      }, [imagenes.join('|')]);
      const alDeslizar = () => {
        const el = ref.current;
        if (!el || !el.clientWidth) return;
        setActual(Math.round(el.scrollLeft / el.clientWidth));
      };
      const ir = (i) => {
        const el = ref.current;
        if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
      };
      if (total === 0) {
        return h('div', { style: { aspectRatio: '4 / 5', maxHeight: '42vh', background: C.lila, display: 'grid', placeItems: 'center', color: C.suave, fontFamily: F.sans, fontSize: 13 } }, 'Sin fotos');
      }
      const flecha = (dir) => h('button', {
        type: 'button', 'aria-label': dir === 'izq' ? 'Foto anterior' : 'Foto siguiente',
        onClick: () => ir(dir === 'izq' ? Math.max(0, actual - 1) : Math.min(total - 1, actual + 1)),
        style: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'izq' ? 'left' : 'right']: 8,
          width: 36, height: 36, borderRadius: '50%', border: 0, background: 'rgba(255,255,255,.9)', boxShadow: '0 2px 8px rgba(46,36,52,.15)',
          display: (dir === 'izq' ? actual === 0 : actual === total - 1) ? 'none' : 'grid', placeItems: 'center', cursor: 'pointer', color: C.violeta },
      }, h(Icono, { nombre: dir, size: 18 }));
      return h('div', { style: { position: 'relative' } },
        h('div', {
          ref, onScroll: alDeslizar, 'aria-label': 'Fotos de ' + nombre, role: 'region',
          style: { display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', background: C.lila },
        }, imagenes.map((src, i) => h('img', {
          key: src + i, src, alt: nombre + ' — foto ' + (i + 1) + ' de ' + total, loading: i === 0 ? 'eager' : 'lazy', draggable: false,
          style: { flex: '0 0 100%', width: '100%', aspectRatio: '4 / 5', maxHeight: '42vh', objectFit: 'contain', scrollSnapAlign: 'start', display: 'block' },
        }))),
        total > 1 ? flecha('izq') : null,
        total > 1 ? flecha('der') : null,
        total > 1 ? h('span', { style: { position: 'absolute', right: 10, bottom: 10, background: 'rgba(46,36,52,.62)', color: '#fff',
          borderRadius: 999, padding: '3px 9px', fontFamily: F.sans, fontSize: 11 } }, (actual + 1) + ' / ' + total) : null,
        total > 1 && total <= 12 ? h('div', { 'aria-hidden': 'true', style: { position: 'absolute', left: 0, right: 0, bottom: 12, display: 'flex', justifyContent: 'center', gap: 5, pointerEvents: 'none' } },
          imagenes.map((_, i) => h('span', { key: i, style: { width: i === actual ? 16 : 6, height: 6, borderRadius: 3, background: i === actual ? C.violeta : 'rgba(255,255,255,.85)', transition: 'width .2s' } }))) : null);
    }

    // ─── Hoja/ventana base ──────────────────────────────────────────────────
    function Hoja({ abierta, titulo, subtitulo, onCerrar, children, pie, ancho = 480, lateral }) {
      useBloquearScroll(abierta);
      useEscape(abierta, onCerrar);
      if (!abierta) return null;
      // En el celular la ventana sube desde abajo; en pantallas grandes queda centrada
      const centrada = !lateral && typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 640px)').matches;
      return portal(h('div', {
        onClick: onCerrar,
        style: { position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(46,36,52,.45)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: lateral ? 'stretch' : centrada ? 'center' : 'flex-end', justifyContent: lateral ? 'flex-end' : 'center',
          padding: centrada ? 24 : 0 },
      }, h('section', {
        role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo, onClick: (e) => e.stopPropagation(),
        style: {
          width: lateral ? ancho : '100%', maxWidth: lateral ? '100vw' : ancho, background: C.blanco,
          height: lateral ? '100%' : 'auto',
          borderRadius: lateral ? 0 : centrada ? 16 : '16px 16px 0 0', boxShadow: '0 -8px 30px rgba(46,36,52,.18)',
          maxHeight: lateral ? '100%' : centrada ? '90vh' : '94vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: F.sans, color: C.cuerpo,
        },
      },
      h('header', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 16px', borderBottom: '1px solid ' + C.borde } },
        h('div', { style: { flex: 1, minWidth: 0 } },
          subtitulo ? h('div', { style: { ...eyebrow, color: C.violeta } }, subtitulo) : null,
          h('h2', { style: { margin: 0, fontFamily: F.display, fontWeight: 400, fontSize: 22, lineHeight: 1.2, color: C.titulo, overflowWrap: 'anywhere' } }, titulo)),
        h('button', { type: 'button', onClick: onCerrar, 'aria-label': 'Cerrar',
          style: { width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.suave } },
        h(Icono, { nombre: 'x', size: 20 }))),
      h('div', { style: { overflowY: 'auto', flex: 1, overscrollBehavior: 'contain' } }, children),
      pie ? h('footer', { style: { borderTop: '1px solid ' + C.borde, padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', background: C.crema, display: 'grid', gap: 8 } }, pie) : null)));
    }

    // ─── Ventana de una prenda: galería + color + talla + cantidad ──────────
    // Para AGREGAR al pedido cuenta lo que queda (stock − lo que ya está en el pedido).
    // "Comprar ahora" manda solo esa prenda, así que mira el stock entero.
    function opcionesConLibre(prenda, modo) {
      return prenda.colores.map((c) => {
        const tallas = c.tallas.map((t) => {
          const libre = t.stock === 0 ? 0 : store.libre(prenda.id, c.nombre, t.nombre);
          const enPedido = t.stock !== 0 && libre === 0;
          return { ...t, libre, enPedido, bloqueada: t.stock === 0 || (modo === 'agregar' && enPedido) };
        });
        return { ...c, tallas, sinLibre: tallas.every((t) => t.stock === 0 || t.enPedido) };
      });
    }

    function primerDisponible(colores, modo) {
      const usable = (t) => t.stock !== 0 && (modo === 'comprar' || !t.enPedido);
      const color = colores.find((c) => c.tallas.some(usable)) || colores.find((c) => !c.agotado) || colores[0];
      if (!color) return { color: '', talla: '' };
      const disponibles = color.tallas.filter(usable);
      return { color: color.nombre, talla: disponibles.length === 1 ? disponibles[0].nombre : '' };
    }

    /** "La única que queda ya está en tu pedido." o "Todo lo que queda de Negro ya está en tu pedido." */
    function avisoEnPedido(colorObj) {
      const total = colorObj.tallas.reduce((n, t) => n + (t.stock || 0), 0);
      return total === 1 ? 'La única que queda ya está en tu pedido.' : 'Todo lo que queda de ' + colorObj.nombre + ' ya está en tu pedido.';
    }

    function OpcionesPrenda({ prenda, modo, onCerrar }) {
      const colores = opcionesConLibre(prenda, modo);
      const [inicial] = useState(() => primerDisponible(colores, modo));
      const [color, setColor] = useState(inicial.color);
      const [talla, setTalla] = useState(inicial.talla);
      const [cantidad, setCantidad] = useState(1);
      const colorObj = colores.find((c) => c.nombre === color);
      const tallaObj = colorObj ? colorObj.tallas.find((t) => t.nombre === talla) : undefined;
      const tope = (n) => (n === null || n === undefined ? P.SIN_LIMITE : Math.max(1, n));
      const max = !tallaObj ? P.SIN_LIMITE : modo === 'comprar' ? tope(tallaObj.stock) : tope(tallaObj.libre);
      const puedeAgregar = !!(tallaObj && tallaObj.stock !== 0 && tallaObj.libre !== 0);
      const puedeComprar = !!(tallaObj && tallaObj.stock !== 0);
      useEffect(() => { if (cantidad > max) setCantidad(max); }, [max]);

      const elegirColor = (c) => {
        setColor(c.nombre);
        const usable = (t) => !t.bloqueada && t.stock !== 0;
        const sigue = c.tallas.find((t) => t.nombre === talla && usable(t));
        const disponibles = c.tallas.filter(usable);
        setTalla(sigue ? sigue.nombre : disponibles.length === 1 ? disponibles[0].nombre : '');
      };
      const agregar = () => {
        store.agregarPrenda({ id: prenda.id, color, talla, cantidad });
        onCerrar();
        avisar('Agregaste ' + prenda.nombre + ' a tu pedido.', true);
      };
      const comprar = () => {
        const linea = [{ tipo: 'prenda', uid: 'x', id: prenda.id, color, talla, cantidad }];
        window.open(P.enlaceWhatsApp(P.mensaje(linea, store.indice())), '_blank', 'noopener');
        onCerrar();
      };
      const textoComprar = !colorObj || colorObj.agotado ? 'Agotado en este color' : !talla ? 'Elige una talla' : null;
      const textoAgregar = !colorObj || colorObj.agotado ? 'Agotado en este color'
        : (tallaObj && tallaObj.enPedido) || (!talla && colorObj.sinLibre) ? 'Ya está en tu pedido'
          : !talla ? 'Elige una talla' : null;
      const pie = prenda.agotado
        ? h(BotonPrincipal, { deshabilitado: true }, 'Agotado')
        : [
          modo !== 'comprar' ? h(BotonPrincipal, { key: 'a', onClick: agregar, deshabilitado: !puedeAgregar }, textoAgregar || 'Agregar al pedido') : null,
          modo !== 'agregar' ? h(BotonPrincipal, { key: 'c', onClick: comprar, deshabilitado: !puedeComprar, secundario: modo === 'ver', tipoWhatsApp: true },
            textoComprar && modo === 'comprar' ? textoComprar : 'Comprar ahora por WhatsApp') : null,
        ];
      const quedan = tallaObj ? (modo === 'comprar' ? tallaObj.stock : tallaObj.libre) : null;

      return h(Hoja, { abierta: true, titulo: prenda.nombre, subtitulo: prenda.categoria, onCerrar, pie },
        // key = color: al cambiar de color la galería arranca de cero (sin mostrar la posición anterior)
        h(Galeria, { key: color || '-', imagenes: colorObj ? colorObj.imagenes : [], nombre: prenda.nombre + (color ? ' ' + color : '') }),
        h('div', { style: { padding: 16, display: 'grid', gap: 16 } },
          h(Precio, { final: prenda.precioFinal, antes: prenda.descuento ? prenda.precio : 0, descuento: prenda.descuento, grande: true }),
          prenda.descripcion ? h('p', { style: { margin: 0, fontSize: 14, lineHeight: 1.6, color: C.suave, fontWeight: 300 } }, prenda.descripcion) : null,
          h('div', { style: { display: 'grid', gap: 8 } },
            h('div', { style: { ...eyebrow, color: C.suave } }, 'Color' + (color ? ' · ' + color : '') + (colorObj && colorObj.agotado ? ' (agotado)' : '')),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
              colores.map((c) => h(Opcion, {
                key: c.nombre, texto: c.nombre, elegida: c.nombre === color,
                agotada: c.agotado || (modo === 'agregar' && c.sinLibre),
                motivo: !c.agotado && modo === 'agregar' && c.sinLibre ? 'ya en tu pedido' : '',
                onElegir: () => elegirColor(c),
              })))),
          colorObj ? h('div', { style: { display: 'grid', gap: 8 } },
            h('div', { style: { ...eyebrow, color: C.suave } }, 'Talla'),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
              colorObj.tallas.map((t) => h(Opcion, {
                key: t.nombre, texto: t.nombre, elegida: t.nombre === talla,
                agotada: t.bloqueada, deshabilitada: t.bloqueada,
                motivo: t.stock !== 0 && t.enPedido && modo === 'agregar' ? 'ya en tu pedido' : '',
                onElegir: () => setTalla(t.nombre),
              }))),
            // Avisos de stock: si todo lo que queda del color ya está en el pedido, lo dice una vez
            modo !== 'comprar' && colorObj.sinLibre && !colorObj.agotado
              ? h('span', { style: { fontSize: 12, color: C.violeta } }, avisoEnPedido(colorObj))
              : tallaObj && tallaObj.enPedido && modo !== 'comprar'
                ? h('span', { style: { fontSize: 12, color: C.violeta } },
                  tallaObj.stock === 1 ? 'La única que queda ya está en tu pedido.' : 'Las ' + tallaObj.stock + ' que quedan ya están en tu pedido.')
                : quedan !== null && quedan > 0 && quedan <= 3
                  ? h('span', { style: { fontSize: 12, color: C.dorado } }, quedan === 1 ? '¡Queda 1!' : '¡Quedan ' + quedan + '!')
                  : null) : null,
          !prenda.agotado ? h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },
            h('span', { style: { ...eyebrow, color: C.suave } }, 'Cantidad'),
            h(Stepper, { valor: cantidad, max, onCambiar: setCantidad, etiqueta: 'Cantidad' })) : null));
    }

    // ─── Tarjeta de prenda ──────────────────────────────────────────────────
    function ProductCard({ productoId, highlight }) {
      const s = usePedido();
      const [modo, setModo] = useState(null); // 'agregar' | 'comprar' | 'ver'
      const [hover, setHover] = useState(false);
      const prenda = s.indice().prendas.get(String(productoId));
      if (!prenda) return null;
      const enPedido = s.unidadesDePrenda(prenda.id);
      const queda = s.quedaParaAgregar(prenda.id); // stock − lo que ya está en el pedido
      const resaltada = highlight === true || highlight === 'true';
      const coloresConStock = prenda.colores.filter((c) => !c.agotado).length;
      const resumenColores = prenda.colores.length > 1
        ? (coloresConStock === prenda.colores.length ? prenda.colores.length + ' colores' : coloresConStock + ' de ' + prenda.colores.length + ' colores disponibles')
        : '';
      const badge = prenda.agotado ? null : prenda.descuento ? '-' + prenda.descuento + '%' : prenda.nuevo ? 'Nuevo' : null;

      return h('article', {
        onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
        style: {
          background: C.blanco, border: '1px solid ' + (resaltada || enPedido ? C.violeta : C.borde), borderRadius: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', height: '100%', fontFamily: F.sans,
          boxShadow: resaltada ? '0 0 0 4px rgba(180,154,209,.45), 0 10px 30px rgba(74,46,99,.18)' : hover && !prenda.agotado ? '0 8px 24px rgba(74,46,99,.12)' : '0 2px 10px rgba(74,46,99,.06)',
          transition: 'box-shadow .24s, border-color .24s',
        },
      },
      h('button', {
        type: 'button', onClick: () => setModo('ver'), 'aria-label': 'Ver fotos de ' + prenda.nombre,
        style: { position: 'relative', display: 'block', width: '100%', padding: 0, border: 0, background: C.lila, cursor: 'zoom-in', aspectRatio: '3 / 4', overflow: 'hidden' },
      },
      prenda.portada
        ? h('img', { src: prenda.portada, alt: prenda.nombre, loading: 'lazy', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: prenda.agotado ? 0.55 : 1 } })
        : h('span', { style: { display: 'grid', placeItems: 'center', height: '100%', color: C.suave, fontSize: 12 } }, prenda.nombre),
      badge ? h('span', { style: { position: 'absolute', top: 10, left: 10 } }, h(Etiqueta, null, badge)) : null,
      enPedido ? h('span', { style: { position: 'absolute', top: 10, right: 10, display: 'inline-flex', alignItems: 'center', gap: 4, background: C.violeta, color: '#fff',
        borderRadius: 999, padding: '4px 8px', fontSize: 11, boxShadow: '0 2px 6px rgba(46,36,52,.2)' } }, h(Icono, { nombre: 'check', size: 12, color: '#fff' }), enPedido) : null,
      h('span', { style: { position: 'absolute', bottom: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.92)',
        borderRadius: 999, padding: '4px 10px', ...eyebrow, color: prenda.agotado ? C.suave : C.violeta } },
      h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: prenda.agotado ? C.gris : C.violeta } }), prenda.agotado ? 'Agotado' : 'Disponible')),
      h('div', { style: { padding: 14, display: 'grid', gap: 6, flex: 1, alignContent: 'start' } },
        prenda.categoria ? h('span', { style: { ...eyebrow, color: C.suave } }, prenda.categoria) : null,
        h('h3', { style: { margin: 0, fontFamily: F.sans, fontSize: 15, fontWeight: 400, lineHeight: 1.35, color: C.titulo } }, prenda.nombre),
        h(Precio, { final: prenda.precioFinal, antes: prenda.descuento ? prenda.precio : 0 }),
        resumenColores ? h('span', { style: { fontSize: 12, color: C.suave } }, resumenColores) : null),
      h('div', { style: { padding: '0 14px 14px', display: 'grid', gap: 8 } },
        h(BotonPrincipal, { onClick: () => setModo('comprar'), deshabilitado: prenda.agotado, tipoWhatsApp: true, chico: true }, 'Comprar'),
        h(BotonPrincipal, { onClick: () => setModo('agregar'), deshabilitado: prenda.agotado || !queda, secundario: true, chico: true },
          !queda && !prenda.agotado ? 'Ya está en tu pedido' : enPedido ? 'Agregar otra' : 'Agregar al pedido')),
      modo ? h(OpcionesPrenda, { prenda, modo, onCerrar: () => setModo(null) }) : null);
    }

    // ─── Combo: botones y ventana para elegir cada pieza ────────────────────
    /** Demanda de las piezas del combo que se está armando, menos la pieza `excepto`. */
    function demandaPiezas(piezas, excepto) {
      const mapa = new Map();
      piezas.forEach((p, k) => {
        if (k === excepto || !p.color || !p.talla) return;
        const clave = P.claveVariante(p.prendaId, p.color, p.talla);
        mapa.set(clave, (mapa.get(clave) || 0) + 1);
      });
      return mapa;
    }

    /** Opciones de una pieza con lo que queda (stock − pedido − las otras piezas de este combo). */
    function opcionesPiezaLibres(prenda, pieza, extra) {
      return P.opcionesPieza(prenda, pieza).map((c) => {
        const tallas = c.tallas.map((t) => {
          const libre = t.stock === 0 ? 0 : store.libre(pieza.prendaId, c.nombre, t.nombre, extra);
          return { ...t, libre, enPedido: t.stock !== 0 && libre === 0, bloqueada: t.stock === 0 || libre === 0 };
        });
        return { ...c, tallas, bloqueado: tallas.every((t) => t.bloqueada) };
      });
    }

    function ElegirPieza({ prenda, pieza, valor, onCambiar, numero, extra }) {
      const opciones = opcionesPiezaLibres(prenda, pieza, extra);
      const colorObj = opciones.find((c) => c.nombre === valor.color);
      return h('div', { style: { display: 'grid', gap: 8, padding: '12px 0', borderTop: '1px solid ' + C.borde } },
        h('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
          h(Miniatura, { src: (colorObj && colorObj.imagenes[0]) || (prenda && prenda.portada) }),
          h('div', null,
            h('div', { style: { fontSize: 14, color: C.titulo } }, pieza.nombre + (numero ? ' (' + numero + ')' : '')),
            h('div', { style: { fontSize: 12, color: C.suave } }, valor.color && valor.talla ? valor.color + ' · Talla ' + valor.talla : 'Elige color y talla'))),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          opciones.map((c) => h(Opcion, { key: c.nombre, texto: c.nombre, elegida: c.nombre === valor.color, agotada: c.bloqueado,
            motivo: c.bloqueado && !c.agotado ? 'ya en tu pedido' : '',
            onElegir: () => {
              const sigue = c.tallas.find((t) => t.nombre === valor.talla && !t.bloqueada);
              const disp = c.tallas.filter((t) => !t.bloqueada);
              onCambiar({ color: c.nombre, talla: sigue ? sigue.nombre : disp.length === 1 ? disp[0].nombre : '' });
            } }))),
        colorObj ? h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          colorObj.tallas.map((t) => h(Opcion, { key: t.nombre, texto: t.nombre, elegida: t.nombre === valor.talla,
            agotada: t.bloqueada, deshabilitada: t.bloqueada, motivo: t.enPedido ? 'ya en tu pedido' : '',
            onElegir: () => onCambiar({ color: valor.color, talla: t.nombre }) }))) : null);
    }

    /** Si una pieza tiene una sola opción posible, se elige sola (contando lo que ya se usó). */
    function piezasIniciales(combo, indice) {
      const elegidas = [];
      P.unidadesCombo(combo).forEach((pieza, j) => {
        const extra = demandaPiezas(elegidas, -1);
        const opciones = opcionesPiezaLibres(indice.prendas.get(pieza.prendaId), pieza, extra).filter((c) => !c.bloqueado);
        let elegida = { prendaId: pieza.prendaId, color: '', talla: '' };
        if (opciones.length === 1) {
          const disp = opciones[0].tallas.filter((t) => !t.bloqueada);
          elegida = { prendaId: pieza.prendaId, color: opciones[0].nombre, talla: disp.length === 1 ? disp[0].nombre : '' };
        }
        elegidas[j] = elegida;
      });
      return elegidas;
    }

    function OpcionesCombo({ combo, onCerrar }) {
      const indice = store.indice();
      const unidades = P.unidadesCombo(combo);
      const [piezas, setPiezas] = useState(() => piezasIniciales(combo, indice));
      const completo = piezas.every((p) => p.color && p.talla);
      const agregar = () => {
        store.agregarCombo({ comboId: combo.id, piezas });
        onCerrar();
        avisar('Agregaste el combo ' + combo.nombre + ' a tu pedido.', true);
      };
      const repetidas = {};
      return h(Hoja, {
        abierta: true, titulo: combo.nombre, subtitulo: 'Combo', onCerrar,
        pie: h(BotonPrincipal, { onClick: agregar, deshabilitado: !completo }, completo ? 'Agregar al pedido' : 'Elige color y talla de cada prenda'),
      },
      combo.imagen ? h('img', { src: combo.imagen, alt: combo.nombre, style: { width: '100%', aspectRatio: '4 / 5', maxHeight: '34vh', objectFit: 'contain', background: C.lila, display: 'block' } }) : null,
      h('div', { style: { padding: '16px 16px 4px', display: 'grid', gap: 6 } },
        h(Precio, { final: combo.precio, antes: combo.ahorro ? combo.precioSeparado : 0, grande: true }),
        combo.ahorro ? h('span', null, h(Etiqueta, { tono: 'dorado' }, 'Ahorras ' + P.formatPrecio(combo.ahorro))) : null,
        combo.descripcion ? h('p', { style: { margin: 0, fontSize: 14, color: C.suave, fontWeight: 300, lineHeight: 1.6 } }, combo.descripcion) : null),
      h('div', { style: { padding: '0 16px 16px' } },
        unidades.map((pieza, j) => {
          repetidas[pieza.prendaId] = (repetidas[pieza.prendaId] || 0) + 1;
          return h(ElegirPieza, {
            key: j, prenda: indice.prendas.get(pieza.prendaId), pieza, valor: piezas[j], extra: demandaPiezas(piezas, j),
            numero: pieza.cantidad > 1 ? repetidas[pieza.prendaId] + ' de ' + pieza.cantidad : '',
            onCambiar: (cambio) => setPiezas((ps) => ps.map((p, k) => (k === j ? { ...p, ...cambio } : p))),
          });
        })));
    }

    function BotonesCombo({ comboId }) {
      const s = usePedido();
      const [abierta, setAbierta] = useState(false);
      const combo = s.indice().combos.get(String(comboId));
      if (!combo) return null;
      const hayStock = P.comboDisponible(s.indice(), combo);
      const disponible = s.comboDisponible(combo); // descontando lo que ya está en el pedido
      const consulta = P.enlaceWhatsApp('¡Hola Anlu! Me interesa el combo "' + combo.nombre + '". ¿Me confirmas disponibilidad y el envío?');
      return h('div', { style: { display: 'grid', gap: 6, width: '100%' } },
        h(BotonPrincipal, { onClick: () => setAbierta(true), deshabilitado: !disponible },
          disponible ? 'Agregar al pedido' : hayStock ? 'Ya está en tu pedido' : 'Agotado'),
        h('a', { href: consulta, target: '_blank', rel: 'noopener noreferrer',
          style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, fontFamily: F.sans, fontSize: 12, color: C.violeta, textDecoration: 'underline' } },
        'Consultar por WhatsApp'),
        abierta ? h(OpcionesCombo, { combo, onCerrar: () => setAbierta(false) }) : null);
    }

    // ─── Pedido: barra de abajo + panel "Editar compra" ─────────────────────
    function Miniatura({ src }) {
      return h('div', { style: { width: 56, height: 70, borderRadius: 6, overflow: 'hidden', background: C.lila, flex: '0 0 auto' } },
        src ? h('img', { src, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }) : null);
    }

    function Selector({ etiqueta, valor, opciones, onCambiar, invalido }) {
      return h('label', { style: { display: 'grid', gap: 2, flex: '1 1 0', minWidth: 0 } },
        h('span', { style: { ...eyebrow, fontSize: 9, color: C.suave } }, etiqueta),
        h('select', {
          value: valor, onChange: (e) => onCambiar(e.target.value), 'aria-label': etiqueta,
          style: { height: 44, minWidth: 0, width: '100%', padding: '0 8px', borderRadius: 8, fontFamily: F.sans, fontSize: 14, color: C.titulo,
            border: '1px solid ' + (invalido ? C.error : C.borde), background: C.blanco },
        },
        valor ? null : h('option', { value: '' }, 'Elegir…'),
        opciones.map((o) => h('option', { key: o.valor, value: o.valor, disabled: o.agotada }, o.valor + (o.agotada ? ' (agotado)' : '')))));
    }

    /** Selectores de color y talla de una línea (o de una pieza de combo). */
    function SelectoresVariante({ colores, color, talla, onCambiar, invalido }) {
      const colorObj = colores.find((c) => P.clave(c.nombre) === P.clave(color));
      const elegirColor = (nuevo) => {
        const c = colores.find((x) => x.nombre === nuevo);
        const sigue = c && c.tallas.find((t) => P.clave(t.nombre) === P.clave(talla) && t.stock !== 0);
        const disp = c ? c.tallas.filter((t) => t.stock !== 0) : [];
        onCambiar({ color: nuevo, talla: sigue ? sigue.nombre : disp.length === 1 ? disp[0].nombre : '' });
      };
      return h('div', { style: { display: 'flex', gap: 8 } },
        h(Selector, { etiqueta: 'Color', valor: colorObj ? colorObj.nombre : '', invalido: invalido && !colorObj,
          opciones: colores.map((c) => ({ valor: c.nombre, agotada: c.agotado })), onCambiar: elegirColor }),
        h(Selector, { etiqueta: 'Talla', valor: colorObj && colorObj.tallas.some((t) => P.clave(t.nombre) === P.clave(talla)) ? colorObj.tallas.find((t) => P.clave(t.nombre) === P.clave(talla)).nombre : '',
          invalido: invalido && !talla,
          opciones: (colorObj ? colorObj.tallas : []).map((t) => ({ valor: t.nombre, agotada: t.stock === 0 })),
          onCambiar: (t) => onCambiar({ color: colorObj ? colorObj.nombre : color, talla: t }) }));
    }

    function Avisos({ lista }) {
      if (!lista || lista.length === 0) return null;
      return h('div', { role: 'alert', style: { display: 'grid', gap: 2, fontSize: 12, color: C.error, lineHeight: 1.4 } }, lista.map((t) => h('span', { key: t }, t)));
    }

    function BotonQuitar({ onClick, nombre }) {
      return h('button', { type: 'button', onClick, 'aria-label': 'Quitar ' + nombre,
        style: { width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.suave, flex: '0 0 auto' } },
      h(Icono, { nombre: 'x', size: 18 }));
    }

    function LineaPrenda({ linea, avisos }) {
      const s = store;
      const prenda = s.indice().prendas.get(linea.id);
      if (!prenda) {
        return h('div', { 'data-linea': linea.uid, style: { display: 'flex', gap: 10, padding: '14px 0', borderBottom: '1px solid ' + C.borde } },
          h('div', { style: { flex: 1 } }, h('div', { style: { fontSize: 14 } }, 'Prenda ' + linea.id), h(Avisos, { lista: avisos })),
          h(BotonQuitar, { onClick: () => s.quitar(linea.uid), nombre: 'esta prenda' }));
      }
      const colorObj = prenda.colores.find((c) => P.clave(c.nombre) === P.clave(linea.color));
      return h('div', { 'data-linea': linea.uid, style: { display: 'flex', gap: 10, padding: '14px 0', borderBottom: '1px solid ' + C.borde } },
        h(Miniatura, { src: (colorObj && colorObj.imagenes[0]) || prenda.portada }),
        h('div', { style: { flex: 1, minWidth: 0, display: 'grid', gap: 8 } },
          h('div', null,
            h('div', { style: { fontSize: 14, color: C.titulo, lineHeight: 1.35 } }, prenda.nombre),
            h(Precio, { final: prenda.precioFinal, antes: prenda.descuento ? prenda.precio : 0, descuento: prenda.descuento })),
          h(SelectoresVariante, { colores: prenda.colores, color: linea.color, talla: linea.talla, invalido: !!avisos,
            onCambiar: (cambio) => s.cambiarPrenda(linea.uid, cambio) }),
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } },
            h(Stepper, { valor: linea.cantidad, max: s.maxCantidad(linea.uid), etiqueta: 'Cantidad de ' + prenda.nombre, onCambiar: (n) => s.cambiarPrenda(linea.uid, { cantidad: n }) }),
            linea.cantidad > 1 ? h('span', { style: { fontSize: 13, color: C.cuerpo } }, P.formatPrecio(prenda.precioFinal * linea.cantidad)) : null),
          h(Avisos, { lista: avisos })),
        h(BotonQuitar, { onClick: () => s.quitar(linea.uid), nombre: prenda.nombre }));
    }

    function LineaCombo({ linea, avisos }) {
      const s = store;
      const indice = s.indice();
      const combo = indice.combos.get(linea.comboId);
      const caja = { margin: '14px 0', padding: '12px 0 4px 12px', background: C.lila, border: '1px solid ' + C.lilaClaro, borderRadius: 10 };
      if (!combo) {
        return h('div', { 'data-linea': linea.uid, style: { ...caja, display: 'flex' } },
          h('div', { style: { flex: 1 } }, h('div', { style: { fontSize: 14 } }, 'Combo'), h(Avisos, { lista: avisos })),
          h(BotonQuitar, { onClick: () => s.quitar(linea.uid), nombre: 'este combo' }));
      }
      const unidades = P.unidadesCombo(combo);
      const repetidas = {};
      return h('div', { 'data-linea': linea.uid, style: caja },
        h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 8 } },
          h('div', { style: { flex: 1, minWidth: 0, display: 'grid', gap: 4 } },
            h('span', { style: { ...eyebrow, color: C.violeta } }, 'Combo'),
            h('div', { style: { fontSize: 15, color: C.titulo } }, combo.nombre),
            h(Precio, { final: combo.precio, antes: combo.ahorro ? combo.precioSeparado : 0 }),
            combo.ahorro ? h('span', null, h(Etiqueta, { tono: 'dorado' }, 'Ahorras ' + P.formatPrecio(combo.ahorro * linea.cantidad))) : null),
          h(BotonQuitar, { onClick: () => s.quitar(linea.uid), nombre: 'el combo ' + combo.nombre })),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 8px 0' } },
          h(Stepper, { valor: linea.cantidad, max: s.maxCantidad(linea.uid), etiqueta: 'Cantidad del combo ' + combo.nombre, onCambiar: (n) => s.cambiarCombo(linea.uid, { cantidad: n }) }),
          linea.cantidad > 1 ? h('span', { style: { fontSize: 13 } }, P.formatPrecio(combo.precio * linea.cantidad)) : null),
        h('div', { style: { paddingRight: 12 } },
          unidades.map((pieza, j) => {
            const prenda = indice.prendas.get(pieza.prendaId);
            const valor = linea.piezas[j] || { color: '', talla: '' };
            const opciones = P.opcionesPieza(prenda, pieza);
            const colorObj = opciones.find((c) => P.clave(c.nombre) === P.clave(valor.color));
            repetidas[pieza.prendaId] = (repetidas[pieza.prendaId] || 0) + 1;
            return h('div', { key: j, style: { display: 'flex', gap: 10, padding: '10px 0', borderTop: '1px solid ' + C.lilaClaro } },
              h(Miniatura, { src: (colorObj && colorObj.imagenes[0]) || (prenda && prenda.portada) }),
              h('div', { style: { flex: 1, minWidth: 0, display: 'grid', gap: 6 } },
                h('div', { style: { fontSize: 13, color: C.titulo } }, pieza.nombre + (pieza.cantidad > 1 ? ' (' + repetidas[pieza.prendaId] + ' de ' + pieza.cantidad + ')' : '')),
                h(SelectoresVariante, { colores: opciones, color: valor.color, talla: valor.talla, invalido: !!avisos && (!valor.color || !valor.talla),
                  onCambiar: (cambio) => s.cambiarPieza(linea.uid, j, cambio) })));
          })),
        h('div', { style: { paddingRight: 12, paddingBottom: 8 } }, h(Avisos, { lista: avisos })));
    }

    function Toast({ aviso, onVer, onCerrar }) {
      useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(onCerrar, 3500);
        return () => clearTimeout(t);
      }, [aviso]);
      if (!aviso) return null;
      return portal(h('div', { role: 'status', style: {
        position: 'fixed', left: 16, right: 16, bottom: 'calc(88px + env(safe-area-inset-bottom))', zIndex: 95, margin: '0 auto', maxWidth: 440,
        background: C.violetaOscuro, color: '#fff', borderRadius: 10, padding: '10px 10px 10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 24px rgba(46,36,52,.25)', fontFamily: F.sans, fontSize: 13,
      } },
      h(Icono, { nombre: 'check', size: 16, color: '#fff' }),
      h('span', { style: { flex: 1 } }, aviso.texto),
      aviso.conBoton ? h('button', { type: 'button', onClick: onVer, style: { minHeight: 36, border: '1px solid rgba(255,255,255,.6)', background: 'transparent', color: '#fff',
        borderRadius: 6, padding: '0 10px', fontFamily: F.sans, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' } }, 'Ver pedido') : null));
    }

    function PedidoBar() {
      const s = usePedido();
      const [abierto, setAbierto] = useState(false);
      const [intento, setIntento] = useState(false);
      const [aviso, setAviso] = useState(null);
      const [confirmarVaciar, setConfirmarVaciar] = useState(false);
      const items = s.items();
      const unidades = s.unidades();
      const listo = s.catalogoListo();

      useEffect(() => ui.on((e) => {
        if (e.tipo === 'abrir') { setAviso(null); setAbierto(true); if (e.motivo === 'revisar') setIntento(true); }
        if (e.tipo === 'aviso') setAviso({ texto: e.texto, conBoton: e.conBoton, n: Date.now() });
      }), []);
      // Deja lugar abajo para que la barra no tape el pie de la página
      useEffect(() => {
        document.body.style.paddingBottom = items.length > 0 ? 'calc(80px + env(safe-area-inset-bottom))' : '';
        return () => { document.body.style.paddingBottom = ''; };
      }, [items.length > 0]);
      useEffect(() => { if (items.length === 0) { setAbierto(false); setIntento(false); } }, [items.length]);
      useEffect(() => { if (!abierto) setConfirmarVaciar(false); }, [abierto]);

      const cerrar = useCallback(() => setAbierto(false), []);
      const revision = listo ? s.revisar() : { ok: false, avisos: {} };
      const finalizar = () => {
        if (!revision.ok) {
          setAbierto(true);
          setIntento(true);
          setTimeout(() => {
            const primera = Object.keys(revision.avisos)[0];
            const el = primera && document.querySelector('[data-linea="' + primera + '"]');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 80);
          return;
        }
        window.open(s.enlace(), '_blank', 'noopener');
      };

      const toast = h(Toast, { aviso: abierto ? null : aviso, onCerrar: () => setAviso(null), onVer: () => { setAviso(null); setAbierto(true); } });
      if (items.length === 0) return toast;
      const t = listo ? s.totales() : { antes: 0, total: 0, ahorro: 0 };
      const prendas = items.filter((i) => i.tipo === 'prenda');
      const combos = items.filter((i) => i.tipo === 'combo');

      const barra = h('div', { style: {
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid ' + C.borde,
        boxShadow: '0 -6px 20px rgba(46,36,52,.08)', padding: '10px 16px calc(10px + env(safe-area-inset-bottom))', fontFamily: F.sans,
      } }, h('div', { style: { display: 'flex', gap: 10, maxWidth: 560, margin: '0 auto' } },
        h(BotonPrincipal, { onClick: () => { setAviso(null); setAbierto(true); }, secundario: true, estilo: { flex: '1 1 0', padding: '12px 6px', letterSpacing: '.04em', whiteSpace: 'nowrap' } }, 'Editar compra'),
        h(BotonPrincipal, { onClick: finalizar, deshabilitado: !listo, tipoWhatsApp: true, estilo: { flex: '1.35 1 0', padding: '12px 6px', letterSpacing: '.04em', whiteSpace: 'nowrap' } }, 'Finalizar compra (' + unidades + ')')));

      const pie = [
        h('div', { key: 't', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, lineHeight: 1.2 } },
          h('div', { style: { display: 'grid' } },
            h('span', { style: { ...eyebrow, fontSize: 11, color: C.titulo } }, 'Total'),
            t.ahorro > 0 ? h('span', { style: { fontSize: 12, color: C.dorado } }, 'Ahorras ' + P.formatPrecio(t.ahorro)) : null),
          h('div', { style: { textAlign: 'right' } },
            t.ahorro > 0 ? h('span', { style: { textDecoration: 'line-through', color: C.suave, fontSize: 13, marginRight: 8 } }, P.formatPrecio(t.antes)) : null,
            h('span', { style: { fontFamily: F.display, fontSize: 26, lineHeight: 1.1, color: C.violeta } }, P.formatPrecio(t.total)))),
        intento && !revision.ok ? h('div', { key: 'e', role: 'alert', style: { background: C.fondoError, color: C.error, borderRadius: 8, padding: '8px 10px', fontSize: 13 } },
          'Revisa lo marcado en rojo antes de enviar tu pedido.') : null,
        h(BotonPrincipal, { key: 'f', onClick: finalizar, deshabilitado: !listo, tipoWhatsApp: true }, 'Finalizar compra'),
        h('p', { key: 'n', style: { margin: 0, fontSize: 11, color: C.suave, textAlign: 'center' } }, 'Te llega todo en un solo mensaje de WhatsApp. Pagas contraentrega.'),
      ];
      const vaciar = confirmarVaciar
        ? h('div', { style: { display: 'flex', gap: 8, padding: '16px 0' } },
          h(BotonPrincipal, { onClick: () => setConfirmarVaciar(false), secundario: true, chico: true, estilo: { flex: 1 } }, 'No, seguir'),
          h(BotonPrincipal, { onClick: () => s.vaciar(), chico: true, estilo: { flex: 1, background: C.error } }, 'Sí, vaciar'))
        : h('button', { type: 'button', onClick: () => setConfirmarVaciar(true),
          style: { display: 'block', margin: '8px auto 12px', minHeight: 44, border: 0, background: 'transparent', color: C.suave, fontFamily: F.sans, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' } }, 'Vaciar pedido');

      return h(React.Fragment, null,
        abierto ? null : barra,
        toast,
        h(Hoja, { abierta: abierto, titulo: 'Tu pedido', subtitulo: unidades + (unidades === 1 ? ' prenda' : ' prendas'), onCerrar: cerrar, lateral: true, ancho: 440, pie },
          !listo ? h('p', { style: { padding: 16 } }, 'Cargando…') : h('div', { style: { padding: '0 16px 8px' } },
            prendas.map((l) => h(LineaPrenda, { key: l.uid, linea: l, avisos: revision.avisos[l.uid] })),
            combos.map((l) => h(LineaCombo, { key: l.uid, linea: l, avisos: revision.avisos[l.uid] })),
            vaciar)));
    }

    window.AnluTienda = { ProductCard, BotonesCombo, PedidoBar, abrirPedido };
  }

  // Espera a React (lo carga support.js) y a la lógica (js/pedido.js)
  (function esperar(intentos) {
    if (window.React && window.ReactDOM && window.AnluPedido) {
      try { iniciar(); } catch (e) { console.error('[AnluTienda] no se pudo iniciar', e); }
      return;
    }
    if (intentos < 400) setTimeout(() => esperar(intentos + 1), 25);
    else console.error('[AnluTienda] React o js/pedido.js no cargaron');
  })(0);
})();
