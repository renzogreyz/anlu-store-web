/* @ds-bundle: {"format":4,"namespace":"AnluStoreDesignSystem_2c1944","components":[{"name":"Carousel","sourcePath":"components/commerce/Carousel.jsx"},{"name":"CategoryCircle","sourcePath":"components/commerce/CategoryCircle.jsx"},{"name":"FeatureItem","sourcePath":"components/commerce/FeatureItem.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"ProductOptionsModal","sourcePath":"components/commerce/ProductOptionsModal.jsx"},{"name":"PromoBanner","sourcePath":"components/commerce/PromoBanner.jsx"},{"name":"SelectionBar","sourcePath":"components/commerce/SelectionBar.jsx"},{"name":"WhatsAppButton","sourcePath":"components/commerce/WhatsAppButton.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"GoldDivider","sourcePath":"components/core/GoldDivider.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"PhotoFrame","sourcePath":"components/core/PhotoFrame.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"}],"sourceHashes":{"components/commerce/Carousel.jsx":"779857fa4056","components/commerce/CategoryCircle.jsx":"a95be61eea05","components/commerce/FeatureItem.jsx":"40b76b70f041","components/commerce/ProductCard.jsx":"20ebc7a8dab2","components/commerce/ProductOptionsModal.jsx":"0ca20c91a964","components/commerce/PromoBanner.jsx":"74f28961c339","components/commerce/SelectionBar.jsx":"a36b7edcd578","components/commerce/WhatsAppButton.jsx":"3c12ce356bed","components/commerce/selectionStore.js":"dde84b35ff42","components/core/Badge.jsx":"95578b206d03","components/core/Button.jsx":"55384a85c673","components/core/GoldDivider.jsx":"a1828ff34a78","components/core/Icon.jsx":"cf4495327432","components/core/IconButton.jsx":"ad044b10ba28","components/core/PhotoFrame.jsx":"de56d905042b","components/core/SectionHeading.jsx":"bfed09b58f9d","components/forms/Input.jsx":"fc6c9441bdb9","ui_kits/anlu-store/Catalogo.jsx":"458b2c8e7e7a","ui_kits/anlu-store/Chrome.jsx":"c835635a6d4a","ui_kits/anlu-store/Home.jsx":"0c1f5142f161","ui_kits/anlu-store/data.js":"929fbc376067"},"inlinedExternals":[],"unexposedExports":[{"name":"selection","sourcePath":"components/commerce/selectionStore.js"},{"name":"useSelection","sourcePath":"components/commerce/selectionStore.js"}]} */

(() => {

const __ds_ns = (window.AnluStoreDesignSystem_2c1944 = window.AnluStoreDesignSystem_2c1944 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/WhatsAppButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The store's only conversion action: opens WhatsApp with the garment name preloaded.
 * Anlu has no cart, no checkout and no accounts.
 */
function WhatsAppButton({
  phone = '573201234567',
  product,
  message,
  variant = 'primary',
  size = 'md',
  fullWidth,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const text = message || (product ? `¡Hola Anlu! Me interesa la prenda "${product}". ¿Me confirmas disponibilidad?` : '¡Hola Anlu! Quiero consultar por una prenda.');
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  const pad = size === 'sm' ? '9px 14px' : size === 'lg' ? '16px 30px' : '12px 20px';
  const primary = variant === 'primary';
  return /*#__PURE__*/React.createElement("a", _extends({}, rest, {
    href: href,
    target: "_blank",
    rel: "noopener noreferrer",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      font: 'var(--type-button)',
      fontSize: size === 'sm' ? '11px' : '12px',
      letterSpacing: 'var(--ls-button)',
      textTransform: 'uppercase',
      padding: pad,
      borderRadius: 'var(--radius-sm)',
      textDecoration: 'none',
      width: fullWidth ? '100%' : undefined,
      background: primary ? hover ? 'var(--surface-accent-hover)' : 'var(--surface-accent)' : hover ? 'var(--surface-ghost-hover)' : 'transparent',
      color: primary ? 'var(--text-on-accent)' : 'var(--violet-700)',
      border: primary ? '1px solid transparent' : '1px solid var(--violet-400)',
      transition: 'background var(--dur-base) var(--ease-soft)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: `https://cdn.simpleicons.org/whatsapp/${primary ? 'FFFFFF' : '7D5BA6'}`,
    alt: "",
    width: size === 'sm' ? 14 : 16,
    height: size === 'sm' ? 14 : 16
  }), children || 'Consultar por WhatsApp');
}
Object.assign(__ds_scope, { WhatsAppButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/WhatsAppButton.jsx", error: String((e && e.message) || e) }); }

// components/commerce/selectionStore.js
try { (() => {
// Shared, framework-light store for the "compra conjunta" selection.
// Lives outside React so every mounted island (cards, floating bar, drawer) stays in sync.
const state = {
  items: [],
  phone: '573201234567'
};
const listeners = new Set();
function emit() {
  listeners.forEach(l => l());
}
const selection = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getItems() {
    return state.items;
  },
  getPhone() {
    return state.phone;
  },
  setPhone(p) {
    if (p) state.phone = p;
  },
  isSelected(name) {
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
  },
  clear() {
    state.items = [];
    emit();
  },
  message() {
    const lines = state.items.map(i => `• ${i.name} — Talla ${i.size} — Color ${i.color} — ${i.price} COP`);
    return `¡Hola Anlu! Quiero comprar estas prendas:\n${lines.join('\n')}\n\n¿Me confirmas disponibilidad y el envío, por favor?`;
  }
};
function useSelection() {
  const [, force] = React.useState(0);
  React.useEffect(() => selection.subscribe(() => force(n => n + 1)), []);
  return selection;
}
Object.assign(__ds_scope, { selection, useSelection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/selectionStore.js", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  gold: {
    background: 'var(--gold-500)',
    color: '#4A3708'
  },
  violet: {
    background: 'var(--surface-accent)',
    color: 'var(--text-on-accent)'
  },
  soft: {
    background: 'var(--surface-soft)',
    color: 'var(--violet-700)'
  }
};

/** Small uppercase marker: "NUEVO", "ÚLTIMAS UNIDADES", category counts. */
function Badge({
  tone = 'gold',
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-block',
      font: 'var(--type-eyebrow)',
      fontSize: '10px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      padding: '5px 10px',
      borderRadius: 'var(--radius-xs)',
      ...tones[tone],
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  font: 'var(--type-button)',
  letterSpacing: 'var(--ls-button)',
  textTransform: 'uppercase',
  border: '1px solid transparent',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  transition: 'background var(--dur-base) var(--ease-soft), color var(--dur-base) var(--ease-soft), border-color var(--dur-base) var(--ease-soft), transform var(--dur-fast) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)',
  textDecoration: 'none',
  whiteSpace: 'nowrap'
};
const sizes = {
  sm: {
    padding: '9px 16px',
    fontSize: '11px'
  },
  md: {
    padding: '13px 26px',
    fontSize: '12px'
  },
  lg: {
    padding: '16px 34px',
    fontSize: '13px'
  }
};
const variants = {
  primary: {
    background: 'var(--surface-accent)',
    color: 'var(--text-on-accent)'
  },
  secondary: {
    background: 'transparent',
    color: 'var(--violet-700)',
    borderColor: 'var(--violet-400)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--violet-700)'
  },
  gold: {
    background: 'transparent',
    color: 'var(--gold-600)',
    borderColor: 'var(--gold-500)'
  }
};
const hovers = {
  primary: {
    background: 'var(--surface-accent-hover)'
  },
  secondary: {
    background: 'var(--surface-ghost-hover)',
    borderColor: 'var(--violet-700)'
  },
  ghost: {
    background: 'var(--surface-ghost-hover)'
  },
  gold: {
    background: 'rgba(212,175,55,.10)',
    borderColor: 'var(--gold-600)'
  }
};

/** Anlu's action button. Uppercase, letterspaced, softly rounded. */
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  disabled,
  fullWidth,
  as = 'button',
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({}, rest, {
    disabled: Tag === 'button' ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...(hover && !disabled ? hovers[variant] : null),
      width: fullWidth ? '100%' : undefined,
      transform: press && !disabled ? 'var(--press-scale)' : 'none',
      opacity: disabled ? 0.45 : 1,
      pointerEvents: disabled ? 'none' : undefined,
      ...style
    }
  }), icon, children, iconEnd);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LUCIDE = 'https://unpkg.com/lucide-static@0.454.0/icons/';
const cache = new Map();
function load(name) {
  if (!cache.has(name)) {
    cache.set(name, fetch(`${LUCIDE}${name}.svg`).then(r => r.ok ? r.text() : '').catch(() => ''));
  }
  return cache.get(name);
}

/** Monochrome icon from the Lucide set, inlined so it inherits `color` via currentColor. */
function Icon({
  name,
  size = 18,
  color = 'var(--icon-default)',
  strokeWidth = 1.75,
  style,
  ...rest
}) {
  const [svg, setSvg] = React.useState('');
  React.useEffect(() => {
    let live = true;
    load(name).then(text => {
      if (!live || !text) return;
      setSvg(text.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"').replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`));
    });
    return () => {
      live = false;
    };
  }, [name, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true"
  }, rest, {
    dangerouslySetInnerHTML: {
      __html: svg
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flex: '0 0 auto',
      color,
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/commerce/FeatureItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** One entry of the reassurance strip (envíos, cambios, atención personalizada). */
function FeatureItem({
  icon = 'truck',
  title,
  text,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    color: "var(--violet-700)",
    style: {
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--violet-700)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, text)));
}
Object.assign(__ds_scope, { FeatureItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/FeatureItem.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductOptionsModal.jsx
try { (() => {
const SWATCHES = {
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

/** Modal to pick talla and color before comprando o seleccionando una prenda. */
function ProductOptionsModal({
  open,
  product,
  sizes = ['S', 'M', 'L', 'XL'],
  colors = ['Lila', 'Crema'],
  value = {},
  onConfirm,
  onClose
}) {
  if (!open) return null;
  const dialog = /*#__PURE__*/React.createElement(Dialog, {
    product: product,
    sizes: sizes,
    colors: colors,
    initial: value,
    onConfirm: onConfirm,
    onClose: onClose
  });
  const portal = typeof window !== 'undefined' && window.ReactDOM && window.ReactDOM.createPortal;
  return portal ? window.ReactDOM.createPortal(dialog, document.body) : dialog;
}

/* Montado en un portal a document.body: nunca queda dentro de un ancestro con
   transform/overflow, que es lo que provocaba el bucle de reposicionamiento.
   El estado arranca del valor recibido en el montaje — sin efecto de sincronización. */
function Dialog({
  product,
  sizes,
  colors,
  initial,
  onConfirm,
  onClose
}) {
  const [size, setSize] = React.useState(initial.size || null);
  const [color, setColor] = React.useState(initial.color || null);
  React.useEffect(() => {
    const esc = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  const ready = size && color;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 80,
      background: 'rgba(46,36,52,.42)',
      backdropFilter: 'blur(3px)',
      display: 'grid',
      placeItems: 'center',
      padding: 'var(--space-5)',
      animation: 'anlu-fade-in var(--dur-base) var(--ease-soft) both'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 420,
      maxWidth: '100%',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lift)',
      padding: 'var(--space-6)',
      display: 'grid',
      gap: 'var(--space-5)',
      animation: 'anlu-modal-in var(--dur-base) var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--violet-700)'
    }
  }, "Elige talla y color"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-light)',
      fontSize: '24px',
      color: 'var(--text-heading)'
    }
  }, product)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 18,
    color: "var(--ink-500)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "Talla"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, sizes.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setSize(s),
    style: {
      cursor: 'pointer',
      minWidth: 52,
      padding: '11px 0',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      fontSize: '13px',
      fontWeight: 'var(--fw-medium)',
      letterSpacing: '.06em',
      border: `1px solid ${size === s ? 'var(--violet-700)' : 'var(--border-subtle)'}`,
      background: size === s ? 'var(--violet-700)' : 'var(--white)',
      color: size === s ? 'var(--white)' : 'var(--text-body)',
      transition: 'all var(--dur-base) var(--ease-soft)'
    }
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "Color", color ? ` · ${color}` : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap'
    }
  }, colors.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setColor(c),
    "aria-label": c,
    title: c,
    style: {
      cursor: 'pointer',
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-circle)',
      padding: 3,
      border: `1px solid ${color === c ? 'var(--violet-700)' : 'var(--border-gold)'}`,
      background: 'transparent',
      transition: 'border-color var(--dur-base) var(--ease-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: '100%',
      height: '100%',
      borderRadius: 'var(--radius-circle)',
      background: SWATCHES[c] || c,
      boxShadow: 'inset 0 0 0 1px rgba(46,36,52,.08)'
    }
  }))))), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    fullWidth: true,
    disabled: !ready,
    onClick: () => onConfirm({
      size,
      color
    })
  }, ready ? 'Confirmar selección' : 'Elige talla y color')));
}
Object.assign(__ds_scope, { ProductOptionsModal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductOptionsModal.jsx", error: String((e && e.message) || e) }); }

// components/core/GoldDivider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Gold hairline separator, optionally centred on a sparkle or moon motif. */
function GoldDivider({
  motif,
  width = '100%',
  style,
  ...rest
}) {
  const line = {
    flex: 1,
    height: 1,
    background: 'var(--grad-gold)'
  };
  const w = typeof width === 'string' && /^\d+(\.\d+)?$/.test(width.trim()) ? width.trim() + 'px' : width;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      width: w,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: line
  }), motif ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: motif,
    size: 14,
    color: "var(--gold-500)"
  }) : null, motif ? /*#__PURE__*/React.createElement("span", {
    style: line
  }) : null);
}
Object.assign(__ds_scope, { GoldDivider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GoldDivider.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Circular icon-only control: header search, wishlist heart, carousel arrows. */
function IconButton({
  icon,
  label,
  size = 40,
  variant = 'plain',
  active,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const filled = variant === 'filled';
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    "aria-label": label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-circle)',
      cursor: 'pointer',
      background: filled ? 'var(--white)' : hover ? 'var(--surface-ghost-hover)' : 'transparent',
      border: variant === 'outline' ? '1px solid var(--border-subtle)' : '1px solid transparent',
      boxShadow: filled ? 'var(--shadow-soft)' : 'none',
      transition: 'background var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)',
      ...style
    }
  }), icon, active ? null : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/PhotoFrame.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Image container for product / editorial photography. With no `src` it renders the
 * brand's lilac placeholder so layouts read correctly before real photos arrive.
 */
function PhotoFrame({
  src,
  alt = '',
  ratio = '3 / 4',
  radius = 'var(--radius-md)',
  label,
  overlay,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'relative',
      aspectRatio: ratio,
      borderRadius: radius,
      overflow: 'hidden',
      background: src ? 'var(--surface-soft)' : 'var(--grad-photo)',
      ...style
    }
  }), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      textAlign: 'center',
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "image",
    size: 22,
    color: "rgba(74,46,99,.45)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'rgba(74,46,99,.55)'
    }
  }, label === '' ? null : label || 'Foto de producto')), overlay);
}
Object.assign(__ds_scope, { PhotoFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PhotoFrame.jsx", error: String((e && e.message) || e) }); }

// components/commerce/Carousel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Carrusel de novedades/eventos: una imagen por slide, rotación automática y
 * puntos de navegación. Al hacer clic lleva a la Tienda con la prenda resaltada.
 */
function Carousel({
  slides = [],
  interval = 5000,
  ratio = '21 / 9',
  href = 'tienda.html',
  onSlideClick,
  style,
  ...rest
}) {
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const n = slides.length;
  React.useEffect(() => {
    if (i >= n && n) setI(0);
  }, [n]);
  React.useEffect(() => {
    if (n < 2 || paused) return;
    const t = setTimeout(() => setI(p => (p + 1) % n), interval);
    return () => clearTimeout(t);
  }, [i, n, paused, interval]);
  if (!n) return null;
  const go = slide => {
    if (onSlideClick) return onSlideClick(slide);
    const target = slide.product ? `${href}?prenda=${encodeURIComponent(slide.product)}` : href;
    window.location.href = target;
  };
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      justifyItems: 'center',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      aspectRatio: ratio,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)'
    }
  }, slides.map((s, k) => /*#__PURE__*/React.createElement("button", {
    key: s.label || k,
    onClick: () => go(s),
    "aria-label": s.label || `Novedad ${k + 1}`,
    style: {
      position: 'absolute',
      inset: 0,
      padding: 0,
      border: 0,
      cursor: 'pointer',
      background: 'transparent',
      opacity: k === i ? 1 : 0,
      pointerEvents: k === i ? 'auto' : 'none',
      transition: 'opacity var(--dur-slow) var(--ease-soft)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: s.image,
    label: s.label,
    ratio: ratio,
    radius: "0",
    style: {
      height: '100%'
    }
  })))), n > 1 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'center'
    }
  }, slides.map((s, k) => /*#__PURE__*/React.createElement("button", {
    key: `dot-${s.label || k}`,
    onClick: () => setI(k),
    "aria-label": `Ir a la novedad ${k + 1}`,
    style: {
      cursor: 'pointer',
      border: 0,
      padding: 0,
      borderRadius: 'var(--radius-pill)',
      width: k === i ? 26 : 9,
      height: 9,
      background: k === i ? 'var(--violet-700)' : 'var(--lavender-200)',
      transition: 'width var(--dur-base) var(--ease-soft), background var(--dur-base) var(--ease-soft)'
    }
  }))) : null);
}
Object.assign(__ds_scope, { Carousel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/Carousel.jsx", error: String((e && e.message) || e) }); }

// components/commerce/CategoryCircle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Circular category entry used in the "Descubre por categorías" row. */
function CategoryCircle({
  label,
  image,
  size = 132,
  active,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({}, rest, {
    href: rest.href || '#',
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'grid',
      justifyItems: 'center',
      gap: 'var(--space-3)',
      textDecoration: 'none',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-circle)',
      padding: 4,
      border: `1px solid ${hover || active ? 'var(--gold-500)' : 'var(--border-gold)'}`,
      transform: hover ? 'var(--hover-lift)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-soft), border-color var(--dur-base) var(--ease-soft)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: image,
    alt: label,
    label: "",
    ratio: "1 / 1",
    radius: "var(--radius-circle)",
    style: {
      height: '100%'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: hover || active ? 'var(--violet-700)' : 'var(--text-body)',
      fontSize: '11px'
    }
  }, label));
}
Object.assign(__ds_scope, { CategoryCircle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/CategoryCircle.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Catalogue tile: photo, stock badge, name, price, "Comprar" (WhatsApp) y "Seleccionar". */
function ProductCard({
  name,
  price,
  image,
  badge,
  category,
  phone,
  stock = 'disponible',
  sizes,
  colors,
  highlight,
  style,
  ...rest
}) {
  const store = __ds_scope.useSelection();
  const [hover, setHover] = React.useState(false);
  const [options, setOptions] = React.useState(null);
  const [modal, setModal] = React.useState(null); // 'comprar' | 'seleccionar' | null
  const agotado = stock === 'agotado';
  const selected = store.isSelected(name);
  const waHref = opts => {
    const detail = opts ? ` en talla ${opts.size}, color ${opts.color}` : '';
    const text = `¡Hola Anlu! Quiero comprar "${name}"${detail}. ¿Me confirmas disponibilidad y el envío?`;
    return `https://wa.me/${phone || store.getPhone()}?text=${encodeURIComponent(text)}`;
  };
  const doComprar = opts => window.open(waHref(opts), '_blank', 'noopener');
  const doSeleccionar = opts => __ds_scope.selection.toggle({
    name,
    price,
    image,
    category,
    size: opts.size,
    color: opts.color
  });
  const handle = action => {
    if (agotado) return;
    if (action === 'seleccionar' && selected) {
      __ds_scope.selection.remove(name);
      return;
    }
    if (!options) {
      setModal(action);
      return;
    }
    action === 'comprar' ? doComprar(options) : doSeleccionar(options);
  };
  const confirm = opts => {
    setOptions(opts);
    const action = modal;
    setModal(null);
    action === 'comprar' ? doComprar(opts) : doSeleccionar(opts);
  };
  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    font: 'var(--type-button)',
    letterSpacing: 'var(--ls-button)',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-sm)',
    cursor: agotado ? 'not-allowed' : 'pointer',
    opacity: agotado ? 0.45 : 1,
    transition: 'background var(--dur-base) var(--ease-soft)'
  };
  return /*#__PURE__*/React.createElement("article", _extends({}, rest, {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: selected ? 'var(--lilac-50)' : 'var(--surface-card)',
      border: `1px solid ${selected || highlight ? 'var(--violet-700)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: highlight ? '0 0 0 4px rgba(180,154,209,.45), var(--shadow-lift)' : hover && !agotado && !modal ? 'var(--shadow-card)' : 'var(--shadow-soft)',
      transform: hover && !agotado && !modal ? 'var(--hover-lift)' : 'none',
      transition: 'box-shadow var(--dur-base) var(--ease-soft), transform var(--dur-base) var(--ease-soft), border-color var(--dur-base) var(--ease-soft), background var(--dur-base) var(--ease-soft)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: image,
    label: name,
    ratio: "3 / 4",
    radius: "0",
    style: {
      opacity: agotado ? 0.55 : 1
    },
    overlay: /*#__PURE__*/React.createElement(React.Fragment, null, badge && !agotado ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      style: {
        position: 'absolute',
        top: 10,
        left: 10
      }
    }, badge) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(255,255,255,.92)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 10px',
        font: 'var(--type-eyebrow)',
        fontSize: '10px',
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: agotado ? 'var(--ink-500)' : 'var(--violet-700)',
        boxShadow: 'var(--shadow-soft)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: agotado ? 'var(--ink-300)' : 'var(--violet-700)'
      }
    }), agotado ? 'Agotado' : 'Disponible'), selected ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: 'var(--violet-700)',
        color: 'var(--white)',
        display: 'grid',
        placeItems: 'center',
        boxShadow: 'var(--shadow-soft)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 14,
      color: "var(--white)"
    })) : null)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-4)',
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, category ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontSize: '10px'
    }
  }, category) : null, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-card-title)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-regular)',
      color: 'var(--text-heading)'
    }
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '20px',
      color: 'var(--violet-700)'
    }
  }, price, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '11px',
      color: 'var(--text-muted)'
    }
  }, "COP")), options ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      fontSize: '10px',
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--violet-700)'
    }
  }, "Talla ", options.size, " \xB7 ", options.color) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handle('comprar'),
    disabled: agotado,
    style: {
      ...btnBase,
      background: 'var(--surface-accent)',
      color: 'var(--white)',
      border: '1px solid transparent',
      padding: '12px 16px',
      fontSize: '12px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "https://cdn.simpleicons.org/whatsapp/FFFFFF",
    alt: "",
    width: 15,
    height: 15
  }), "Comprar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handle('seleccionar'),
    disabled: agotado,
    style: {
      ...btnBase,
      padding: '9px 14px',
      fontSize: '11px',
      background: selected ? 'var(--lavender-200)' : 'transparent',
      color: 'var(--violet-700)',
      border: '1px solid var(--violet-400)'
    }
  }, selected ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    color: "var(--violet-700)"
  }) : null, selected ? 'Seleccionada' : 'Seleccionar'))), /*#__PURE__*/React.createElement(__ds_scope.ProductOptionsModal, {
    open: !!modal,
    product: name,
    sizes: sizes,
    colors: colors,
    value: options || {},
    onConfirm: confirm,
    onClose: () => setModal(null)
  }));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/commerce/PromoBanner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Wide lilac editorial banner: image left, headline + CTA right. */
function PromoBanner({
  eyebrow,
  title,
  subtitle,
  text,
  cta = 'Descubrir ahora',
  href = '#',
  image,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({}, rest, {
    style: {
      display: 'grid',
      gridTemplateColumns: '360px 1fr',
      alignItems: 'center',
      gap: 'var(--space-7)',
      background: 'var(--grad-banner)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: image,
    label: eyebrow || 'Editorial',
    ratio: "4 / 3",
    radius: "0",
    style: {
      height: '100%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-6) var(--space-7) var(--space-6) 0',
      display: 'grid',
      gap: 'var(--space-3)',
      justifyItems: 'start',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "moon",
    size: 30,
    color: "var(--gold-500)",
    style: {
      position: 'absolute',
      top: 'var(--space-5)',
      right: 'var(--space-6)',
      opacity: .8
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--fs-display-m)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: 'var(--fw-light)'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: '19px',
      color: 'var(--violet-700)'
    }
  }, subtitle) : null, text ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-body)',
      maxWidth: 420
    }
  }, text) : null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    as: "a",
    href: href,
    style: {
      marginTop: 'var(--space-2)'
    }
  }, cta)));
}
Object.assign(__ds_scope, { PromoBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/PromoBanner.jsx", error: String((e && e.message) || e) }); }

// components/commerce/SelectionBar.jsx
try { (() => {
/** Floating "Finalizar compra (n)" bar + resumen drawer for the multi-garment WhatsApp order. */
function SelectionBar({
  phone
}) {
  const store = __ds_scope.useSelection();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (phone) __ds_scope.selection.setPhone(phone);
  }, [phone]);
  const items = store.getItems();
  React.useEffect(() => {
    if (!items.length) setOpen(false);
  }, [items.length]);
  if (!items.length) return null;
  const href = `https://wa.me/${store.getPhone()}?text=${encodeURIComponent(store.message())}`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 'var(--space-5)',
      zIndex: 60,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(true),
    style: {
      pointerEvents: 'auto',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      background: 'var(--surface-accent)',
      color: 'var(--white)',
      border: 0,
      padding: '15px 28px',
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--shadow-lift)',
      font: 'var(--type-button)',
      letterSpacing: 'var(--ls-button)',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "shopping-bag",
    size: 16,
    color: "var(--white)"
  }), "Finalizar compra (", items.length, ")")), open ? /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(false),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 90,
      background: 'rgba(46,36,52,.42)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 420,
      maxWidth: '100%',
      height: '100%',
      background: 'var(--surface-page)',
      boxShadow: 'var(--shadow-lift)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: 'var(--space-5) var(--space-6)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--violet-700)'
    }
  }, "Tu selecci\xF3n"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '24px',
      color: 'var(--text-heading)'
    }
  }, items.length, " ", items.length === 1 ? 'prenda' : 'prendas')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(false),
    "aria-label": "Cerrar",
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 18,
    color: "var(--ink-500)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: 'auto',
      padding: 'var(--space-5) var(--space-6)',
      display: 'grid',
      gap: 'var(--space-4)',
      alignContent: 'start'
    }
  }, items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.name,
    style: {
      display: 'grid',
      gridTemplateColumns: '64px 1fr auto',
      gap: 'var(--space-4)',
      alignItems: 'center',
      paddingBottom: 'var(--space-4)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: i.image,
    label: "",
    ratio: "3 / 4",
    radius: "var(--radius-sm)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body-m)',
      color: 'var(--text-heading)'
    }
  }, i.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "Talla ", i.size, " \xB7 ", i.color), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '19px',
      color: 'var(--violet-700)'
    }
  }, i.price, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '11px',
      color: 'var(--text-muted)'
    }
  }, "COP"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => __ds_scope.selection.remove(i.name),
    "aria-label": `Quitar ${i.name}`,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "trash-2",
    size: 16,
    color: "var(--ink-500)"
  }))))), /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: 'var(--space-5) var(--space-6)',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--surface-warm)',
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "Te enviamos todo en un solo mensaje. Coordinamos env\xEDo y pago contraentrega por WhatsApp."), /*#__PURE__*/React.createElement("a", {
    href: href,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      background: 'var(--surface-accent)',
      color: 'var(--white)',
      padding: '15px 24px',
      borderRadius: 'var(--radius-sm)',
      textDecoration: 'none',
      font: 'var(--type-button)',
      letterSpacing: 'var(--ls-button)',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "https://cdn.simpleicons.org/whatsapp/FFFFFF",
    alt: "",
    width: 16,
    height: 16
  }), "Enviar pedido por WhatsApp"), /*#__PURE__*/React.createElement("button", {
    onClick: () => __ds_scope.selection.clear(),
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      font: 'var(--type-button)',
      letterSpacing: 'var(--ls-button)',
      textTransform: 'uppercase',
      color: 'var(--ink-500)',
      padding: '6px 0'
    }
  }, "Vaciar selecci\xF3n")))) : null);
}
Object.assign(__ds_scope, { SelectionBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/SelectionBar.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Centred (or left) section header: uppercase display title + gold motif + optional subtitle. */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  motif = 'sparkles',
  size = 'var(--fs-display-s)',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({}, rest, {
    style: {
      textAlign: align,
      display: 'grid',
      gap: 'var(--space-2)',
      justifyItems: align === 'center' ? 'center' : 'start',
      ...style
    }
  }), eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--violet-700)'
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h2", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      fontSize: size,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontWeight: 'var(--fw-light)',
      color: 'var(--text-heading)'
    }
  }, title, motif ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: motif,
    size: 16,
    color: "var(--gold-500)"
  }) : null), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, subtitle) : null);
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Hairline text field used in the header search, newsletter and contact form. */
function Input({
  icon,
  iconEnd,
  tone = 'default',
  style,
  wrapperStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      background: tone === 'onColor' ? 'var(--white)' : 'var(--surface-page)',
      border: `1px solid ${focus ? 'var(--violet-400)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-sm)',
      padding: '0 var(--space-4)',
      height: 46,
      boxShadow: focus ? 'var(--shadow-focus)' : 'none',
      transition: 'border-color var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)',
      ...wrapperStyle
    }
  }, icon, /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur?.(e);
    },
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      background: 'transparent',
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-m)',
      color: 'var(--text-heading)',
      ...style
    }
  })), iconEnd);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// ui_kits/anlu-store/Catalogo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  Icon,
  Badge,
  SectionHeading,
  ProductCard,
  CategoryCircle,
  GoldDivider,
  PhotoFrame,
  WhatsAppButton
} = window.AnluStoreDesignSystem_2c1944;
const slug = s => 'prenda-' + s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
function Catalogo({
  category,
  onCategory,
  query,
  highlight
}) {
  const all = window.ANLU.products;
  const list = all.filter(p => (!category || p.category === category) && (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--grad-warm)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-7) var(--gutter)',
      display: 'grid',
      gap: 'var(--space-5)',
      justifyItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    title: category || 'Toda la tienda',
    subtitle: `${list.length} prendas disponibles`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, window.ANLU.categories.map(c => /*#__PURE__*/React.createElement(CategoryCircle, {
    key: c,
    label: c,
    size: 92,
    active: c === category,
    onClick: e => {
      e.preventDefault();
      onCategory(c === category ? null : c);
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-7) var(--gutter) var(--space-9)',
      display: 'grid',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'center'
    }
  }, category ? /*#__PURE__*/React.createElement(Badge, {
    tone: "soft"
  }, category) : null, query ? /*#__PURE__*/React.createElement(Badge, {
    tone: "soft"
  }, "\u201C", query, "\u201D") : null, category || query ? /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onCategory(null)
  }, "Limpiar") : null), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "Ordenar por \xB7 novedades")), list.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 'var(--grid-gap)'
    }
  }, list.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    id: slug(p.name)
  }, /*#__PURE__*/React.createElement(ProductCard, _extends({}, p, {
    phone: window.ANLU.phone,
    highlight: p.name === highlight
  }))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      justifyItems: 'center',
      padding: 'var(--space-9) 0'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 26,
    color: "var(--gold-500)"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, "Todav\xEDa no tenemos prendas para esa b\xFAsqueda. Escr\xEDbenos y te ayudamos a encontrarla."), /*#__PURE__*/React.createElement(WhatsAppButton, {
    phone: window.ANLU.phone
  }, "Consultar por WhatsApp"))));
}
Object.assign(window, {
  Catalogo
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/anlu-store/Catalogo.jsx", error: String((e && e.message) || e) }); }

// ui_kits/anlu-store/Chrome.jsx
try { (() => {
const {
  Button,
  Icon,
  IconButton,
  Input,
  GoldDivider,
  WhatsAppButton
} = window.AnluStoreDesignSystem_2c1944;
function TopBar() {
  const items = [['sparkles', 'Envíos a toda Colombia'], ['heart', 'Diseños pensados para ti'], ['moon', 'Compra 100% segura'], ['gift', 'Pago contraentrega disponible']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-topbar)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '9px var(--gutter)',
      display: 'flex',
      justifyContent: 'center',
      gap: 'var(--space-7)'
    }
  }, items.map(([ic, t]) => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      font: 'var(--type-eyebrow)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontSize: '10px',
      color: 'rgba(255,255,255,.9)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 13,
    color: "var(--gold-500)"
  }), t))));
}
function Wordmark({
  compact
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'block',
      flex: '0 0 auto',
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    alt: "Anlu Store",
    style: {
      display: 'block',
      height: compact ? 42 : 52,
      width: 'auto'
    }
  }));
}
function Header({
  view,
  onNav,
  query,
  onQuery
}) {
  const [openSearch, setOpenSearch] = React.useState(false);
  const nav = [['inicio', 'Inicio'], ['tienda', 'Tienda']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(255,255,255,.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-3) var(--gutter)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, null), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-7)',
      flex: 1,
      justifyContent: 'center'
    }
  }, nav.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(id);
    },
    style: {
      font: 'var(--type-button)',
      textTransform: 'none',
      letterSpacing: 'var(--ls-nav)',
      fontSize: '15px',
      whiteSpace: 'nowrap',
      color: view === id ? 'var(--violet-700)' : 'var(--text-body)',
      borderBottom: view === id ? '1px solid var(--gold-500)' : '1px solid transparent',
      paddingBottom: 3
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, openSearch ? /*#__PURE__*/React.createElement(Input, {
    autoFocus: true,
    value: query,
    onChange: e => onQuery(e.target.value),
    placeholder: "Buscar prendas\u2026",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 16
    }),
    wrapperStyle: {
      width: 230,
      height: 40
    }
  }) : null, /*#__PURE__*/React.createElement(IconButton, {
    label: "Buscar",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: openSearch ? 'x' : 'search'
    }),
    onClick: () => {
      setOpenSearch(!openSearch);
      onQuery('');
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Favoritos",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "heart"
    })
  }), /*#__PURE__*/React.createElement(WhatsAppButton, {
    size: "sm",
    phone: window.ANLU.phone
  }, "Escr\xEDbenos"))));
}
function Footer() {
  const cols = [['Tienda', window.ANLU.categories], ['Información', ['Envíos a toda Colombia', 'Pago contraentrega', 'Cambios', 'Preguntas frecuentes']], ['Ayuda', ['¿Cómo comprar?', 'Guía de tallas', 'Pago contraentrega']]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-warm)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--gutter) var(--space-6)',
      display: 'grid',
      gridTemplateColumns: '1.3fr repeat(3,1fr) 1.2fr',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)',
      justifyItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    compact: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "Viste tu esencia.", /*#__PURE__*/React.createElement("br", null), "Expresa tu estilo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)'
    }
  }, ['instagram', 'facebook', 'music', 'mail'].map(n => /*#__PURE__*/React.createElement(Icon, {
    key: n,
    name: n,
    size: 16,
    color: "var(--violet-700)"
  })))), cols.map(([title, items]) => /*#__PURE__*/React.createElement("div", {
    key: title,
    style: {
      display: 'grid',
      gap: 'var(--space-2)',
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--violet-700)'
    }
  }, title), items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, i)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)',
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--violet-700)'
    }
  }, "Contacto"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "WhatsApp +57 320 123 4567"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "Env\xEDos a toda Colombia"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "hola@anlustore.com"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "Lunes a viernes \xB7 8:00 a 18:00"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-muted)'
    }
  }, "S\xE1bados \xB7 9:00 a 14:00"), /*#__PURE__*/React.createElement(WhatsAppButton, {
    size: "sm",
    variant: "secondary",
    phone: window.ANLU.phone,
    style: {
      marginTop: 'var(--space-2)'
    }
  }, "Consultar ahora"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--gutter) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(GoldDivider, {
    motif: "sparkles"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      marginTop: 'var(--space-4)',
      font: 'var(--type-eyebrow)',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontSize: '10px',
      color: 'var(--text-muted)'
    }
  }, "\xA9 2026 Anlu Store \xB7 Todos los derechos reservados")));
}
Object.assign(window, {
  TopBar,
  Header,
  Footer,
  Wordmark
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/anlu-store/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/anlu-store/Home.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  Icon,
  Badge,
  GoldDivider,
  SectionHeading,
  PhotoFrame,
  ProductCard,
  CategoryCircle,
  Carousel,
  FeatureItem,
  Input,
  WhatsAppButton
} = window.AnluStoreDesignSystem_2c1944;
const Section = ({
  children,
  tone,
  style
}) => /*#__PURE__*/React.createElement("section", {
  style: {
    background: tone === 'warm' ? 'var(--surface-warm)' : tone === 'soft' ? 'var(--grad-warm)' : 'var(--surface-page)',
    padding: 'var(--section-y) 0',
    ...style
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '0 var(--gutter)'
  }
}, children));
function Sparkle({
  top,
  left,
  size = 16,
  opacity = .7
}) {
  return /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: size,
    color: "var(--gold-500)",
    style: {
      position: 'absolute',
      top,
      left,
      opacity
    }
  });
}
function Hero({
  onNav
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--grad-hero)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    top: 60,
    left: 40,
    size: 20
  }), /*#__PURE__*/React.createElement(Sparkle, {
    top: 200,
    left: 90,
    size: 14,
    opacity: .5
  }), /*#__PURE__*/React.createElement(Sparkle, {
    top: 310,
    left: 30,
    size: 16,
    opacity: .6
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-9) var(--gutter)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-8)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      justifyItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "anlu-eyebrow"
  }, "Si\xE9ntete \xFAnica, si\xE9ntete t\xFA"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--fs-display-xl)',
      fontWeight: 'var(--fw-light)',
      lineHeight: 'var(--lh-tight)'
    }
  }, "Ropa que", /*#__PURE__*/React.createElement("br", null), "realza tu ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: 'var(--violet-700)'
    }
  }, "esencia")), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-l)',
      color: 'var(--text-body)',
      maxWidth: 400
    }
  }, "Dise\xF1os para mujeres que quieren sentirse c\xF3modas, aut\xE9nticas y hermosas siendo ellas mismas."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => onNav('tienda')
  }, "Ver la tienda"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    onClick: () => onNav('tienda')
  }, "Novedades"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(PhotoFrame, {
    ratio: "3 / 4",
    radius: "var(--radius-lg)",
    label: "Modelo \xB7 look lavanda"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(PhotoFrame, {
    ratio: "1 / 1",
    radius: "var(--radius-lg)",
    label: "Percheros lila"
  }), /*#__PURE__*/React.createElement(PhotoFrame, {
    ratio: "1 / 1",
    radius: "var(--radius-lg)",
    label: "Detalle de tela"
  })))));
}
function Categories({
  onCategory
}) {
  return /*#__PURE__*/React.createElement(Section, {
    tone: "warm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)',
      justifyItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    title: "Descubre por categor\xEDas"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-6)',
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, window.ANLU.categories.map(c => /*#__PURE__*/React.createElement(CategoryCircle, {
    key: c,
    label: c,
    href: "#tienda",
    onClick: e => {
      e.preventDefault();
      onCategory(c);
    }
  })))));
}
function NewArrivals({
  onNav
}) {
  const items = window.ANLU.products.filter(p => p.badge).slice(0, 5);
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "left",
    title: "Novedades",
    subtitle: "Lo m\xE1s nuevo para ti"
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav('tienda');
    },
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "Ver toda la colecci\xF3n ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5,1fr)',
      gap: 'var(--grid-gap)'
    }
  }, items.map(p => /*#__PURE__*/React.createElement(ProductCard, _extends({
    key: p.name
  }, p, {
    phone: window.ANLU.phone
  }))))));
}
function About({
  onNav
}) {
  return /*#__PURE__*/React.createElement(Section, {
    tone: "warm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.15fr',
      gap: 'var(--space-7)',
      alignItems: 'center',
      background: 'var(--cream-100)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-7)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    top: 28,
    left: 26,
    size: 18
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      justifyItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "anlu-eyebrow"
  }, "La esencia de Anlu"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--fs-display-m)',
      fontWeight: 'var(--fw-light)',
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'center'
    }
  }, "M\xE1s que ropa, una forma de expresarte ", /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 22,
    color: "var(--gold-500)"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-body)',
      maxWidth: 420
    }
  }, "En Anlu creemos que cada prenda puede acompa\xF1arte a mostrar una parte de ti. Queremos ofrecerte dise\xF1os que te hagan sentir c\xF3moda, segura y aut\xE9ntica."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => onNav('tienda')
  }, "Ver la tienda")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(PhotoFrame, {
    ratio: "3 / 4",
    label: "Etiqueta Anlu"
  }), /*#__PURE__*/React.createElement(PhotoFrame, {
    ratio: "3 / 4",
    label: "Percheros"
  }), /*#__PURE__*/React.createElement(PhotoFrame, {
    ratio: "3 / 4",
    label: "Vestido espalda"
  }))));
}
function Reassurance() {
  const items = [['truck', 'Envíos', 'Envíos a toda Colombia, rápidos y seguros.'], ['heart', 'Prendas especiales', 'Diseños exclusivos pensados para ti.'], ['refresh-cw', 'Pago contraentrega', 'Pagas cuando recibes tu pedido.'], ['message-circle', 'Atención personalizada', 'Estamos aquí para ayudarte siempre.']];
  return /*#__PURE__*/React.createElement(Section, {
    style: {
      padding: 'var(--space-7) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }
  }, items.map(([ic, t, x], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      padding: 'var(--space-5)',
      borderLeft: i ? '1px solid var(--border-subtle)' : 'none',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(FeatureItem, {
    icon: ic,
    title: t,
    text: x
  })))));
}
function Newsletter() {
  return /*#__PURE__*/React.createElement(Section, {
    style: {
      padding: '0 0 var(--section-y)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--grad-banner)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6) var(--space-7)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-7)',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 34,
    color: "var(--gold-500)",
    style: {
      position: 'absolute',
      top: 18,
      left: '46%',
      opacity: .7
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-display-s)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: 'var(--fw-light)'
    }
  }, "S\xE9 parte de Anlu"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      fontSize: 'var(--fs-body-s)',
      color: 'var(--text-body)'
    }
  }, "Recibe novedades, nuevos lanzamientos y sorpresas especiales.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    tone: "onColor",
    placeholder: "Tu correo electr\xF3nico",
    wrapperStyle: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 14,
      color: "#fff"
    })
  }, "Quiero unirme"))));
}
function Home({
  onNav,
  onCategory,
  onCarousel
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(Categories, {
    onCategory: onCategory
  }), /*#__PURE__*/React.createElement(Section, {
    style: {
      padding: 'var(--space-7) 0 0'
    }
  }, /*#__PURE__*/React.createElement(Carousel, {
    slides: [{
      label: 'Nueva colección · Vestidos',
      product: 'Vestido Lila Satinado'
    }, {
      label: 'Combo pijamas · 2x1',
      product: 'Pijama Satén Lila'
    }, {
      label: 'Blusas recién llegadas',
      product: 'Blusa Gasa Marfil'
    }, {
      label: 'Bodys · envío gratis',
      product: 'Body Encaje Crema'
    }],
    onSlideClick: s => onCarousel(s.product)
  })), /*#__PURE__*/React.createElement(NewArrivals, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(About, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(Reassurance, null), /*#__PURE__*/React.createElement(Newsletter, null));
}
Object.assign(window, {
  Home,
  Section,
  Sparkle,
  Hero,
  Categories,
  NewArrivals,
  About,
  Reassurance,
  Newsletter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/anlu-store/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/anlu-store/data.js
try { (() => {
window.ANLU = {
  phone: '573201234567',
  categories: ['Blusas', 'Bodys', 'Trajes de baño', 'Vestidos', 'Jeans', 'Pijamas'],
  products: [{
    name: 'Vestido Lila Satinado',
    price: '$159.900',
    category: 'Vestidos',
    badge: 'Nuevo',
    stock: 'disponible',
    colors: ['Lila', 'Violeta']
  }, {
    name: 'Blusa Gasa Marfil',
    price: '$89.900',
    category: 'Blusas',
    badge: 'Nuevo',
    stock: 'disponible',
    colors: ['Marfil', 'Crema']
  }, {
    name: 'Body Encaje Crema',
    price: '$74.900',
    category: 'Bodys',
    stock: 'disponible',
    colors: ['Crema', 'Negro']
  }, {
    name: 'Bikini Lavanda',
    price: '$119.900',
    category: 'Trajes de baño',
    badge: 'Nuevo',
    stock: 'agotado',
    colors: ['Lila', 'Azul claro']
  }, {
    name: 'Jean Wide Leg Claro',
    price: '$149.900',
    category: 'Jeans',
    stock: 'disponible',
    colors: ['Azul claro']
  }, {
    name: 'Pijama Satén Lila',
    price: '$129.900',
    category: 'Pijamas',
    badge: 'Nuevo',
    stock: 'disponible',
    colors: ['Lila', 'Perla']
  }, {
    name: 'Vestido Floral Midi',
    price: '$169.900',
    category: 'Vestidos',
    stock: 'disponible',
    colors: ['Floral', 'Lila']
  }, {
    name: 'Blusa Manga Globo',
    price: '$99.900',
    category: 'Blusas',
    stock: 'agotado',
    colors: ['Marfil', 'Lila']
  }, {
    name: 'Body Drapeado Violeta',
    price: '$84.900',
    category: 'Bodys',
    badge: 'Nuevo',
    stock: 'disponible',
    colors: ['Violeta', 'Negro']
  }, {
    name: 'Enterizo de Baño Crema',
    price: '$139.900',
    category: 'Trajes de baño',
    stock: 'disponible',
    colors: ['Crema', 'Negro']
  }, {
    name: 'Jean Skinny Tiro Alto',
    price: '$139.900',
    category: 'Jeans',
    stock: 'disponible',
    colors: ['Azul claro', 'Negro']
  }, {
    name: 'Pijama Algodón Perla',
    price: '$109.900',
    category: 'Pijamas',
    stock: 'disponible',
    colors: ['Perla', 'Lila']
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/anlu-store/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Carousel = __ds_scope.Carousel;

__ds_ns.CategoryCircle = __ds_scope.CategoryCircle;

__ds_ns.FeatureItem = __ds_scope.FeatureItem;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.ProductOptionsModal = __ds_scope.ProductOptionsModal;

__ds_ns.PromoBanner = __ds_scope.PromoBanner;

__ds_ns.SelectionBar = __ds_scope.SelectionBar;

__ds_ns.WhatsAppButton = __ds_scope.WhatsAppButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.GoldDivider = __ds_scope.GoldDivider;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.PhotoFrame = __ds_scope.PhotoFrame;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Input = __ds_scope.Input;

})();
