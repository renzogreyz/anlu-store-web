"""Identifica cada selección por id de producto (+ color + talla) en vez de por nombre.

Idempotente: cada edición tiene un marcador; si ya está presente se omite.
Aborta (sin escribir nada en ese archivo) si un texto a reemplazar no es único.

Solo toca la copia raíz de _ds/ (la que usan index.html y tienda.html). Las copias
legacy en tienda/_ds y vidriera/_ds usan datos estáticos sin id: NO se tocan.
No agrega ninguna línea que sobreescriba window.ANLU.phone.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUNDLE = ROOT / "_ds" / "anlu-store-design-system-2c194479-cd54-4629-9aa2-2697cfd8dd88" / "_ds_bundle.js"
INDEX = ROOT / "index.html"
TIENDA = ROOT / "tienda.html"

PRODUCT_CARD_OLD = 'AnluStoreDesignSystem_2c1944.ProductCard" name="{{ p.name }}"'
PRODUCT_CARD_NEW = 'AnluStoreDesignSystem_2c1944.ProductCard" product-id="{{ p.id }}" name="{{ p.name }}"'

LS_LOAD_OLD = "  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }"
LS_LOAD_NEW = """  // Selecciones viejas guardadas sin id no se pueden identificar: se ignoran.
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(i => i && i.id) : [];
  } catch { return []; }"""

STORE_OLD = """  isSelected(name) {
    return state.items.some(i => i.name === name);
  },
  add(item) {
    state.items = [...state.items.filter(i => i.name !== item.name), item];
    emit();
  },
  remove(name) {
    state.items = state.items.filter(i => i.name !== name);
    emit();
  },
  toggle(item) {
    this.isSelected(item.name) ? this.remove(item.name) : this.add(item);
  },"""
STORE_NEW = """  // Identidad de una prenda seleccionada: id del producto + color + talla elegidos.
  keyOf(i) {
    return `${i.id}|${i.color}|${i.size}`;
  },
  isSelected(id) {
    return state.items.some(i => i.id === id);
  },
  add(item) {
    // Sin id no se puede identificar la prenda (p. ej. selecciones viejas): se ignora.
    if (!item || !item.id) return;
    const key = selection.keyOf(item);
    state.items = [...state.items.filter(i => selection.keyOf(i) !== key), item];
    emit();
  },
  remove(key) {
    state.items = state.items.filter(i => selection.keyOf(i) !== key);
    emit();
  },
  removeById(id) {
    state.items = state.items.filter(i => i.id !== id);
    emit();
  },
  toggle(item) {
    this.isSelected(item.id) ? this.removeById(item.id) : this.add(item);
  },"""

EDITS = {
    BUNDLE: [
        ("store", STORE_OLD, STORE_NEW, "removeById(id) {"),
        ("prop productId", "  stock = 'disponible',", "  stock = 'disponible',\n  productId,", "  productId,"),
        ("pid + selected",
         "  const selected = store.isSelected(name);",
         "  // Identidad de la selección: id del producto (si no llega, cae al nombre para no romper cards sin id).\n"
         "  const pid = productId != null && productId !== '' ? productId : name;\n"
         "  const selected = store.isSelected(pid);",
         "const pid = productId"),
        ("toggle payload",
         "const doSeleccionar = opts => __ds_scope.selection.toggle({\n    name,\n",
         "const doSeleccionar = opts => __ds_scope.selection.toggle({\n    id: pid,\n    name,\n",
         "    id: pid,"),
        ("deseleccionar desde card", "      __ds_scope.selection.remove(name);", "      __ds_scope.selection.removeById(pid);", "removeById(pid)"),
        ("drawer key", "    key: i.name,", "    key: __ds_scope.selection.keyOf(i),", "key: __ds_scope.selection.keyOf(i),"),
        ("drawer quitar",
         "    onClick: () => __ds_scope.selection.remove(i.name),",
         "    onClick: () => __ds_scope.selection.remove(__ds_scope.selection.keyOf(i)),",
         "selection.remove(__ds_scope.selection.keyOf(i))"),
    ],
    INDEX: [
        ("ProductCard productId", PRODUCT_CARD_OLD, PRODUCT_CARD_NEW, 'product-id="{{ p.id }}"'),
        ("productosNuevos id", "          name: p.nombre,", "          id: p.id,\n          name: p.nombre,", "          id: p.id,"),
        ("lsLoad filtra sin id", LS_LOAD_OLD, LS_LOAD_NEW, "saved.filter(i => i && i.id)"),
    ],
    TIENDA: [
        ("ProductCard productId", PRODUCT_CARD_OLD, PRODUCT_CARD_NEW, 'product-id="{{ p.id }}"'),
        ("lsLoad filtra sin id", LS_LOAD_OLD, LS_LOAD_NEW, "saved.filter(i => i && i.id)"),
    ],
}


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
