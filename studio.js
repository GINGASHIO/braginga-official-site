(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-home-carousel]').forEach(carousel => {
    const controls = carousel.closest('.home-carousel-section').querySelector('[data-carousel-controls]');
    const [first, second] = carousel.children;
    if (!controls || !second) return;

    const previous = controls.querySelector('[data-carousel-prev]');
    const next = controls.querySelector('[data-carousel-next]');
    const syncControls = () => {
      const end = carousel.scrollWidth - carousel.clientWidth;
      controls.hidden = end < 2;
      previous.setAttribute('aria-disabled', String(carousel.scrollLeft < 2));
      next.setAttribute('aria-disabled', String(end - carousel.scrollLeft < 2));
    };
    const move = (direction, button) => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      carousel.scrollBy({
        left: direction * (second.offsetLeft - first.offsetLeft),
        behavior: reduced.matches ? 'instant' : 'smooth',
      });
    };
    previous.addEventListener('click', () => move(-1, previous));
    next.addEventListener('click', () => move(1, next));
    carousel.addEventListener('scroll', syncControls, { passive: true });
    window.addEventListener('resize', syncControls);
    syncControls();
  });
  const slides = [...document.querySelectorAll('.hero-slide')];
  let selectionRequest = 0;
  const imageStatus = document.createElement('p');
  imageStatus.className = 'hero-image-status';
  imageStatus.setAttribute('role', 'status');
  document.querySelector('.studio-visual')?.append(imageStatus);
  document.querySelectorAll('[data-hero-select]').forEach(button => button.addEventListener('click', async () => {
    const request = ++selectionRequest;
    const index = Number(button.dataset.heroSelect);
    const target = slides[index];
    button.setAttribute('aria-busy', 'true');
    try {
      if (target.dataset.src && !target.getAttribute('src')) target.src = target.dataset.src;
      if (!target.complete || !target.naturalWidth) await target.decode();
      if (request !== selectionRequest) return;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      document.querySelectorAll('[data-hero-select]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      imageStatus.textContent = '';
    } catch {
      if (request === selectionRequest) imageStatus.textContent = '画像を読み込めませんでした。時間をおいて、もう一度お選びください。';
    } finally {
      button.removeAttribute('aria-busy');
    }
  }));
  const tabs = document.querySelector('.direction-tabs');
  if (tabs) {
    const buttons = [...tabs.querySelectorAll('button')];
    const syncTab = () => {
      const button = buttons.find(b => b.getAttribute('aria-pressed') === 'true');
      tabs.style.setProperty('--tab-left', `${button.offsetLeft}px`);
      tabs.style.setProperty('--tab-width', `${button.offsetWidth}px`);
    };
    tabs.addEventListener('click', e => {
      if (!e.target.closest('button')) return;
      syncTab();
      if (!reduced.matches) {
        const copy = document.querySelector('.direction-copy');
        copy.getAnimations().forEach(a => a.cancel());
        copy.animate([{opacity:.45,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
      }
    });
    tabs.addEventListener('keydown', e => {
      const i=buttons.indexOf(document.activeElement);
      if(i<0 || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
      buttons[next].focus();buttons[next].click();
    });
    if ('ResizeObserver' in window) new ResizeObserver(syncTab).observe(tabs);
    else window.addEventListener('resize', syncTab);
    syncTab();
  }
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if(!reduced.matches) entry.target.classList.add('studio-revealed');
      reveal.unobserve(entry.target);
    }),{threshold:.12});
    document.querySelectorAll('.reveal,.studio-process>div,.sub-hero h1,.estimate-hero h1').forEach(el => reveal.observe(el));
    const replay=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting && entry.intersectionRatio>=.2)entry.target.classList.add('is-playing');
      else if(!entry.isIntersecting)entry.target.classList.remove('is-playing');
    }),{threshold:[0,.2]});
    document.querySelectorAll('[data-replay-steps]').forEach(el=>replay.observe(el));
  }
})();
