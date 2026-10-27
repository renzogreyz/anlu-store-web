/* ═══════════════════════════════════════════════════════════════
   Anlu Store — Lógica del pedido (sin nada visual)
   Doc: directivas/pedido_editable_SOP.md
   ───────────────────────────────────────────────────────────────
   - Normaliza el catalogo.json (el del panel y el viejo de la planilla)
     a prendas con colores, fotos y tallas con stock.
   - Guarda el pedido de la clienta (prendas y combos) en localStorage,
     para que siga ahí al pasar de Inicio a Tienda.
   - Calcula precios, descuentos, stock disponible, avisos y el mensaje
     de WhatsApp.
   Lo usa js/tienda-ui.js (lo visual). No depende de React.
═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const TELEFONO = '573126045120'; // sin + ni espacios (formato wa.me)
  const LS_KEY = 'anlu_pedido';
  const LS_KEY_VIEJA = 'anlu_seleccion'; // "Seleccionar" del sitio anterior
  const SIN_LIMITE = 99; // tope de cantidad cuando no sabemos el stock (JSON viejo)

  // ─── Texto ────────────────────────────────────────────────────────────────
  const sinAcentos = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const clave = (s) => sinAcentos(s == null ? '' : s).trim().toLowerCase();
  const aLista = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const unicos = (lista) => {
    const vistos = new Set();
    return lista.filter((x) => {
      const k = clave(x);
      if (!k || vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
  };
  const parseColores = (v) =>
    unicos(aLista(v).flatMap((x) => String(x == null ? '' : x).split(',')).map((s) => s.trim()));
  const TALLA_CORTA = /^(?:XXS|XS|S|M|L|XL|XXL|XXXL|\d{1,3})$/i;
  function parseTalles(v) {
    const out = [];
    aLista(v).forEach((x) => {
      const s = String(x == null ? '' : x).trim();
      if (!s) return;
      if (/[,\n\r]/.test(s)) {
        s.split(/[,\n\r]+/).forEach((t) => out.push(t.trim()));
        return;
      }
      // Solo con espacios se separa si TODAS las partes son tallas ("S M L").
      const partes = s.split(/\s+/);
      if (partes.length > 1 && partes.every((p) => TALLA_CORTA.test(p))) partes.forEach((p) => out.push(p));
      else out.push(s);
    });
    return unicos(out);
  }
  const parseImagenes = (v) =>
    aLista(v)
      .flatMap((x) => String(x == null ? '' : x).split(/[,\n\r]+/))
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//i.test(s));

  function formatPrecio(n) {
    return '$' + Math.round(Number(n) || 0).toLocaleString('es-CO');
  }

  // ─── Catálogo → prendas normalizadas ─────────────────────────────────────
  /**
   * Una prenda queda así:
   * { id, nombre, categoria, descripcion, nuevo, precio, precioFinal, descuento,
   *   colores: [{ nombre, imagenes, tallas: [{ nombre, stock }], agotado }],
   *   agotado, portada }
   * stock: número, o null si el JSON viejo no lo dice (se trata como "hay").
   */
  function normalizarPrenda(p) {
    const precio = Number(p.precio) || 0;
    const oferta = Number(p.precioOferta);
    const hayOferta = Number.isFinite(oferta) && oferta > 0 && oferta < precio;
    const precioFinal = hayOferta ? oferta : precio;
    const colores = [];

    aLista(p.variantes).forEach((v) => {
      if (!v) return;
      const nombres = parseColores(v.color);
      if (nombres.length === 0) nombres.push('Único');
      const imagenes = parseImagenes(v.imagenes);
      let tallas;
      if (Array.isArray(v.tallesDetalle) && v.tallesDetalle.length > 0) {
        // JSON del panel: todas las tallas con su stock
        tallas = v.tallesDetalle
          .filter((t) => t && String(t.talle == null ? '' : t.talle).trim())
          .map((t) => ({ nombre: String(t.talle).trim(), stock: Math.max(0, Number(t.stock) || 0) }));
      } else {
        // JSON viejo: solo las tallas con stock y el total del color
        const hay = !(Number(v.stock) <= 0);
        tallas = parseTalles(v.talles).map((t) => ({ nombre: t, stock: hay ? null : 0 }));
      }
      nombres.forEach((nombre) => {
        let color = colores.find((c) => clave(c.nombre) === clave(nombre));
        if (!color) {
          color = { nombre, imagenes: [], tallas: [] };
          colores.push(color);
        }
        imagenes.forEach((img) => { if (!color.imagenes.includes(img)) color.imagenes.push(img); });
        tallas.forEach((t) => {
          const ya = color.tallas.find((x) => clave(x.nombre) === clave(t.nombre));
          if (!ya) color.tallas.push({ nombre: t.nombre, stock: t.stock });
          else if (ya.stock !== null && t.stock !== null) ya.stock += t.stock;
          else ya.stock = ya.stock === 0 ? t.stock : ya.stock === null ? null : t.stock;
        });
      });
    });

    colores.forEach((c) => { c.agotado = c.tallas.every((t) => t.stock === 0); });
    const conStock = colores.find((c) => !c.agotado);
    const portadaDe = (c) => (c && c.imagenes[0]) || '';
    return {
      id: String(p.id),
      nombre: String(p.nombre || ''),
      categoria: String(p.categoria || ''),
      descripcion: p.descripcion ? String(p.descripcion) : '',
      nuevo: !!p.nuevo,
      precio,
      precioFinal,
      descuento: hayOferta ? Math.round(((precio - precioFinal) / precio) * 100) : 0,
      colores,
      agotado: colores.length === 0 || colores.every((c) => c.agotado),
      portada: portadaDe(conStock) || portadaDe(colores.find((c) => c.imagenes.length > 0)),
    };
  }

  /** Combo del catálogo → { id, nombre, ..., piezas: [{ prendaId, nombre, cantidad, colores, talles }] } */
  function normalizarCombo(c) {
    const precio = Number(c.precio) || 0;
    const separado = Number(c.precioSeparado) || 0;
    return {
      id: String(c.id),
      nombre: String(c.nombre || ''),
      descripcion: c.descripcion ? String(c.descripcion) : '',
      imagen: c.imagen || '',
      precio,
      precioSeparado: separado,
      ahorro: Math.max(0, separado - precio),
      piezas: aLista(c.productos).map((x) => ({
        prendaId: String(x.id),
        nombre: String(x.nombre || ''),
        cantidad: Math.max(1, Number(x.cantidad) || 1),
        colores: Array.isArray(x.colores) ? x.colores.map(String) : null, // null = todos
        talles: Array.isArray(x.talles) ? x.talles.map(String) : null,
      })),
    };
  }

  function crearIndice(catalogo) {
    const prendas = new Map();
    const combos = new Map();
    aLista(catalogo && catalogo.productos).forEach((p) => {
      if (p && p.id != null) prendas.set(String(p.id), normalizarPrenda(p));
    });
    aLista(catalogo && catalogo.combos).forEach((c) => {
      if (c && c.id != null) combos.set(String(c.id), normalizarCombo(c));
    });
    return { prendas, combos };
  }

  // ─── Stock ───────────────────────────────────────────────────────────────
  const colorDe = (prenda, color) => (prenda ? prenda.colores.find((c) => clave(c.nombre) === clave(color)) : undefined);
  const tallaDe = (colorObj, talla) => (colorObj ? colorObj.tallas.find((t) => clave(t.nombre) === clave(talla)) : undefined);

  /** Stock de una combinación: número, null (no sabemos: hay) o 0 si no existe. */
  function stockDe(prenda, color, talla) {
    const t = tallaDe(colorDe(prenda, color), talla);
    return t ? t.stock : 0;
  }

  /**
   * Colores y tallas que se pueden elegir para una pieza de un combo:
   * los de la prenda, filtrados por lo que entra en el combo (las tallas
   * que no entran no aparecen; las sin stock aparecen en gris).
   */
  function opcionesPieza(prenda, pieza) {
    if (!prenda) return [];
    const okColor = (n) => pieza.colores === null || pieza.colores.some((x) => clave(x) === clave(n));
    const okTalla = (n) => pieza.talles === null || pieza.talles.some((x) => clave(x) === clave(n));
    return prenda.colores
      .filter((c) => okColor(c.nombre))
      .map((c) => {
        const tallas = c.tallas.filter((t) => okTalla(t.nombre));
        return { nombre: c.nombre, imagenes: c.imagenes, tallas, agotado: tallas.every((t) => t.stock === 0) };
      })
      .filter((c) => c.tallas.length > 0);
  }

  /** Unidades sueltas de un combo (un body × 3 → tres piezas para elegir color y talla). */
  function unidadesCombo(combo) {
    const out = [];
    combo.piezas.forEach((pieza) => {
      for (let i = 0; i < pieza.cantidad; i++) out.push(pieza);
    });
    return out;
  }

  /**
   * ¿Se puede pedir el combo? Cada prenda tiene que existir y tener stock en lo que entra.
   * Con `items`, descuenta lo que ya está en el pedido (para no ofrecer lo que ya se eligió).
   */
  function comboDisponible(indice, combo, items) {
    if (!combo || combo.piezas.length === 0) return false;
    const pedida = items ? demanda(items) : new Map();
    return combo.piezas.every((pieza) => {
      const opciones = opcionesPieza(indice.prendas.get(pieza.prendaId), pieza);
      let total = 0;
      for (const c of opciones) for (const t of c.tallas) {
        if (t.stock === null) return true;
        total += Math.max(0, t.stock - (pedida.get(claveVariante(pieza.prendaId, c.nombre, t.nombre)) || 0));
      }
      return total >= pieza.cantidad;
    });
  }

  // ─── Pedido ──────────────────────────────────────────────────────────────
  let contador = 0;
  const nuevoUid = () => 'l' + Date.now().toString(36) + (contador++).toString(36);
  const claveVariante = (id, color, talla) => id + '|' + clave(color) + '|' + clave(talla);

  /** Suma una prenda. Si ya está con el mismo color y talla, suma la cantidad. */
  function agregarPrenda(items, { id, color, talla, cantidad }) {
    const n = Math.max(1, Number(cantidad) || 1);
    const k = claveVariante(id, color, talla);
    const ya = items.find((i) => i.tipo === 'prenda' && claveVariante(i.id, i.color, i.talla) === k);
    if (ya) return items.map((i) => (i === ya ? { ...i, cantidad: i.cantidad + n } : i));
    return [...items, { tipo: 'prenda', uid: nuevoUid(), id: String(id), color: color || '', talla: talla || '', cantidad: n }];
  }

  /** Suma un combo con lo elegido para cada pieza. Si es idéntico a uno que ya está, suma 1. */
  function agregarCombo(items, { comboId, piezas, cantidad }) {
    const n = Math.max(1, Number(cantidad) || 1);
    const firma = (ps) => ps.map((p) => claveVariante(p.prendaId, p.color, p.talla)).join(',');
    const ya = items.find((i) => i.tipo === 'combo' && i.comboId === comboId && firma(i.piezas) === firma(piezas));
    if (ya) return items.map((i) => (i === ya ? { ...i, cantidad: i.cantidad + n } : i));
    return [...items, {
      tipo: 'combo', uid: nuevoUid(), comboId: String(comboId), cantidad: n,
      piezas: piezas.map((p) => ({ prendaId: String(p.prendaId), color: p.color || '', talla: p.talla || '' })),
    }];
  }

  /**
   * Cambia color, talla o cantidad de una prenda del pedido.
   * Si el cambio la deja igual a otra línea, las junta.
   */
  function cambiarPrenda(items, uid, cambio) {
    const linea = items.find((i) => i.uid === uid);
    if (!linea) return items;
    const nueva = { ...linea, ...cambio };
    const k = claveVariante(nueva.id, nueva.color, nueva.talla);
    const otra = nueva.color && nueva.talla
      ? items.find((i) => i !== linea && i.tipo === 'prenda' && claveVariante(i.id, i.color, i.talla) === k)
      : undefined;
    if (otra) {
      return items
        .filter((i) => i !== linea)
        .map((i) => (i === otra ? { ...i, cantidad: i.cantidad + nueva.cantidad } : i));
    }
    return items.map((i) => (i === linea ? nueva : i));
  }

  function cambiarCombo(items, uid, cambio) {
    return items.map((i) => (i.uid === uid ? { ...i, ...cambio } : i));
  }

  function cambiarPieza(items, uid, posicion, cambio) {
    return items.map((i) => {
      if (i.uid !== uid) return i;
      const piezas = i.piezas.map((p, j) => (j === posicion ? { ...p, ...cambio } : p));
      return { ...i, piezas };
    });
  }

  const quitar = (items, uid) => items.filter((i) => i.uid !== uid);

  /** Cuántas prendas (unidades) hay en el pedido, contando las de los combos. */
  function contarUnidades(items, indice) {
    return items.reduce((total, i) => {
      if (i.tipo === 'prenda') return total + i.cantidad;
      const combo = indice && indice.combos.get(i.comboId);
      const porCombo = combo ? unidadesCombo(combo).length : i.piezas.length;
      return total + porCombo * i.cantidad;
    }, 0);
  }

  /** Cuántas unidades de cada combinación pide el pedido entero (prendas + combos). */
  function demanda(items) {
    const mapa = new Map();
    const sumar = (id, color, talla, n) => {
      if (!color || !talla) return;
      const k = claveVariante(id, color, talla);
      mapa.set(k, (mapa.get(k) || 0) + n);
    };
    items.forEach((i) => {
      if (i.tipo === 'prenda') sumar(i.id, i.color, i.talla, i.cantidad);
      else i.piezas.forEach((p) => sumar(p.prendaId, p.color, p.talla, i.cantidad));
    });
    return mapa;
  }

  /**
   * Cuántas quedan para agregar de una combinación: stock menos lo que ya pide
   * el pedido (y `extra`, otra demanda en curso, ej. las otras piezas de un combo
   * que se está armando). null = no sabemos el stock (JSON viejo): hay.
   */
  function libre(items, indice, prendaId, color, talla, extra) {
    const stock = stockDe(indice.prendas.get(String(prendaId)), color, talla);
    if (stock === null) return null;
    const k = claveVariante(String(prendaId), color, talla);
    const usado = (demanda(items).get(k) || 0) + ((extra && extra.get(k)) || 0);
    return Math.max(0, stock - usado);
  }

  /** ¿Queda algo de esta prenda para agregar al pedido? */
  function quedaParaAgregar(items, indice, prendaId) {
    const prenda = indice.prendas.get(String(prendaId));
    if (!prenda) return false;
    return prenda.colores.some((c) => c.tallas.some((t) => libre(items, indice, prenda.id, c.nombre, t.nombre) !== 0));
  }

  /** Cantidad máxima de una línea sin pasarse del stock (contando lo que piden las otras líneas). */
  function maxCantidad(items, indice, uid) {
    const linea = items.find((i) => i.uid === uid);
    if (!linea) return 1;
    const resto = demanda(items.filter((i) => i.uid !== uid));
    const tope = (prendaId, color, talla, porUnidad) => {
      const stock = stockDe(indice.prendas.get(prendaId), color, talla);
      if (stock === null) return SIN_LIMITE;
      const libre = stock - (resto.get(claveVariante(prendaId, color, talla)) || 0);
      return Math.floor(Math.max(0, libre) / porUnidad);
    };
    if (linea.tipo === 'prenda') {
      if (!linea.color || !linea.talla) return SIN_LIMITE;
      return Math.max(1, Math.min(SIN_LIMITE, tope(linea.id, linea.color, linea.talla, 1)));
    }
    const porVariante = new Map();
    linea.piezas.forEach((p) => {
      if (!p.color || !p.talla) return;
      const k = claveVariante(p.prendaId, p.color, p.talla);
      porVariante.set(k, { p, n: ((porVariante.get(k) || {}).n || 0) + 1 });
    });
    let max = SIN_LIMITE;
    porVariante.forEach(({ p, n }) => { max = Math.min(max, tope(p.prendaId, p.color, p.talla, n)); });
    return Math.max(1, max);
  }

  /**
   * Revisa el pedido contra el catálogo.
   * Devuelve { ok, avisos: { [uid]: ["texto", ...] } } con textos para la clienta.
   */
  function revisar(items, indice) {
    const avisos = {};
    const avisar = (uid, texto) => {
      avisos[uid] = avisos[uid] || [];
      if (!avisos[uid].includes(texto)) avisos[uid].push(texto);
    };
    const pedida = demanda(items);

    const revisarVariante = (uid, prendaId, color, talla) => {
      const prenda = indice.prendas.get(prendaId);
      if (!color || !talla) { avisar(uid, 'Elige color y talla.'); return; }
      const colorObj = colorDe(prenda, color);
      const tallaObj = tallaDe(colorObj, talla);
      if (!tallaObj) { avisar(uid, 'Ya no tenemos ' + color + ' en talla ' + talla + '. Elige otra opción.'); return; }
      if (tallaObj.stock === null) return;
      const n = pedida.get(claveVariante(prendaId, color, talla)) || 0;
      if (tallaObj.stock === 0) avisar(uid, 'Se agotó ' + colorObj.nombre + ' en talla ' + tallaObj.nombre + '.');
      else if (n > tallaObj.stock) {
        avisar(uid, 'Solo ' + (tallaObj.stock === 1 ? 'queda 1' : 'quedan ' + tallaObj.stock) +
          ' en ' + colorObj.nombre + ' talla ' + tallaObj.nombre + '.');
      }
    };

    items.forEach((i) => {
      if (i.tipo === 'prenda') {
        if (!indice.prendas.get(i.id)) { avisar(i.uid, 'Esta prenda ya no está disponible.'); return; }
        revisarVariante(i.uid, i.id, i.color, i.talla);
        return;
      }
      const combo = indice.combos.get(i.comboId);
      if (!combo) { avisar(i.uid, 'Este combo ya no está disponible.'); return; }
      const unidades = unidadesCombo(combo);
      if (unidades.length !== i.piezas.length || unidades.some((u, j) => u.prendaId !== i.piezas[j].prendaId)) {
        avisar(i.uid, 'Este combo cambió. Quítalo y vuelve a agregarlo.');
        return;
      }
      i.piezas.forEach((p, j) => {
        const prenda = indice.prendas.get(p.prendaId);
        if (!prenda) { avisar(i.uid, unidades[j].nombre + ' ya no está disponible.'); return; }
        const opciones = opcionesPieza(prenda, unidades[j]);
        const entra = opciones.some((c) => clave(c.nombre) === clave(p.color) && c.tallas.some((t) => clave(t.nombre) === clave(p.talla)));
        if (p.color && p.talla && !entra) { avisar(i.uid, p.color + ' talla ' + p.talla + ' no entra en este combo.'); return; }
        revisarVariante(i.uid, p.prendaId, p.color, p.talla);
      });
    });

    return { ok: items.length > 0 && Object.keys(avisos).length === 0, avisos };
  }

  /** Totales: lo que costaría sin descuentos, lo que se descuenta y el total a pagar. */
  function totales(items, indice) {
    let antes = 0;
    let total = 0;
    items.forEach((i) => {
      if (i.tipo === 'prenda') {
        const p = indice.prendas.get(i.id);
        if (!p) return;
        antes += p.precio * i.cantidad;
        total += p.precioFinal * i.cantidad;
      } else {
        const c = indice.combos.get(i.comboId);
        if (!c) return;
        antes += Math.max(c.precioSeparado, c.precio) * i.cantidad;
        total += c.precio * i.cantidad;
      }
    });
    return { antes, total, ahorro: Math.max(0, antes - total) };
  }

  /** Texto del mensaje de WhatsApp con todo el pedido. */
  function mensaje(items, indice) {
    const lineas = [];
    items.forEach((i) => {
      if (i.tipo === 'prenda') {
        const p = indice.prendas.get(i.id);
        if (!p) return;
        let txt = '• ' + i.cantidad + ' × ' + p.nombre + ' (' + p.id + ') — Color ' + i.color + ' — Talla ' + i.talla +
          ' — ' + formatPrecio(p.precioFinal) + (i.cantidad > 1 ? ' c/u' : '');
        if (p.descuento > 0) txt += ' (antes ' + formatPrecio(p.precio) + ', -' + p.descuento + '%)';
        lineas.push(txt);
        return;
      }
      const c = indice.combos.get(i.comboId);
      if (!c) return;
      lineas.push('• ' + i.cantidad + ' × Combo "' + c.nombre + '" — ' + formatPrecio(c.precio) + (i.cantidad > 1 ? ' c/u' : ''));
      const unidades = unidadesCombo(c);
      i.piezas.forEach((p, j) => {
        const nombre = (unidades[j] && unidades[j].nombre) || '';
        lineas.push('   - ' + nombre + ': ' + p.color + ', talla ' + p.talla);
      });
    });
    const t = totales(items, indice);
    let cierre = 'Total: ' + formatPrecio(t.total);
    if (t.ahorro > 0) cierre += ' (ahorro ' + formatPrecio(t.ahorro) + ')';
    return '¡Hola Anlu! Quiero hacer este pedido:\n\n' + lineas.join('\n') + '\n\n' + cierre +
      '\n\n¿Me confirmas disponibilidad y el envío, por favor?';
  }

  const enlaceWhatsApp = (texto) => 'https://wa.me/' + TELEFONO + '?text=' + encodeURIComponent(texto);

  // ─── Persistencia ────────────────────────────────────────────────────────
  function leerGuardado(storage) {
    try {
      const guardado = JSON.parse(storage.getItem(LS_KEY) || 'null');
      if (guardado && Array.isArray(guardado.items)) {
        return guardado.items.filter((i) => i && (i.tipo === 'prenda' ? i.id : i.tipo === 'combo' && i.comboId && Array.isArray(i.piezas)));
      }
      // Lo elegido con el botón "Seleccionar" del sitio anterior pasa al pedido
      const viejo = JSON.parse(storage.getItem(LS_KEY_VIEJA) || '[]');
      let items = [];
      if (Array.isArray(viejo)) {
        viejo.filter((x) => x && x.id).forEach((x) => {
          items = agregarPrenda(items, { id: x.id, color: x.color, talla: x.size, cantidad: 1 });
        });
      }
      return items;
    } catch (e) {
      return [];
    }
  }

  function guardar(storage, items) {
    try {
      storage.setItem(LS_KEY, JSON.stringify({ v: 1, items }));
      storage.removeItem(LS_KEY_VIEJA);
    } catch (e) { /* modo privado o almacenamiento lleno: el pedido vive solo en esta página */ }
  }

  // ─── Store compartido (todas las tarjetas, la barra y el panel) ──────────
  function crearStore(storage) {
    let items = storage ? leerGuardado(storage) : [];
    let indice = crearIndice(null);
    let catalogoListo = false;
    const oyentes = new Set();
    const avisar = () => oyentes.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    const set = (nuevos) => {
      items = nuevos;
      if (storage) guardar(storage, items);
      avisar();
    };
    return {
      subscribe(fn) { oyentes.add(fn); return () => oyentes.delete(fn); },
      setCatalogo(catalogo) { indice = crearIndice(catalogo); catalogoListo = true; avisar(); },
      catalogoListo: () => catalogoListo,
      indice: () => indice,
      items: () => items,
      agregarPrenda: (datos) => set(agregarPrenda(items, datos)),
      agregarCombo: (datos) => set(agregarCombo(items, datos)),
      cambiarPrenda: (uid, cambio) => set(cambiarPrenda(items, uid, cambio)),
      cambiarCombo: (uid, cambio) => set(cambiarCombo(items, uid, cambio)),
      cambiarPieza: (uid, j, cambio) => set(cambiarPieza(items, uid, j, cambio)),
      quitar: (uid) => set(quitar(items, uid)),
      vaciar: () => set([]),
      unidades: () => contarUnidades(items, indice),
      unidadesDePrenda: (id) => items.reduce((n, i) => n + (i.tipo === 'prenda' && i.id === String(id) ? i.cantidad : 0), 0),
      revisar: () => revisar(items, indice),
      totales: () => totales(items, indice),
      maxCantidad: (uid) => maxCantidad(items, indice, uid),
      libre: (id, color, talla, extra) => libre(items, indice, id, color, talla, extra),
      quedaParaAgregar: (id) => quedaParaAgregar(items, indice, id),
      comboDisponible: (combo) => comboDisponible(indice, combo, items),
      mensaje: () => mensaje(items, indice),
      enlace: () => enlaceWhatsApp(mensaje(items, indice)),
    };
  }

  const api = {
    TELEFONO, SIN_LIMITE,
    clave, formatPrecio, parseColores, parseTalles, parseImagenes,
    normalizarPrenda, normalizarCombo, crearIndice,
    stockDe, opcionesPieza, unidadesCombo, comboDisponible, libre, quedaParaAgregar, claveVariante,
    agregarPrenda, agregarCombo, cambiarPrenda, cambiarCombo, cambiarPieza, quitar,
    contarUnidades, demanda, maxCantidad, revisar, totales, mensaje, enlaceWhatsApp,
    leerGuardado, guardar, crearStore,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) {
    let storage = null;
    try { storage = root.localStorage; } catch (e) { storage = null; }
    api.store = crearStore(storage);
    root.AnluPedido = api;
  }
})(typeof window !== 'undefined' ? window : null);
