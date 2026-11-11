(() => {
  const hero = document.querySelector('.renew-hero');
  if (!hero) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  const paint = () => {
    queued = false;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    hero.style.setProperty('--hero-depth', `${motion.matches ? 0 : progress * (innerWidth < 641 ? 7 : 14)}px`);
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  motion.addEventListener('change', schedule);
  paint();
})();
