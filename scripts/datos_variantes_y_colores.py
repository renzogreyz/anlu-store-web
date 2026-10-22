"""Carga de datos tolerante (varios colores/talles/imagenes por celda) + círculos de color.

- index.html / tienda.html: helpers de normalización y uso en el mapeo de productos.
- _ds_bundle.js (copia raíz): talle único preseleccionado, lista ampliada de colores en
  español (sin distinguir mayúsculas/acentos) y fallback visible (borde + inicial).

Idempotente (cada edición tiene un marcador) y aborta un archivo si un texto no es único.
Solo toca la copia raíz de _ds/. No agrega ninguna línea que sobreescriba window.ANLU.phone.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUNDLE = ROOT / "_ds" / "anlu-store-design-system-2c194479-cd54-4629-9aa2-2697cfd8dd88" / "_ds_bundle.js"
INDEX = ROOT / "index.html"
TIENDA = ROOT / "tienda.html"

FORMAT_PRECIO = """function formatPrecio(n) {
  return '$' + Number(n).toLocaleString('es-CO');
}
"""

HELPERS = r"""
// ─── Normalización de celdas con varios valores (hoja Variantes) ─────────────
// color: "Rojo, Negro" → ['Rojo','Negro'] (cada uno es un color elegible; comparten stock, fotos y talles de la fila).
// talles: separados por coma, salto de línea o espacios. imagenes: coma o salto de línea, solo http*.
const sinAcentos = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const unicos = lista => {
  const vistos = new Set();
  return lista.filter(x => {
    const k = sinAcentos(x).toLowerCase();
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
};
const aLista = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
const parseColores = v => unicos(aLista(v).flatMap(x => String(x == null ? '' : x).split(',')).map(s => s.trim()).filter(Boolean));
const TALLA_CORTA = /^(?:XXS|XS|S|M|L|XL|XXL|XXXL|\d{1,3})$/i;
function parseTalles(v) {
  const out = [];
  aLista(v).forEach(x => {
    const s = String(x == null ? '' : x).trim();
    if (!s) return;
    if (/[,\n\r]/.test(s)) { s.split(/[,\n\r]+/).forEach(t => out.push(t.trim())); return; }
    // Solo con espacios se separa si TODAS las partes son tallas ("S M L", "28 30 32").
    // Texto libre como "Talla 6" o "Talla única" queda como un único talle.
    const partes = s.split(/\s+/);
    if (partes.length > 1 && partes.every(p => TALLA_CORTA.test(p))) partes.forEach(p => out.push(p));
    else out.push(s);
  });
  return unicos(out.filter(Boolean));
}
const parseImagenes = v => aLista(v).flatMap(x => String(x == null ? '' : x).split(/[,\n\r]+/)).map(s => s.trim()).filter(s => /^https?:\/\//i.test(s));
const coloresDe = p => unicos(p.variantes.flatMap(v => parseColores(v.color)));
"""

SWATCHES_OLD = """const SWATCHES = {
  'Lila': '#C4B5FD',
  'Violeta': '#7D5BA6',
  'Crema': '#FDF6EE',
  'Marfil': '#F4EDE2',
  'Perla': '#EDE9F2',
  'Negro': '#2E2434',
  'Azul claro': '#BFD3E6',
  'Dorado': '#D4AF37',
  'Floral': 'linear-gradient(135deg,#EDE1FF 0%,#C4B5FD 50%,#FDF6EE 100%)'
};
"""

SWATCHES_NEW = r"""const SWATCHES = {
  'Lila': '#C4B5FD',
  'Violeta': '#7D5BA6',
  'Morado': '#5B2C83',
  'Lavanda': '#D9CCF2',
  'Fucsia': '#D81B8C',
  'Rosa': '#F4A6C0',
  'Rosado': '#F4A6C0',
  'Coral': '#FF7F6B',
  'Salmón': '#FA9A85',
  'Durazno': '#FFCBA4',
  'Rojo': '#D32F2F',
  'Vino': '#722F37',
  'Bordó': '#800020',
  'Naranja': '#F28C28',
  'Mostaza': '#E1AD01',
  'Amarillo': '#F6D743',
  'Amarillo pastel': '#F8E8A6',
  'Dorado': '#D4AF37',
  'Verde': '#3E9B5B',
  'Verde agua': '#8FD9C8',
  'Menta': '#A8E6CF',
  'Turquesa': '#1FB5AD',
  'Celeste': '#9ED8F0',
  'Azul claro': '#BFD3E6',
  'Azul': '#2F5DBA',
  'Azul marino': '#1F2A5A',
  'Crema': '#FDF6EE',
  'Marfil': '#F4EDE2',
  'Hueso': '#E9E2D0',
  'Perla': '#EDE9F2',
  'Beige': '#D8C3A5',
  'Camel': '#C19A6B',
  'Café': '#6F4E37',
  'Marrón': '#7B4A2D',
  'Chocolate': '#5A3A29',
  'Plateado': '#C0C0C0',
  'Gris': '#9A9AA5',
  'Negro': '#2E2434',
  'Blanco': '#FFFFFF',
  'Floral': 'linear-gradient(135deg,#EDE1FF 0%,#C4B5FD 50%,#FDF6EE 100%)'
};

/* Búsqueda sin distinguir mayúsculas ni acentos ("SALMON", "salmón", "Salmon"). */
const normColor = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
const SWATCH_INDEX = {};
Object.keys(SWATCHES).forEach(k => { SWATCH_INDEX[normColor(k)] = SWATCHES[k]; });
/* Valor CSS del color, o null si el nombre no se reconoce (acepta también nombres CSS en inglés). */
function swatchFor(name) {
  const hit = SWATCH_INDEX[normColor(name)];
  if (hit) return hit;
  const raw = String(name == null ? '' : name).trim();
  if (raw && typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', raw)) return raw;
  return null;
}
/* Color no reconocido: círculo con borde visible + inicial (más letras si dos colores desconocidos comparten inicial). */
function swatchInitial(name, all) {
  if (swatchFor(name)) return null;
  const me = String(name).trim().toUpperCase();
  const otros = (all || []).filter(c => !swatchFor(c)).map(c => String(c).trim().toUpperCase());
  const max = Math.min(3, me.length);
  for (let n = 1; n <= max; n++) {
    if (otros.filter(o => o.slice(0, n) === me.slice(0, n)).length <= 1) return me.slice(0, n);
  }
  return me.slice(0, max);
}
function swatchStyle(name) {
  const bg = swatchFor(name);
  if (bg) return { background: bg, boxShadow: 'inset 0 0 0 1px rgba(46,36,52,.35)' };
  return {
    background: 'var(--lilac-50)',
    boxShadow: 'inset 0 0 0 2px var(--violet-700)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--violet-700)'
  };
}
"""

SWATCH_RENDER_OLD = """      background: SWATCHES[c] || c,
      boxShadow: 'inset 0 0 0 1px rgba(46,36,52,.08)'
    }
  }))))), /*#__PURE__*/React.createElement(__ds_scope.Button, {"""
SWATCH_RENDER_NEW = """      ...swatchStyle(c)
    }
  }, swatchInitial(c, colors)))))), /*#__PURE__*/React.createElement(__ds_scope.Button, {"""

EDITS = {
    BUNDLE: [
        ("lista de colores + fallback", SWATCHES_OLD, SWATCHES_NEW, "function swatchFor("),
        ("talle único preseleccionado",
         "  const [size, setSize] = React.useState(initial.size || null);",
         "  const [size, setSize] = React.useState(initial.size || (sizes.length === 1 ? sizes[0] : null));",
         "sizes.length === 1 ? sizes[0]"),
        ("render del círculo", SWATCH_RENDER_OLD, SWATCH_RENDER_NEW, "...swatchStyle(c)"),
    ],
    INDEX: [
        ("helpers", FORMAT_PRECIO, FORMAT_PRECIO + "\n" + HELPERS, "const parseColores"),
        ("colors", "colors: p.variantes.map(v => v.color),", "colors: coloresDe(p),", "colors: coloresDe(p),"),
        ("sizes", "sizes: varDefault.talles,", "sizes: parseTalles(varDefault.talles),", "parseTalles(varDefault.talles)"),
        ("image", "image: varDefault.imagenes[0] || '',", "image: parseImagenes(varDefault.imagenes)[0] || '',", "parseImagenes(varDefault.imagenes)[0]"),
    ],
}
EDITS[TIENDA] = EDITS[INDEX]


def patch(path, edits):
    text = path.read_bytes().decode("utf-8")
    nl = "\r\n" if text.count("\r\n") * 2 > text.count("\n") else "\n"
    for label, old, new, marker in edits:
        if marker in text:
            print(f"  = {label}: ya aplicado")
            continue
        old_n, new_n = old.replace("\n", nl), new.replace("\n", nl)
        n = text.count(old_n)
        if n != 1:
            print(f"  ! {label}: se esperaba 1 coincidencia y hay {n}. Abortando {path.name} sin cambios.")
            return False
        text = text.replace(old_n, new_n)
        print(f"  + {label}")
    path.write_bytes(text.encode("utf-8"))
    return True


def main():
    ok = True
    for path, edits in EDITS.items():
        print(path.relative_to(ROOT))
        ok = patch(path, edits) and ok
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
