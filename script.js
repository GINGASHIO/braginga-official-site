const products = [
  {
    slug: "t-shirt",
    label: "T-SHIRT",
    title: "Tシャツ",
    text: "イベント、店舗、チーム、ブランドの定番アイテム。シルク、DTF、転写など仕様別に展開。",
    image: "./assets/images/product-range.png",
  },
  {
    slug: "sweat",
    label: "SWEAT",
    title: "スウェット",
    text: "フーディー、クルーネック、パンツなど秋冬商材やブランドOEMに対応。",
    image: "./assets/images/case-studies.png",
  },
  {
    slug: "teamwear",
    label: "TEAM WEAR",
    title: "チームウェア",
    text: "ユニフォームやビブスに、チーム名・背番号・個人名を。用途に合わせた仕様で制作します。",
    image: "./assets/images/hero-print-workshop.png",
  },
  {
    slug: "goods",
    label: "GOODS",
    title: "小物・雑貨",
    text: "バッグ、キャップ、タオルなど販促・物販・ノベルティ向けアイテム。",
    image: "./assets/images/product-range.png",
  },
  {
    slug: "silk-screen",
    label: "SCREEN PRINT",
    title: "シルク印刷",
    text: "まとまった数量や色の再現性を重視する案件に適した、定番のプリント方法です。",
    image: "./assets/images/case-studies.png",
  },
  {
    slug: "dtf",
    label: "DTF PRINT",
    title: "DTFプリント",
    text: "多色のイラストや細かいデザインをウェアへ。商品・数量に合わせて加工をご案内します。",
    image: "./assets/images/hero-print-workshop.png",
  },
  {
    slug: "sublimation",
    label: "SUBLIMATION",
    title: "昇華プリント",
    text: "ユニフォームやビブスの全面にデザインを。色・柄を活かしたスポーツウェアを制作します。",
    image: "./assets/images/product-range.png",
  },
  {
    slug: "oem",
    label: "OEM",
    title: "ブランドOEM",
    text: "ネーム、下げ札、梱包、海外生産などを含む事業者向け相談窓口。",
    image: "./assets/images/case-studies.png",
  },
];

const cases = [
  {
    label: "BtoB / SPORTS PARTNERSHIP",
    title: "ウォッシャブルマスク",
    type: "企画・デザイン",
    item: "スポンサー×チーム",
    image: "./assets/images/case-studies.png",
  },
  {
    label: "BtoB + BtoC / RETAIL",
    title: "HALF TIME COFFEE",
    type: "物販企画",
    item: "コーヒー / マグカップ",
    image: "./assets/images/product-range.png",
  },
  {
    label: "SUPPORTER GOODS",
    title: "オリジナルエコバッグ",
    type: "仕様設計・生産",
    item: "日常使い×チーム愛",
    image: "./assets/images/hero-print-workshop.png",
  },
];

const productGrid = document.querySelector("[data-products]");
const productDestinations = {
  "t-shirt": "./estimate/index.html?category=Tシャツ#auto",
  sweat: "./estimate/index.html?category=トレーナー#auto",
  teamwear: "./products/index.html?category=ビブス#lineup",
  goods: "./products/index.html#lineup",
  "silk-screen": "./estimate/index.html#quick",
  dtf: "./estimate/index.html#quick",
  sublimation: "./estimate/index.html#quick",
  oem: "./estimate/index.html#quick",
};

if (productGrid) {
  productGrid.innerHTML = products
    .map(
      (product, index) => `
        <article class="product-card reveal" style="--reveal-delay: ${index * 70}ms">
          <a class="list-card-link" href="${productDestinations[product.slug]}" aria-label="${product.title}の商品・見積りへ">
            <figure class="list-card-media">
              <img loading="lazy" decoding="async" src="${product.image}" alt="${product.title}の製品イメージ">
            </figure>
            <span>${product.label}</span>
            <h3>${product.title}</h3>
            <p>${product.text}</p>
          </a>
        </article>
      `
    )
    .join("");
}

// Keep only this tab's browsing and drafts. Storage can be unavailable in private mode.
const sessionRead = (key, fallback = null) => {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const sessionWrite = (key, value) => {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Browsing still works without storage. */ }
};
const comparisonKey = 'braginga.catalog.compare.v1';
const estimatorDraftKey = 'braginga.estimate.v1';
const consultationDraftKey = 'braginga.consultation.v1';
const allowedCatalogPaths = new Set(['/products/', '/products/index.html', '/sports/', '/sports/index.html']);
const sportsScenes = { 'sports-cheering': '応援', 'sports-merch': 'チーム物販', 'sports-awards': '卒団・表彰' };
const safeCatalogReturn = value => {
  if (typeof value !== 'string' || value.length > 1500) return null;
  try {
    const url = new URL(value, location.origin);
    if (url.origin !== location.origin || !allowedCatalogPaths.has(url.pathname)) return null;
    const clean = new URL(url.pathname, location.origin);
    ['q', 'category', 'use', 'scene'].forEach(key => {
      const text = url.searchParams.get(key);
      if (text) clean.searchParams.set(key, text.slice(0, 120));
    });
    const sports = url.pathname.startsWith('/sports');
    const sportsSection = sports && Object.hasOwn(sportsScenes, url.hash.slice(1));
    clean.hash = /^#product-\d{2,}$/.test(url.hash) || sportsSection ? url.hash : (sports ? '#sports-lineup' : '#lineup');
    return `${clean.pathname}${clean.search}${clean.hash}`;
  } catch { return null; }
};
const catalogReturn = safeCatalogReturn(new URLSearchParams(location.search).get('return'));
if (catalogReturn) {
  document.querySelectorAll('[data-catalog-return]').forEach(link => { link.href = catalogReturn; });
  document.querySelectorAll('.detail-related-card').forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set('return', catalogReturn);
    link.href = url.href;
  });
}
const publicCatalogItems = (window.estimateCatalog?.products || []).filter(item => !item.provisional || item.published);
const publicProductGrid = document.querySelector('[data-public-product-grid]');
const askForPrice = item => item.priceStatus === 'temporary';
const findCatalogProduct = (items, number) => Number.isSafeInteger(number)
  ? items.find(item => item.no === number || item.legacyNumbers?.includes(number))
  : undefined;

if (publicProductGrid) {
  const filters = document.querySelector('[data-catalog-filter]');
  if (filters) {
    const search = filters.querySelector('[data-catalog-search]');
    const category = filters.querySelector('[data-catalog-category]');
    const useCaseButtons = [...filters.querySelectorAll('[data-catalog-use-case]')];
    const categoryButtons = [...filters.querySelectorAll('[data-catalog-category-tag]')];
    const sceneLinks = [...document.querySelectorAll('[data-catalog-scene]')];
    const activeScene = filters.querySelector('[data-catalog-active-scene]');
    const count = filters.querySelector('[data-catalog-count]');
    const empty = document.querySelector('[data-catalog-empty]');
    const sceneLabels = { restaurant: '飲食店', promo: '企業ノベルティ・販促', sports: 'スポーツ', graduation: '卒業記念・記念品', ...sportsScenes };
    const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase('ja-JP').trim();
    const products = [...publicProductGrid.querySelectorAll('.public-product-card')].map(card => ({
      card,
      category: card.dataset.category || '',
      useCases: (card.dataset.useCases || '').split(/\s+/).filter(Boolean),
      scenes: (card.dataset.scenes || '').split(/\s+/).filter(Boolean),
      searchText: normalize(`${card.textContent} ${card.dataset.category || ''} ${card.dataset.searchAliases || ''}`),
    }));
    let selectedUseCase = '';
    let selectedScene = '';
    const matchesScope = product =>
      (!selectedUseCase || product.useCases.includes(selectedUseCase)) &&
      (!selectedScene || product.scenes.includes(selectedScene));
    const syncCategories = (previous = category.value) => {
      const names = [...new Set(products.filter(matchesScope).map(product => product.category).filter(Boolean))];
      category.replaceChildren(new Option('すべての品目', ''), ...names.map(name => new Option(name, name)));
      category.value = names.includes(previous) ? previous : '';
      categoryButtons.forEach(button => { button.disabled = !names.includes(button.dataset.catalogCategoryTag); });
    };
    const readState = params => ({
      q: (params.get('q') || '').slice(0, 120),
      category: params.get('category') || '',
      use: params.get('use') || '',
      scene: params.get('scene') || '',
    });
    const filterProducts = () => {
      const query = normalize(search.value);
      const terms = query.split(/\s+/).filter(Boolean);
      useCaseButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.catalogUseCase === selectedUseCase && !selectedScene)));
      categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.catalogCategoryTag === category.value)));
      sceneLinks.forEach(link => {
        const active = link.dataset.catalogScene === selectedScene;
        if (link.tagName === 'BUTTON') link.setAttribute('aria-pressed', String(active));
        else if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      if (activeScene) {
        activeScene.textContent = selectedScene ? `利用シーン：${sceneLabels[selectedScene]}` : '';
        activeScene.hidden = !selectedScene;
      }
      let visible = 0;
      products.forEach(product => {
        const matches = matchesScope(product) && (!category.value || product.category === category.value) && terms.every(term => product.searchText.includes(term));
        product.card.hidden = !matches;
        if (matches) visible += 1;
      });
      count.textContent = `${visible}件 / 全${products.length}件`;
      if (empty) empty.hidden = visible !== 0;
      const state = { q: search.value.slice(0, 120), category: category.value, use: selectedUseCase, scene: selectedScene };
      const url = new URL(location.href);
      Object.entries(state).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
      url.searchParams.delete('restore');
      history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
      products.forEach(product => {
        const link = product.card.querySelector('.product-name-link');
        if (!link) return;
        const detail = new URL(link.href);
        detail.searchParams.set('return', `${url.pathname}${url.search}#${product.card.id}`);
        link.href = detail.href;
      });
      document.dispatchEvent(new CustomEvent('braginga:catalog-filter-change'));
    };
    const applyState = state => {
      selectedUseCase = ['スポーツ', '飲食店'].includes(state.use) ? state.use : '';
      selectedScene = Object.hasOwn(sceneLabels, state.scene) ? state.scene : '';
      if (Object.hasOwn(sportsScenes, selectedScene)) selectedUseCase = 'スポーツ';
      if (selectedScene === 'restaurant') { selectedUseCase = '飲食店'; selectedScene = ''; }
      if (selectedScene === 'sports') { selectedUseCase = 'スポーツ'; selectedScene = ''; }
      search.value = typeof state.q === 'string' ? state.q.slice(0, 120) : '';
      syncCategories(typeof state.category === 'string' ? state.category : '');
      filterProducts();
    };
    useCaseButtons.forEach(button => button.addEventListener('click', () => {
      selectedUseCase = button.dataset.catalogUseCase;
      selectedScene = '';
      syncCategories();
      filterProducts();
    }));
    categoryButtons.forEach(button => button.addEventListener('click', () => {
      const name = button.dataset.catalogCategoryTag;
      category.value = category.value === name ? '' : name;
      filterProducts();
    }));
    sceneLinks.forEach(link => link.addEventListener('click', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      applyState({ q: search.value, category: category.value, use: link.dataset.catalogSceneUseCase || '', scene: selectedScene === link.dataset.catalogScene ? '' : link.dataset.catalogScene });
    }));
    search.addEventListener('input', filterProducts);
    category.addEventListener('change', filterProducts);
    document.querySelectorAll('[data-catalog-reset]').forEach(button => button.addEventListener('click', () => {
      applyState({});
      search.focus({ preventScroll: true });
    }));
    applyState(readState(new URLSearchParams(location.search)));
    window.addEventListener('popstate', () => applyState(readState(new URLSearchParams(location.search))));
    filters.hidden = false;
  }
}

// Comparison is optional, lives in the page flow and never covers a product or CTA.
const compareButtons = [...document.querySelectorAll('[data-compare-product]')];
if (compareButtons.length && publicCatalogItems.length) {
  let selected = [];
  const loadComparison = () => {
    const stored = sessionRead(comparisonKey, []);
    const numbers = Array.isArray(stored) ? stored.map(no => findCatalogProduct(publicCatalogItems, no)?.no) : [];
    selected = [...new Set(numbers.filter(Number.isSafeInteger))].slice(0, 3);
  };
  loadComparison();
  const region = document.createElement('section');
  region.className = 'catalog-comparison';
  region.id = 'product-comparison';
  region.setAttribute('aria-label', '選んだ商品の比較');
  region.innerHTML = '<p class="comparison-status" role="status" aria-live="polite" data-comparison-status></p><details data-comparison-details hidden><summary data-comparison-summary>商品を比較する</summary><div class="comparison-heading"><p>価格・最低ロット・仕様を見比べられます（最大3点）。</p><button type="button" data-comparison-clear>すべて外す</button></div><div class="comparison-grid" data-comparison-grid></div></details>';
  if (publicProductGrid) publicProductGrid.before(region);
  else document.querySelector('.detail-related')?.before(region);
  compareButtons.forEach(button => {
    const jump = document.createElement('a');
    jump.className = 'comparison-jump'; jump.href = '#product-comparison'; jump.hidden = true;
    jump.dataset.comparisonJump = button.dataset.compareProduct;
    jump.textContent = '比較を見る';
    jump.addEventListener('click', () => { region.querySelector('details').open = true; });
    button.after(jump);
  });
  const details = region.querySelector('[data-comparison-details]');
  const grid = region.querySelector('[data-comparison-grid]');
  const summary = region.querySelector('[data-comparison-summary]');
  const status = region.querySelector('[data-comparison-status]');
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const syncComparisonLink = link => {
    const no = Number(link.dataset.comparisonProductLink);
    const base = publicProductGrid ? safeCatalogReturn(`${location.pathname}${location.search}`) : catalogReturn;
    const target = new URL(link.href);
    target.searchParams.delete('return');
    if (base) {
      const returnUrl = new URL(base, location.origin);
      const card = publicProductGrid?.querySelector(`[data-product-no="${no}"]`);
      if (card && !card.hidden) returnUrl.hash = `#${card.id}`;
      target.searchParams.set('return', `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`);
    }
    link.href = target.href;
  };
  document.addEventListener('braginga:catalog-filter-change', () => {
    grid.querySelectorAll('[data-comparison-product-link]').forEach(syncComparisonLink);
  });
  const updateComparison = (message = '') => {
    const focusedRemove = document.activeElement?.dataset.compareRemove;
    details.hidden = selected.length === 0;
    summary.textContent = `選んだ商品を比較する（${selected.length} / 3点）`;
    status.textContent = message;
    compareButtons.forEach(button => {
      const no = Number(button.dataset.compareProduct);
      const item = publicCatalogItems.find(product => product.no === no);
      const active = selected.includes(no);
      button.hidden = false;
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${item?.name || 'この商品'}を比較${active ? 'から外す' : 'に追加'}`);
      button.textContent = active ? '✓ 比較に選択中' : '＋ 比較に追加';
      const jump = button.nextElementSibling;
      if (jump?.matches('[data-comparison-jump]')) { jump.hidden = !active; jump.textContent = `比較を見る（${selected.length}点）`; }
    });
    grid.replaceChildren();
    selected.forEach(no => {
      const item = publicCatalogItems.find(product => product.no === no);
      const ask = askForPrice(item);
      const card = element('article', undefined, 'comparison-item');
      const heading = element('h3');
      const link = element('a', item.name);
      link.href = `../products/item-${String(no).padStart(2, '0')}.html`;
      link.dataset.comparisonProductLink = String(no);
      syncComparisonLink(link);
      heading.append(link);
      card.append(heading);
      const list = element('dl');
      const price = ask ? 'ASK' : Number.isFinite(item.price) ? `¥${item.price.toLocaleString('ja-JP')}（税抜）` : '個別確認';
      const lot = ask ? 'ASK' : Number.isFinite(item?.lot) ? `${item.lot}点〜` : '個別確認';
      const values = [
        [ask ? '価格' : '参考上代 / 1点', price], ['最低ロット', lot],
        ['サイズ', item.size || '個別確認'], ['仕様', item.spec || '個別確認'], ['納期目安', item.lead || '個別確認'],
      ];
      values.forEach(([label, value]) => {
        const row = element('div'); row.append(element('dt', label), element('dd', value)); list.append(row);
      });
      card.append(list);
      const actions = element('div', undefined, 'comparison-actions');
      if (!ask) {
        const estimate = element('a', '簡易見積もり →');
        estimate.href = `../estimate/index.html?product=${no}#auto`;
        actions.append(estimate);
      }
      const consult = element('a', 'メールで相談 →'); consult.href = `../estimate/index.html?product=${no}#quick`; consult.dataset.consultProduct = String(no);
      const remove = element('button', '比較から外す'); remove.type = 'button'; remove.dataset.compareRemove = String(no); remove.setAttribute('aria-label', `${item.name}を比較から外す`);
      actions.append(consult, remove); card.append(actions); grid.append(card);
    });
    if (focusedRemove && selected.length) (grid.querySelector(`[data-compare-remove="${focusedRemove}"]`) || grid.querySelector('[data-compare-remove]'))?.focus({ preventScroll: true });
    sessionWrite(comparisonKey, selected);
  };
  const focusComparisonFallback = no => {
    const visible = compareButtons.filter(button => !button.closest('[hidden]'));
    const target = visible.find(button => Number(button.dataset.compareProduct) === no) || visible[0] || document.querySelector('[data-catalog-search]');
    target?.focus({ preventScroll: true });
  };
  const removeFromComparison = no => {
    const item = publicCatalogItems.find(product => product.no === no);
    selected = selected.filter(value => value !== no);
    updateComparison(`${item?.name || '商品'}を比較から外しました。`);
    if (!selected.length) focusComparisonFallback(no);
  };
  compareButtons.forEach(button => button.addEventListener('click', () => {
    const no = Number(button.dataset.compareProduct);
    if (selected.includes(no)) return removeFromComparison(no);
    if (selected.length >= 3) {
      status.textContent = '比較は3点までです。選択中の商品を1点外してから追加してください。';
      details.open = true;
      summary.focus();
      return;
    }
    selected.push(no);
    updateComparison(`${publicCatalogItems.find(item => item.no === no)?.name}を比較に追加しました。${selected.length}点選択中です。`);
  }));
  region.querySelector('[data-comparison-clear]').addEventListener('click', () => {
    selected = []; updateComparison('比較リストを空にしました。'); focusComparisonFallback();
  });
  grid.addEventListener('click', event => {
    const remove = event.target.closest('[data-compare-remove]');
    if (remove) removeFromComparison(Number(remove.dataset.compareRemove));
  });
  window.addEventListener('pageshow', () => { loadComparison(); updateComparison(); });
  updateComparison();
}

// Carry a chosen quantity to consultation when returning from a calculator.
document.addEventListener('click', event => {
  const link = event.target.closest('[data-consult-product]');
  if (!link) return;
  const draft = sessionRead(estimatorDraftKey);
  const product = findCatalogProduct(publicCatalogItems, draft?.productNo);
  if (product?.no !== Number(link.dataset.consultProduct)) return;
  const quantity = Number(draft.quantity);
  if (String(draft.quantity).trim() !== '' && Number.isSafeInteger(quantity) && quantity > 0) {
    const url = new URL(link.href);
    url.searchParams.set('quantity', String(quantity));
    link.href = url.href;
  }
});

document.querySelectorAll('[data-product-gallery]').forEach(gallery => {
  const track = gallery.querySelector('[data-gallery-track]');
  const controls = gallery.querySelector('[data-gallery-controls]');
  const previous = controls.querySelector('[data-gallery-prev]');
  const next = controls.querySelector('[data-gallery-next]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const syncControls = () => {
    const end = track.scrollWidth - track.clientWidth;
    controls.hidden = end < 2;
    previous.setAttribute('aria-disabled', String(track.scrollLeft < 2));
    next.setAttribute('aria-disabled', String(end - track.scrollLeft < 2));
  };
  [[previous, -1], [next, 1]].forEach(([button, direction]) => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      const distance = track.firstElementChild.getBoundingClientRect().width +
        (parseFloat(getComputedStyle(track).columnGap) || 0);
      track.scrollBy({left: distance * direction, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    });
  });
  track.addEventListener('scroll', syncControls, {passive: true});
  window.addEventListener('resize', syncControls);
  syncControls();

  const dialog = gallery.querySelector('dialog');
  if (typeof dialog.showModal !== 'function') return;
  const links = [...gallery.querySelectorAll('[data-gallery-photo]')];
  const image = dialog.querySelector('[data-gallery-preview]');
  const position = dialog.querySelector('[data-gallery-position]');
  let opener;
  let current = 0;
  const showPhoto = index => {
    current = (index + links.length) % links.length;
    const link = links[current];
    image.alt = link.querySelector('img').alt;
    image.src = link.href;
    position.textContent = `${current + 1} / ${links.length}`;
  };
  links.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      showPhoto(index);
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-gallery-view-prev]').addEventListener('click', () => showPhoto(current - 1));
  dialog.querySelector('[data-gallery-view-next]').addEventListener('click', () => showPhoto(current + 1));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  dialog.addEventListener('close', () => opener?.focus({preventScroll: true}));
});

const caseTrack = document.querySelector("[data-case-track]");

if (caseTrack) {
  caseTrack.innerHTML = cases
    .map(
      (caseItem, index) => `
        <article class="case-card reveal" style="--reveal-delay: ${index * 90}ms">
          <a class="list-card-link" href="./cases/index.html" aria-label="${caseItem.title}の制作実績へ">
            <figure class="list-card-media">
              <img loading="lazy" decoding="async" src="${caseItem.image}" alt="${caseItem.title}の制作イメージ">
            </figure>
            <span>${caseItem.label}</span>
            <h3>${caseItem.title}</h3>
            <p>${caseItem.type} / ${caseItem.item}</p>
          </a>
        </article>
      `
    )
    .join("");
}

const header = document.querySelector("[data-header]");
const pageIntro = document.querySelector("[data-page-intro]");
const pageProgress = document.querySelector("[data-page-progress]");
const heroSlides = document.querySelectorAll(".hero-slide");
let currentHeroIndex = 0;

window.addEventListener("load", () => {
  window.setTimeout(() => pageIntro?.classList.add("is-finished"), 500);
});



const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  if (pageProgress) pageProgress.style.transform = `scaleX(${progress})`;

  const visual = document.querySelector(".visual-band img");
  if (visual && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const rect = visual.getBoundingClientRect();
    const offset = Math.max(-50, Math.min(50, (window.innerHeight / 2 - rect.top) * 0.045));
    visual.style.transform = `translate3d(0, ${offset}px, 0)`;
  }
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const revealTargets = document.querySelectorAll(".reveal");
if ('IntersectionObserver' in window) {
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach((target) => observer.observe(target));

}

const yen = (value) => `¥${Math.round(value).toLocaleString("ja-JP")}`;
function setupTextCopy(button, preview, status, getText) {
  if (!button || !preview || !status) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'コピーしました。';
    } catch {
      preview.value = text;
      preview.hidden = false;
      const details = preview.closest('details');
      if (details) details.open = true;
      preview.focus();
      preview.select();
      status.textContent = '選択した文章を手動でコピーしてください。';
    }
  });
}

const autoEstimate = document.querySelector("[data-auto-estimate]");

if (autoEstimate) {
  const catalog = window.estimateCatalog || { categories: [], products: [] };
  const categorySelect = autoEstimate.querySelector("[data-estimate-category]");
  const productSelect = autoEstimate.querySelector("[data-estimate-product]");
  const quantityInput = autoEstimate.querySelector("[data-estimate-quantity]");

  const estimateParams = new URLSearchParams(window.location.search);
  const savedEstimate = sessionRead(estimatorDraftKey);
  const requestedProductNo = /^\d+$/.test(estimateParams.get('product') || '') ? Number(estimateParams.get('product')) : null;
  const explicitProduct = findCatalogProduct(catalog.products, requestedProductNo);
  const savedProduct = findCatalogProduct(catalog.products, savedEstimate?.productNo);
  const requestedCategory = estimateParams.get('category');
  const requestedProduct = explicitProduct || (!requestedCategory && !estimateParams.has('product') ? savedProduct : null);
  categorySelect.replaceChildren(...catalog.categories.map(category => new Option(category, category)));
  if (catalog.categories.includes(requestedCategory)) categorySelect.value = requestedCategory;
  if (requestedProduct) {
    categorySelect.value = requestedProduct.category;
    if (askForPrice(requestedProduct)) quantityInput.value = '';
    else if (Number.isFinite(requestedProduct.lot)) quantityInput.value = String(requestedProduct.lot);
  }

  const chosenProduct = () => productSelect.value === '' ? undefined : catalog.products[Number(productSelect.value)];

  const syncProducts = () => {
    const products = catalog.products.filter((item) => item.category === categorySelect.value);
    productSelect.replaceChildren(new Option('商品を選択してください', ''), ...products.map(item => {
      const label = askForPrice(item) ? '（ASK）'
        : item.provisional || item.priceStatus === 'individual' ? '（個別見積もり）' : '';
      return new Option(item.name + label, String(catalog.products.indexOf(item)));
    }));
    if (requestedProduct && products.includes(requestedProduct)) {
      productSelect.value = String(catalog.products.indexOf(requestedProduct));
    }
  };

  const shippingInput = autoEstimate.querySelector('[data-estimate-shipping]');
  const otherInput = autoEstimate.querySelector('[data-estimate-other]');
  const copyPreview = autoEstimate.querySelector('[data-estimate-copy-preview]');
  const copyStatus = autoEstimate.querySelector('[data-estimate-copy-status]');
  let estimateText = '';
  const parseFee = input => {
    const text = input.value.trim();
    const value = Number(text);
    const valid = text !== '' && Number.isSafeInteger(value) && value >= 0;
    input.setAttribute('aria-invalid', String(text !== '' && !valid));
    return { value, valid, empty: text === '' };
  };
  const updateEstimate = () => {
    const item = chosenProduct();
    const quantity = Number(quantityInput.value);
    const validQuantity = quantityInput.value.trim() !== '' && Number.isSafeInteger(quantity) && quantity > 0 && (!Number.isFinite(item?.price) || Number.isSafeInteger(item.price * quantity));
    const ask = item && askForPrice(item);
    const hasPrice = item && !ask && !item.provisional && Number.isFinite(item.price) && item.price > 0;
    const belowLot = !ask && validQuantity && Number.isFinite(item?.lot) && quantity < item.lot;
    const invalidQuantity = Boolean(item && !validQuantity && (!ask || quantityInput.value.trim() !== '' || quantityInput.validity.badInput));
    const canEstimate = validQuantity && hasPrice && !belowLot;
    const shipping = parseFee(shippingInput), other = parseFee(otherInput);
    const goods = canEstimate ? item.price * quantity : null;
    const total = canEstimate && shipping.valid && other.valid ? goods + shipping.value + other.value : null;
    const validTotal = total !== null && Number.isSafeInteger(total) && Number.isSafeInteger(Math.round(total * 1.1));
    quantityInput.setAttribute('aria-invalid', String(invalidQuantity));
    const hasSize = item && Object.hasOwn(item, 'size');
    const size = hasSize ? (item.size || '個別確認') : item?.spec;
    const spec = hasSize ? item.spec : item?.notes;
    autoEstimate.querySelector('[data-estimate-spec]').textContent = size || '—';
    autoEstimate.querySelector('[data-estimate-print]').textContent = spec || (item ? '個別確認' : '—');
    autoEstimate.querySelector('[data-estimate-lot]').textContent = ask ? 'ASK' : Number.isFinite(item?.lot) ? `${item.lot}点〜` : item ? '個別に確認' : '—';
    autoEstimate.querySelector('[data-estimate-lead]').textContent = item?.lead || '—';
    autoEstimate.querySelector('[data-estimate-notes]').textContent = item?.notes || '—';
    autoEstimate.querySelector('[data-estimate-unit]').textContent = ask ? 'ASK' : hasPrice ? `${yen(item.price)} / 点` : item ? '個別見積もり' : '—';
    autoEstimate.querySelector('[data-estimate-count]').textContent = item && validQuantity ? `${quantity}点` : '—';
    autoEstimate.querySelector('[data-estimate-goods-subtotal]').textContent = canEstimate ? yen(goods) : item ? '要確認' : '—';
    autoEstimate.querySelector('[data-estimate-subtotal]').textContent = validTotal ? yen(total) : '—';
    autoEstimate.querySelector('[data-estimate-tax]').textContent = validTotal ? yen(total * 1.1) : '—';
    autoEstimate.querySelector('[data-estimate-shipping-amount]').textContent = shipping.valid ? yen(shipping.value) : shipping.empty ? '未定' : '要確認';
    autoEstimate.querySelector('[data-estimate-other-amount]').textContent = other.valid ? yen(other.value) : other.empty ? '未定' : '要確認';
    autoEstimate.querySelector('[data-estimate-formula]').textContent = canEstimate ? `${yen(item.price)} × ${quantity}点 ＋ 送料 ＋ その他費用` : '単価 × 個数 ＋ 送料 ＋ その他費用';
    autoEstimate.querySelector('[data-estimate-price-note]').textContent = !item ? '' : ask ? '価格・最低ロットはメールでご確認いただけます。' : hasPrice ? '2026年公開価格表の参考上代です。' : '価格・最低ロット・納期は未確定です。内容を確認して個別にご案内します。';
    autoEstimate.querySelector('[data-estimate-warning]').textContent = invalidQuantity ? '個数は1以上の整数で入力してください。大きすぎる個数は個別にご相談ください。' : belowLot ? `最低ロットは${item.lot}点です。ロット未満は個別見積もりとなります。` : '';
    autoEstimate.querySelector('[data-estimate-fee-warning]').textContent = (!shipping.empty && !shipping.valid) || (!other.empty && !other.valid) || (total !== null && !validTotal) ? '送料・その他費用は0以上の整数で入力してください。大きすぎる金額は個別にご相談ください。' : '';
    autoEstimate.querySelector('[data-estimate-total-note]').textContent = !item ? '商品を選択してください。' : ask ? 'この商品の価格と最低ロットはメールでご相談ください。' : !canEstimate ? '商品・個数を確認するか、メールでご相談ください。' : validTotal ? '正式な費用は、内容確認後のお見積もりでご案内します。' : '送料・その他費用を入力すると合計を表示します。未定の場合もメールでご相談いただけます。';
    estimateText = `商品：${item?.name || '未定'}\nサイズ：${size || '個別確認'}\n仕様：${spec || '個別確認'}\n個数：${item && validQuantity ? quantity + '点' : '未定・要確認'}\n参考単価（税抜）：${ask ? 'ASK' : hasPrice ? yen(item.price) : '個別確認'}\n商品代金（税抜）：${canEstimate ? yen(goods) : '個別確認'}\n送料（税抜）：${shipping.valid ? yen(shipping.value) : '未定・要確認'}\nその他費用（税抜）：${other.valid ? yen(other.value) : '未定・要確認'}\n合計（税抜）：${validTotal ? yen(total) : '未定・要確認'}${ask ? '\n最低ロット：ASK' : ''}\n\nこの内容で相談します。`;
    if (copyPreview) copyPreview.value = estimateText;
    if (copyStatus) copyStatus.textContent = '';
  };

  const refreshEstimate = () => {
    updateEstimate();
    const item = chosenProduct();
    sessionWrite(estimatorDraftKey, {
      productNo: item?.no ?? null, quantity: quantityInput.value,
      shipping: shippingInput.value, other: otherInput.value,
    });
  };
  categorySelect.addEventListener('change', () => { syncProducts(); refreshEstimate(); });
  productSelect.addEventListener('change', refreshEstimate);
  quantityInput.addEventListener('input', refreshEstimate);
  shippingInput.addEventListener('input', refreshEstimate);
  otherInput.addEventListener('input', refreshEstimate);
  autoEstimate.querySelector('[data-estimate-consult]')?.addEventListener('click', () => {
    const item = chosenProduct();
    if (item) document.dispatchEvent(new CustomEvent('braginga:consult-product', { detail: { productNo: item.no, quantity: quantityInput.value } }));
  });
  setupTextCopy(autoEstimate.querySelector('[data-estimate-copy]'), copyPreview, copyStatus, () => estimateText);
  syncProducts();
  if (requestedProduct && savedProduct === requestedProduct) {
    [['quantity', quantityInput], ['shipping', shippingInput], ['other', otherInput]].forEach(([key, input]) => {
      if (typeof savedEstimate[key] === 'string' && savedEstimate[key].length <= 30) input.value = savedEstimate[key];
    });
  }
  const requestedQuantity = estimateParams.get('quantity');
  if (/^\d+$/.test(requestedQuantity || '') && Number.isSafeInteger(Number(requestedQuantity)) && Number(requestedQuantity) > 0) quantityInput.value = requestedQuantity;
  refreshEstimate();
  if (catalog.products.length) document.querySelector("[data-estimate-fallback]")?.setAttribute("hidden", "");
}

const quickForm = document.querySelector('[data-quick-form]');
if (quickForm) {
  const names = ['item', 'quantity', 'date', 'note'];
  const limits = { item: 200, quantity: 20, date: 100, note: 1500 };
  const fields = Object.fromEntries(names.map(name => [name, quickForm.querySelector(`[name="${name}"]`)]));
  const copyPreview = quickForm.querySelector('[data-consultation-preview]');
  const copyStatus = quickForm.querySelector('[data-consultation-copy-status]');
  const draft = sessionRead(consultationDraftKey, {});
  const contexts = {
    'case:uniform-goods': { item: 'チームオリジナルグッズ', label: '参考の制作例：ニチジョウにチーム愛を' },
    'case:mask': { item: 'ウォッシャブルマスク', label: '参考の制作例：02 BtoB' },
    'case:ecobag': { item: 'コーヒー・エコバッグ', label: '参考の制作例：03 BtoB Vol.2' },
    'case:coffee': { item: 'コーヒー・マグカップのグッズ企画', label: '参考の制作例：HALF TIME COFFEE' },
    'topic:trophy': { item: 'トロフィー・表彰品', label: 'ご相談のテーマ：トロフィー・表彰品' },
    'award:budget': { item: '予算重視・高級感重視モデル（BG-4963 / BG-4904）', label: '選択した表彰品：予算重視・高級感重視モデル（BG-4963 / BG-4904）' },
    'award:standard': { item: '定番トロフィー（BG-4925）', label: '選択した表彰品：定番トロフィー（BG-4925）' },
    'award:personal': { item: '個人賞・個人表彰（BG-4988 / BG-7420）', label: '選択した表彰品：個人賞・個人表彰（BG-4988 / BG-7420）' },
    'award:medal': { item: '個人賞メダル（BG-40）', label: '選択した表彰品：個人賞メダル（BG-40）' },
    'topic:sports': { item: 'スポーツチーム・大会のグッズ', label: 'ご相談のテーマ：スポーツ・各種大会' },
    'topic:restaurant': { item: '飲食店のウェア・オリジナルグッズ', label: 'ご相談のテーマ：飲食店' },
    'topic:promo': { item: '企業ノベルティ・販促グッズ', label: 'ご相談のテーマ：企業ノベルティ・販促' },
    'topic:graduation': { item: '卒業記念・記念品', label: 'ご相談のテーマ：卒業記念・記念品' },
  };
  let selectedProductNo = Number.isSafeInteger(draft?.productNo) ? draft.productNo : null;
  let contextKey = Object.hasOwn(contexts, draft?.contextKey) ? draft.contextKey : '';
  names.forEach(name => { if (typeof draft?.[name] === 'string') fields[name].value = draft[name].slice(0, limits[name]); });
  const context = document.querySelector('[data-consultation-context]');
  const consultationText = () => {
    const contextLine = contextKey ? `${contexts[contextKey].label}\n` : '';
    return `${contextLine}作りたい商品・用途：${fields.item.value || '未定'}\nおおよその数量：${fields.quantity.value || '未定'}\n希望時期：${fields.date.value || '未定'}\n\nご希望・相談内容：\n${fields.note.value || '未記入'}`;
  };
  const updateCopyPreview = () => {
    if (copyPreview) copyPreview.value = consultationText();
    if (copyStatus) copyStatus.textContent = '';
  };
  const saveDraft = () => {
    sessionWrite(consultationDraftKey, { productNo: selectedProductNo, contextKey, ...Object.fromEntries(names.map(name => [name, fields[name].value.slice(0, limits[name])])) });
    updateCopyPreview();
  };
  const validQuantity = value => /^\d+$/.test(String(value || '')) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
  const prefill = (productNo, quantity, force = false) => {
    const item = findCatalogProduct(publicCatalogItems, productNo);
    if (!item) return;
    if (force || selectedProductNo !== item.no || !fields.item.value) fields.item.value = item.name;
    selectedProductNo = item.no;
    contextKey = '';
    if (validQuantity(quantity)) fields.quantity.value = String(quantity);
    else if (force) fields.quantity.value = '';
    if (context) { context.textContent = `選択中の商品：${item.name}`; context.hidden = false; }
    saveDraft();
  };
  const params = new URLSearchParams(location.search);
  const explicitProductNo = /^\d+$/.test(params.get('product') || '') ? Number(params.get('product')) : null;
  const requestedAward = params.get('topic') === 'trophy' && ['budget', 'standard', 'personal', 'medal'].includes(params.get('award')) ? `award:${params.get('award')}` : '';
  const requestedContext = requestedAward || (Object.hasOwn(contexts, `case:${params.get('case')}`) ? `case:${params.get('case')}` : Object.hasOwn(contexts, `topic:${params.get('topic')}`) ? `topic:${params.get('topic')}` : '');
  if (!explicitProductNo && (requestedContext || contextKey)) {
    const nextContext = requestedContext || contextKey;
    if (nextContext !== contextKey || !fields.item.value) fields.item.value = contexts[nextContext].item;
    contextKey = nextContext;
    selectedProductNo = null;
    if (context) { context.textContent = contexts[contextKey].label; context.hidden = false; }
    saveDraft();
  } else {
    const productNo = explicitProductNo || selectedProductNo;
    const savedCalculator = sessionRead(estimatorDraftKey);
    const savedProduct = findCatalogProduct(publicCatalogItems, savedCalculator?.productNo);
    const requestedProduct = findCatalogProduct(publicCatalogItems, productNo);
    const carriedQuantity = params.get('quantity') || (requestedProduct && savedProduct === requestedProduct && !fields.quantity.value ? savedCalculator.quantity : null);
    prefill(productNo, carriedQuantity);
  }
  document.addEventListener('braginga:consult-product', event => prefill(event.detail?.productNo, event.detail?.quantity, true));
  quickForm.addEventListener('input', saveDraft);
  quickForm.addEventListener('change', saveDraft);
  quickForm.querySelector('[data-consultation-clear]')?.addEventListener('click', () => {
    names.forEach(name => { fields[name].value = ''; });
    selectedProductNo = null; contextKey = '';
    if (context) { context.textContent = ''; context.hidden = true; }
    saveDraft(); fields.item.focus();
  });
  setupTextCopy(quickForm.querySelector('[data-consultation-copy]'), copyPreview, copyStatus, consultationText);
  updateCopyPreview();
}
