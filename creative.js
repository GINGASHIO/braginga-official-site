(() => {
  const ownScript = document.currentScript;
  const base = new URL('./', ownScript.src);
  const url = path => new URL(path, base).href;
  const directions = {
    brand: ['01 — BRAND & MERCH', 'ロゴの先に、\nブランドらしさを。', 'Tシャツ、スウェット、バッグ。素材やシルエット、加工の組み合わせで、手に取りたくなるコレクションへ。', 'product-range.png', 'products/index.html', 'アイテムと価格を見る ↗', 'ブランド・物販'],
    team: ['02 — TEAM & SHOP', '揃えることで、\nチームになる。', 'ユニフォーム、店舗ウェア、スタッフの一着。色や着心地まで考えて、その場所らしいスタイルを作ります。', 'case-studies.png', 'products/index.html?category=ビブス#lineup', 'チーム向け商品を見る ↗', 'チーム・店舗ウェア'],
    event: ['03 — EVENT & MEMORY', 'その日の熱を、\n持ち帰れるものに。', 'タオルやバッグ、記念グッズ、表彰品。使うたびにあの日を思い出す、イベントの余韻を形に。', 'trophy/works/work-14.jpg', 'trophy/index.html', 'トロフィー・表彰品を見る ↗', 'イベント・記念品']
  };
  document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => {
    const d = directions[button.dataset.direction];
    document.querySelectorAll('[data-direction]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    ['number', 'title', 'description'].forEach((key, i) => { const el = document.querySelector(`[data-direction-${key}]`); el.textContent = d[i]; if (key === 'title') el.style.whiteSpace = 'pre-line'; });
    const img = document.querySelector('[data-direction-image]'); img.src = url('assets/images/' + d[3]); img.alt = d[6] + 'の制作イメージ';
    const link = document.querySelector('[data-direction-link]'); link.href = url(d[4]); link.textContent = d[5];
    document.querySelector('[data-direction-consult]').href = 'mailto:info@ginga-bra.com?subject=' + encodeURIComponent(d[6] + 'のご相談');
  }));
  const dock = document.createElement('aside'); dock.className = 'project-dock'; dock.setAttribute('aria-label', '制作のご相談');
  const isTrophy = document.body.dataset.page === 'trophy';
  dock.innerHTML = `<span>制作のご相談はこちら</span><a href="${isTrophy ? '#catalog' : url('estimate/index.html#auto')}">${isTrophy ? '商品を見る ↓' : '簡易見積もり ↗'}</a><a href="mailto:info@ginga-bra.com">メールで相談 ↗</a>`;
  document.body.append(dock);
  const gallery = document.querySelector('.trophy-works-grid');
  if (gallery) {
    const controls = document.createElement('div');controls.className = 'gallery-controls';
    controls.innerHTML = '<span>スワイプ・矢印で次の実績へ</span><button type="button" aria-label="前の制作実績">← 前へ</button><button type="button" aria-label="次の制作実績">次へ →</button>';
    gallery.after(controls);
    controls.querySelectorAll('button').forEach((button, i) => button.addEventListener('click', () => gallery.scrollBy({left:gallery.firstElementChild.getBoundingClientRect().width * (i ? 1 : -1) + (i ? 22 : -22),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})));
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('creative-enter');observer.unobserve(entry.target);}}), {threshold:.12});
    document.querySelectorAll('.creative-heading,.direction-stage,.list-section-head,.trophy-point,.case-study,.public-product-card').forEach(el => observer.observe(el));
  }
})();
