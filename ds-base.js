// Loads this design system into the template. Points at the _ds folder at the
// project root — shared by both index.html and tienda.html.
(() => {
  const base = '_ds/anlu-store-design-system-2c194479-cd54-4629-9aa2-2697cfd8dd88';
  for (const p of ["tokens/fonts.css","tokens/colors.css","tokens/typography.css","tokens/spacing.css","tokens/radius-shadow.css","tokens/motion.css","tokens/base.css","styles.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src);
  document.head.appendChild(s);
})();
