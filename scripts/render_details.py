"""Render product detail pages from the public catalog."""

from html import escape
from pathlib import Path
from urllib.parse import quote, urlsplit

from refresh_shell import CATALOG_VERSION, NAV_VERSION, footer_brand_html, header_html


ROOT = Path(__file__).resolve().parents[1]


def positive_integer(item, key):
    value = item[key]
    if type(value) is not int or value < 1:
        raise ValueError(f"Expected a positive integer for {key}")
    return value


def product_lot_html(item):
    if item.get("priceStatus") == "temporary":
        return "ASK"
    if item.get("lot") is None:
        return "個別確認"
    unit = escape(item.get("unit", "点"))
    tiers = item.get("quantityPrices")
    if tiers:
        return "<br>".join(
            f"{int(quantity):,}{unit}：¥{price:,}" for quantity, price in tiers.items()
        )
    return f"{positive_integer(item, 'lot')}{unit}〜"


def photo_url(image, number):
    parts = urlsplit(image)
    path = ROOT / image
    if (parts.scheme or parts.netloc or parts.query or parts.fragment
            or not image.startswith("assets/images/") or ".." in Path(image).parts
            or not path.resolve().is_relative_to(ROOT / "assets/images")
            or not path.is_file()):
        raise ValueError(f"Invalid product image for No.{number}")
    return f"../{escape(quote(image))}"


def photo(item, featured=False):
    image = item.get("image")
    if not image:
        return '<span class="detail-photo-pending">商品写真 掲載予定</span>'
    url = photo_url(image, item["no"])
    caption = item.get("imageCaption") or "制作例"
    alt = escape(item.get("imageAlt") or f"{item['name']}の{caption}") if featured else ""
    loading = 'fetchpriority="high"' if featured else 'loading="lazy"'
    width = positive_integer(item, "imageWidth")
    height = positive_integer(item, "imageHeight")
    return (f'<img src="{url}" alt="{alt}" width="{width}" '
            f'height="{height}" {loading} decoding="async">')


def product_media(item):
    name = escape(item["name"])
    number = item["no"]
    primary = photo(item, featured=True)
    caption = escape(item.get("imageCaption") or "制作例")
    caption_html = f"<figcaption>{caption}</figcaption>" if item.get("image") else ""
    gallery = item.get("gallery", [])
    if gallery:
        url = photo_url(item["image"], number)
        primary = f'''<a class="detail-photo-zoom" href="{url}" data-gallery-photo aria-label="{name}のメイン画像を拡大">
              {primary}<span class="detail-photo-enlarge" aria-hidden="true">拡大 ⤢</span>
            </a>'''
    figure = f'''<figure class="detail-photo">
          <div class="detail-photo-frame">{primary}</div>
          {caption_html}
        </figure>'''
    if not gallery:
        return figure

    photos = []
    for image in gallery:
        url = photo_url(image["image"], number)
        thumb = photo_url(image["thumb"], number)
        alt = escape(image["alt"])
        width = positive_integer(image, "width")
        height = positive_integer(image, "height")
        photos.append(f'''              <li>
                <a href="{url}" data-gallery-photo aria-label="{alt}を拡大">
                  <img src="{thumb}" width="{width}" height="{height}" alt="{alt}" loading="lazy" decoding="async">
                  <span class="detail-photo-enlarge" aria-hidden="true">⤢</span>
                </a>
              </li>''')
    photos_html = "\n".join(photos)
    return f'''<div class="detail-media" data-product-gallery>
        {figure}
          <section class="detail-gallery" aria-label="追加写真">
            <div class="detail-gallery-controls" data-gallery-controls hidden>
              <button type="button" data-gallery-prev aria-label="前の写真へ" aria-controls="detail-gallery-track">←</button>
              <button type="button" data-gallery-next aria-label="次の写真へ" aria-controls="detail-gallery-track">→</button>
            </div>
            <ul class="detail-gallery-track" id="detail-gallery-track" data-gallery-track>
{photos_html}
            </ul>
          </section>
          <dialog class="detail-gallery-dialog" aria-labelledby="detail-gallery-dialog-title">
            <div class="detail-gallery-viewer">
              <div class="detail-gallery-dialog-bar">
                <h2 id="detail-gallery-dialog-title">制作例の拡大</h2>
                <button type="button" data-gallery-close autofocus>閉じる ×</button>
              </div>
              <img data-gallery-preview alt="">
              <div class="detail-gallery-dialog-bar">
                <button type="button" data-gallery-view-prev aria-label="拡大した前の写真">←</button>
                <span data-gallery-position aria-live="polite"></span>
                <button type="button" data-gallery-view-next aria-label="拡大した次の写真">→</button>
              </div>
            </div>
          </dialog>
        </div>'''


def related_cards(item, items):
    scenes = set(item.get("scenes", []))
    candidates = [candidate for candidate in items if candidate["no"] != item["no"]]
    candidates.sort(key=lambda candidate: (
        not scenes.intersection(candidate.get("scenes", [])),
        candidate["category"] != item["category"],
        not candidate.get("image"),
        candidate["no"],
    ))
    cards = []
    for candidate in candidates[:3]:
        number = positive_integer(candidate, "no")
        name = escape(candidate["name"])
        cards.append(f'''          <a class="detail-related-card" href="item-{number:02}.html">
            <span class="detail-related-media">{photo(candidate)}</span>
            <span class="detail-related-name">{name} <span aria-hidden="true">→</span></span>
          </a>''')
    return "\n".join(cards)


def page(item, items, *, legacy=False):
    number = positive_integer(item, "no")
    name = escape(item["name"])
    category = escape(item["category"])
    individual = item.get("priceStatus") == "individual"
    ask = item.get("priceStatus") == "temporary"
    price = "ASK" if ask else "個別確認" if individual else f"¥{positive_integer(item, 'price'):,}"
    unit = escape(item.get("unit", "点"))
    lot = product_lot_html(item)
    if item.get("quantityPrices"):
        price += "〜"
    price_unit = "" if ask or individual else f"<small>税抜 / 1{unit}</small>"
    price_label = "価格" if ask or individual else "参考上代"
    size = escape(item.get("size") or "個別確認")
    spec = escape(item.get("spec") or "個別確認")
    lead = escape(item.get("lead") or "個別確認")
    canonical = f'\n    <link rel="canonical" href="https://braginga.net/products/item-{number:02}">' if legacy else ""
    estimate_action = (f'<a class="detail-action-primary" href="../estimate/index.html?product={number}#auto">簡易見積もり <span aria-hidden="true">→</span></a>' if not ask else "")
    if estimate_action:
        estimate_action = "\n            " + estimate_action
    consult_class = ' class="detail-action-primary"' if ask else ""
    sports_link = ('\n          <a href="../sports/index.html">スポーツ特集を見る →</a>'
                   if "sports" in item.get("scenes", []) else "")
    return f'''<!doctype html>
<!-- Generated by scripts/render_details.py from the public catalog. -->
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{name}の価格、最低ロット、サイズ、仕様、納期をご確認いただけます。">
    <title>{name} | GINGA PRINT FACTORY</title>{canonical}
    <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../styles.css?v=20261114color1">
    <link rel="stylesheet" href="../creative.css?v=20261114color1">
    <link rel="stylesheet" href="../navigation.css?v={NAV_VERSION}">
    <link rel="stylesheet" href="../studio.css?v=20261112c">
    <link rel="stylesheet" href="../product-detail.css?v={CATALOG_VERSION}">
    <link rel="stylesheet" href="../renewal.css?v=20261112r1">
    <script src="../navigation.js?v={NAV_VERSION}" defer></script>
  </head>
  <body data-page="products" data-product-no="{number}">
    {header_html()}
    <a class="skip-link" href="#main-content">本文へ移動</a>
    <main id="main-content" class="sub-page product-detail-page">
      <nav class="breadcrumbs" aria-label="現在地">
        <a href="../index.html">トップ</a><span aria-hidden="true">/</span>
        <a href="index.html#lineup" data-catalog-return>商品一覧</a><span aria-hidden="true">/</span>
        <span aria-current="page">{name}</span>
      </nav>
      <div class="detail-layout">
        <section class="detail-summary" aria-labelledby="detail-title">
          <p class="detail-category">{category}</p>
          <h1 id="detail-title">{name}</h1>
          <dl class="detail-price-list">
            <div><dt>{price_label} {price_unit}</dt><dd>{price}</dd></div>
            <div><dt>最低ロット</dt><dd>{lot}</dd></div>
          </dl>
          <div class="detail-actions">{estimate_action}
            <a{consult_class} href="../estimate/index.html?product={number}#quick" data-consult-product="{number}">メールで相談 <span aria-hidden="true">↗</span></a>
          </div>
          <button class="product-compare-toggle" type="button" data-compare-product="{number}" aria-pressed="false" aria-label="{name}を比較に追加" hidden>＋ 比較に追加</button>
        </section>
        {product_media(item)}
        <section class="detail-specifications" aria-labelledby="detail-spec-title">
          <h2 id="detail-spec-title">商品仕様</h2>
          <dl>
            <div><dt>サイズ</dt><dd>{size}</dd></div>
            <div><dt>仕様</dt><dd>{spec}</dd></div>
            <div><dt>納期目安</dt><dd>{lead}</dd></div>
          </dl>
        </section>
      </div>
      <section class="detail-related" aria-labelledby="detail-related-title">
        <h2 id="detail-related-title">関連商品</h2>
        <div class="detail-related-grid">
{related_cards(item, items)}
        </div>
        <nav class="detail-return-links" aria-label="他の商品を探す">
          <a href="index.html#lineup" data-catalog-return>商品一覧へ戻る →</a>
          <a href="../collections/index.html">特集コレクションを見る →</a>{sports_link}
        </nav>
      </section>
    </main>
    <footer class="site-footer">{footer_brand_html()}<span>BRAGINGA LLC</span></footer>
    <script src="../estimate/estimate-data.js?v={CATALOG_VERSION}"></script>
    <script src="../script.js?v={CATALOG_VERSION}"></script>
  </body>
</html>
'''


def render(items):
    products = ROOT / "products"
    pages = {}
    for item in items:
        number = positive_integer(item, "no")
        for page_number in (number, *item.get("legacyNumbers", [])):
            if type(page_number) is not int or page_number < 1 or page_number in pages:
                raise ValueError(f"Invalid or duplicate product number: {page_number}")
            pages[page_number] = item

    for page_number, item in pages.items():
        output = products / f"item-{page_number:02}.html"
        html = page(item, items, legacy=page_number != item["no"])
        result = '\n'.join(line.rstrip() for line in html.splitlines()) + '\n'
        if not output.is_file() or output.read_text(encoding="utf-8") != result:
            output.write_text(result, encoding="utf-8")
