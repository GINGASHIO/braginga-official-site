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
    text: "昇華、マーキング、番号、個人名などスポーツチーム向けの制作導線。",
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
    text: "多色デザインや小ロットに向いた加工として案内ページ化可能。",
    image: "./assets/images/hero-print-workshop.png",
  },
  {
    slug: "sublimation",
    label: "SUBLIMATION",
    title: "昇華プリント",
    text: "総柄ユニフォームやスポーツウェア向けの生産背景として訴求。",
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
    label: "SPORTS TEAM",
    title: "匿名案件 / スポーツチーム",
    type: "案件ごと",
    item: "昇華ユニフォーム / 移動着",
    image: "./assets/images/case-studies.png",
  },
  {
    label: "RESTAURANT",
    title: "匿名案件 / 飲食店",
    type: "アイテムごと",
    item: "Tシャツ / エプロン / キャップ",
    image: "./assets/images/product-range.png",
  },
  {
    label: "PRIVATE BRAND",
    title: "匿名案件 / 小規模ブランド",
    type: "案件ごと",
    item: "スウェット / ネーム / 梱包",
    image: "./assets/images/hero-print-workshop.png",
  },
  {
    label: "SCHOOL",
    title: "匿名案件 / 学校イベント",
    type: "アイテムごと",
    item: "クラスTシャツ / 記念品",
    image: "./assets/images/case-studies.png",
  },
];

const productGrid = document.querySelector("[data-products]");

if (productGrid) {
  productGrid.innerHTML = products
    .map(
      (product, index) => `
        <article class="product-card reveal" style="--reveal-delay: ${index * 70}ms">
          <a class="list-card-link" href="./products/index.html#${product.slug}" aria-label="${product.title}の詳細へ">
            <figure class="list-card-media">
              <img src="${product.image}" alt="${product.title}の製品イメージ">
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

const caseTrack = document.querySelector("[data-case-track]");

if (caseTrack) {
  caseTrack.innerHTML = cases
    .map(
      (caseItem, index) => `
        <article class="case-card reveal" style="--reveal-delay: ${index * 90}ms">
          <a class="list-card-link" href="./cases/index.html" aria-label="${caseItem.title}の制作実績へ">
            <figure class="list-card-media">
              <img src="${caseItem.image}" alt="${caseItem.title}の制作イメージ">
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
const menuButton = document.querySelector("[data-menu-button]");
const siteNav = document.querySelector("[data-site-nav]");
const heroSlides = document.querySelectorAll(".hero-slide");
let currentHeroIndex = 0;

window.setInterval(() => {
  if (heroSlides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  heroSlides[currentHeroIndex].classList.remove("is-active");
  currentHeroIndex = (currentHeroIndex + 1) % heroSlides.length;
  heroSlides[currentHeroIndex].classList.add("is-active");
}, 4600);

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = siteNav?.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

const revealTargets = document.querySelectorAll(".reveal");
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
