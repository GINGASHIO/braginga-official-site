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

const publicProductGrid = document.querySelector("[data-public-product-grid]");

if (publicProductGrid) {
  // Product information is in the HTML so it remains readable if JavaScript fails.
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
    const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja-JP').trim();
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
      categoryButtons.forEach(button => {
        button.disabled = !names.includes(button.dataset.catalogCategoryTag);
      });
    };
    const filterProducts = () => {
      const query = normalize(search.value);
      categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.catalogCategoryTag === category.value)));
      let visible = 0;
      products.forEach(product => {
        const matches = matchesScope(product) && (!category.value || product.category === category.value) && product.searchText.includes(query);
        product.card.hidden = !matches;
        if (matches) visible += 1;
      });
      count.textContent = `${visible}件 / 全${products.length}件`;
      empty.hidden = visible !== 0;
    };
    const selectUseCase = (value, previousCategory = category.value) => {
      selectedUseCase = value;
      useCaseButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.catalogUseCase === value)));
      syncCategories(previousCategory);
      filterProducts();
    };
    const selectScene = link => {
      selectedScene = link?.dataset.catalogScene || '';
      sceneLinks.forEach(sceneLink => {
        if (sceneLink === link) sceneLink.setAttribute('aria-current', 'true');
        else sceneLink.removeAttribute('aria-current');
      });
      if (activeScene) {
        const label = link?.dataset.catalogSceneLabel || link?.textContent.trim();
        activeScene.textContent = label ? `選択中のシーン　${label}` : '';
        activeScene.hidden = !label;
      }
      search.value = '';
      selectUseCase('', '');
    };
    useCaseButtons.forEach(button => button.addEventListener('click', () => selectUseCase(button.dataset.catalogUseCase)));
    categoryButtons.forEach(button => button.addEventListener('click', () => {
      const name = button.dataset.catalogCategoryTag;
      category.value = category.value === name ? '' : name;
      filterProducts();
    }));
    sceneLinks.forEach(link => link.addEventListener('click', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      selectScene(link);
    }));
    search.addEventListener('input', filterProducts);
    category.addEventListener('change', filterProducts);
    filters.querySelector('[data-catalog-reset]').addEventListener('click', () => selectScene(null));
    const initial = new URLSearchParams(location.search);
    const initialScene = sceneLinks.find(link => link.dataset.catalogScene === initial.get('scene'));
    const initialUseCase = useCaseButtons.find(button => button.dataset.catalogUseCase === initial.get('use'));
    if (initialScene) selectScene(initialScene);
    selectUseCase(initialUseCase?.dataset.catalogUseCase || '', initial.get('category'));
    filters.hidden = false;
  }
}

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
const autoEstimate = document.querySelector("[data-auto-estimate]");

if (autoEstimate) {
  const catalog = window.estimateCatalog || { categories: [], products: [] };
  const categorySelect = autoEstimate.querySelector("[data-estimate-category]");
  const productSelect = autoEstimate.querySelector("[data-estimate-product]");
  const quantityInput = autoEstimate.querySelector("[data-estimate-quantity]");

  const requestedProductNo = Number.parseInt(new URLSearchParams(window.location.search).get("product"), 10);
  const requestedProduct = catalog.products.find((item) => item.no === requestedProductNo);
  const requestedCategory = new URLSearchParams(window.location.search).get('category');
  categorySelect.innerHTML = catalog.categories.map((category) => `<option value="${category}">${category}</option>`).join("");
  if (catalog.categories.includes(requestedCategory)) categorySelect.value = requestedCategory;
  if (requestedProduct) {
    categorySelect.value = requestedProduct.category;
    if (Number.isFinite(requestedProduct.lot)) quantityInput.value = String(requestedProduct.lot);
  }

  const syncProducts = () => {
    const products = catalog.products.filter((item) => item.category === categorySelect.value);
    productSelect.innerHTML = products.map((item) => `<option value="${catalog.products.indexOf(item)}">${item.name}${item.priceStatus === 'temporary' && item.published ? "（仮価格・仮ロット）" : item.provisional ? "（個別見積もり）" : ""}</option>`).join("");
    if (requestedProduct && products.includes(requestedProduct)) {
      productSelect.value = String(catalog.products.indexOf(requestedProduct));
    }
  };

  const shippingInput = autoEstimate.querySelector('[data-estimate-shipping]');
  const otherInput = autoEstimate.querySelector('[data-estimate-other]');
  const parseFee = input => {
    const text = input.value.trim();
    const value = Number(text);
    const valid = text !== '' && Number.isSafeInteger(value) && value >= 0;
    input.setAttribute('aria-invalid', String(text !== '' && !valid));
    return { value, valid, empty: text === '' };
  };
  const updateEstimate = () => {
    const item = catalog.products[Number(productSelect.value)] || catalog.products[0];
    if (!item) return;
    const quantity = Number(quantityInput.value);
    const validQuantity = quantityInput.value.trim() !== '' && Number.isSafeInteger(quantity) && quantity > 0 && (!Number.isFinite(item.price) || Number.isSafeInteger(item.price * quantity));
    const temporary = item.published === true && item.priceStatus === 'temporary';
    const hasPrice = (!item.provisional || temporary) && Number.isFinite(item.price) && item.price > 0;
    const belowLot = validQuantity && Number.isFinite(item.lot) && quantity < item.lot;
    const canEstimate = validQuantity && hasPrice && !belowLot;
    const shipping = parseFee(shippingInput), other = parseFee(otherInput);
    const goods = canEstimate ? item.price * quantity : null;
    const total = canEstimate && shipping.valid && other.valid ? goods + shipping.value + other.value : null;
    const validTotal = total !== null && Number.isSafeInteger(total) && Number.isSafeInteger(Math.round(total * 1.1));
    quantityInput.setAttribute('aria-invalid', String(!validQuantity));
    autoEstimate.querySelector('[data-estimate-spec]').textContent = Object.hasOwn(item, 'size') ? (item.size || '個別確認') : item.spec;
    autoEstimate.querySelector('[data-estimate-print]').textContent = Object.hasOwn(item, 'size') ? item.spec : (item.notes || '個別確認');
    autoEstimate.querySelector('[data-estimate-lot]').textContent = Number.isFinite(item.lot) ? `${temporary ? '仮 ' : ''}${item.lot}点〜` : '個別に確認';
    autoEstimate.querySelector('[data-estimate-lead]').textContent = item.lead;
    autoEstimate.querySelector('[data-estimate-notes]').textContent = item.notes || '—';
    autoEstimate.querySelector('[data-estimate-unit]').textContent = hasPrice ? `${yen(item.price)} / 点${temporary ? '（仮）' : ''}` : '個別見積もり';
    autoEstimate.querySelector('[data-estimate-count]').textContent = validQuantity ? `${quantity}点` : '—';
    autoEstimate.querySelector('[data-estimate-goods-subtotal]').textContent = canEstimate ? yen(goods) : '要確認';
    autoEstimate.querySelector('[data-estimate-subtotal]').textContent = validTotal ? yen(total) : '—';
    autoEstimate.querySelector('[data-estimate-tax]').textContent = validTotal ? yen(total * 1.1) : '—';
    autoEstimate.querySelector('[data-estimate-shipping-amount]').textContent = shipping.valid ? yen(shipping.value) : shipping.empty ? '未定' : '要確認';
    autoEstimate.querySelector('[data-estimate-other-amount]').textContent = other.valid ? yen(other.value) : other.empty ? '未定' : '要確認';
    autoEstimate.querySelector('[data-estimate-formula]').textContent = canEstimate ? `${yen(item.price)} × ${quantity}点 ＋ 送料 ＋ その他費用` : '単価 × 個数 ＋ 送料 ＋ その他費用';
    autoEstimate.querySelector('[data-estimate-price-note]').textContent = temporary ? '仮価格500円・仮ロット50点です。正式な価格・仕様・納期は後日確認します。' : hasPrice ? '2026年公開価格表の参考上代です。' : '価格・最低ロット・納期は未確定です。内容を確認して個別にご案内します。';
    autoEstimate.querySelector('[data-estimate-warning]').textContent = !validQuantity ? '個数は1以上の整数で入力してください。大きすぎる個数は個別にご相談ください。' : belowLot ? `最低ロットは${item.lot}点です。ロット未満は個別見積もりとなります。` : '';
    autoEstimate.querySelector('[data-estimate-fee-warning]').textContent = (!shipping.empty && !shipping.valid) || (!other.empty && !other.valid) || (total !== null && !validTotal) ? '送料・その他費用は0以上の整数で入力してください。大きすぎる金額は個別にご相談ください。' : '';
    autoEstimate.querySelector('[data-estimate-total-note]').textContent = !canEstimate ? '商品・個数を確認するか、メールでご相談ください。' : validTotal ? (temporary ? '仮価格・仮ロットに基づく金額です。正式条件は後日確定します。' : '正式な費用は、内容確認後のお見積もりでご案内します。') : '送料・その他費用を入力すると合計を表示します。未定の場合もメールでご相談いただけます。';
    const size = Object.hasOwn(item, 'size') ? (item.size || '個別確認') : item.spec;
    const spec = Object.hasOwn(item, 'size') ? item.spec : (item.notes || '個別確認');
    const body = `商品：${item.name}\nサイズ：${size}\n仕様：${spec}\n個数：${validQuantity ? quantity + '点' : '未定・要確認'}\n参考単価（税抜）：${hasPrice ? yen(item.price) + (temporary ? '（仮）' : '') : '個別確認'}\n商品代金（税抜）：${canEstimate ? yen(goods) + (temporary ? '（仮価格で計算）' : '') : '個別確認'}\n送料（税抜）：${shipping.valid ? yen(shipping.value) : '未定・要確認'}\nその他費用（税抜）：${other.valid ? yen(other.value) : '未定・要確認'}\n合計（税抜）：${validTotal ? yen(total) + (temporary ? '（仮価格で計算）' : '') : '未定・要確認'}\n${temporary ? '最低ロット：仮50点（正式条件は後日確認）' : ''}\n\nこの内容で相談します。`;
    autoEstimate.querySelector('[data-estimate-mail]').href = `mailto:info@ginga-bra.com?subject=${encodeURIComponent('簡易見積もりのご相談')}&body=${encodeURIComponent(body)}`;
  };

  categorySelect.addEventListener("change", () => {
    syncProducts();
    updateEstimate();
  });
  productSelect.addEventListener("change", updateEstimate);
  quantityInput.addEventListener("input", updateEstimate);
  shippingInput.addEventListener("input", updateEstimate);
  otherInput.addEventListener("input", updateEstimate);
  syncProducts();
  updateEstimate();
  if (catalog.products.length) document.querySelector("[data-estimate-fallback]")?.setAttribute("hidden", "");
}

document.querySelector("[data-quick-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = `作りたい商品・用途：${form.get("item") || "未定"}\nおおよその数量：${form.get("quantity") || "未定"}\n希望時期：${form.get("date") || "未定"}\n\nご希望・相談内容：\n${form.get("note") || "未記入"}`;
  window.location.href = `mailto:info@ginga-bra.com?subject=${encodeURIComponent("制作のご相談")}&body=${encodeURIComponent(body)}`;
});
