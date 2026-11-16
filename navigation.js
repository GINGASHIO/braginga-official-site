(() => {
  const header = document.querySelector('.site-header');
  const button = header?.querySelector('[data-menu-button]');
  const nav = header?.querySelector('[data-site-nav]');
  if (!button || !nav) return;

  const compact = matchMedia('(max-width: 1100px)');
  const label = button.querySelector('.menu-label');
  const setOpen = (open, returnFocus = false) => {
    const expanded = compact.matches && open;
    nav.classList.toggle('is-open', expanded);
    nav.inert = compact.matches && !expanded;
    button.setAttribute('aria-expanded', String(expanded));
    label.textContent = expanded ? '閉じる' : 'メニュー';
    if (returnFocus) button.focus();
  };
  document.documentElement.classList.add('nav-ready');
  setOpen(false);
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  header.addEventListener('focusout', () => {
    requestAnimationFrame(() => { if (!header.contains(document.activeElement)) setOpen(false); });
  });
  compact.addEventListener('change', () => setOpen(false));

  const syncCurrent = () => {
    const homeSections = { '#product': 'products', '#case': 'cases', '#order': 'order', '#faq': 'faq', '#contact': 'contact' };
    const page = document.body.dataset.page;
    const sports = document.body.classList.contains('sports-feature-page');
    const productDetail = document.body.hasAttribute('data-product-no');
    const consultation = page === 'estimate' && location.hash === '#quick';
    const section = page === 'home' || page === 'trophy' || sports || productDetail || consultation;
    const key = page === 'home' ? homeSections[location.hash]
      : sports ? 'collections'
      : page === 'trophy' ? 'products'
      : consultation ? 'contact'
      : page;
    nav.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === key) link.setAttribute('aria-current', section ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    });
  };
  syncCurrent();
  window.addEventListener('hashchange', syncCurrent);
})();
