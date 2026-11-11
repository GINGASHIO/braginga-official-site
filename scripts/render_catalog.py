"""Render public product cards from the shared, public-only catalog."""
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import urlsplit, quote

ROOT = Path(__file__).resolve().parents[1]
START = '<!-- PUBLIC PRODUCTS START -->'
END = '<!-- PUBLIC PRODUCTS END -->'

def load_catalog():
    text = (ROOT / 'estimate/estimate-data.js').read_text()
    return json.loads(text.split('window.estimateCatalog =', 1)[1].strip().removesuffix(';'))

def render_cards(items, heading):
    cards = []
    for item in items:
        temporary = item.get('priceStatus') == 'temporary'
        use_cases = escape(' '.join(item.get('useCases', [])), quote=True)
        scenes = escape(' '.join(item.get('scenes', [])), quote=True)
        aliases = escape(' '.join(item.get('searchAliases', [])), quote=True)
        conditions = "\n            <p class='product-conditions-note'>仮価格・仮ロットで掲載中です。正式な条件は後日確定します。</p>" if temporary else ""
        no = item['no']
        name = escape(item['name'])
        image = item.get('image')
        caption = escape(item.get('imageCaption', '制作例'))
        if image:
            parts = urlsplit(image)
            path = Path(image)
            if parts.scheme or parts.netloc or not image.startswith('assets/images/') or '..' in path.parts:
                raise ValueError('Use a local image under assets/images')
            if not (ROOT / path).is_file(): raise ValueError(f'Missing product image for No.{no}')
            media = f'<img src="../{escape(image, quote=True)}" alt="{name}の{caption}" loading="lazy" decoding="async" width="{item.get("imageWidth", 800)}" height="{item.get("imageHeight", 600)}"><figcaption>{caption}</figcaption>'
        else:
            media = '<span class="product-image-label">商品写真 掲載予定</span>'
        cards.append(f'''        <article class="public-product-card" data-category="{escape(item['category'])}" data-use-cases="{use_cases}" data-scenes="{scenes}" data-search-aliases="{aliases}" data-product-no="{no}" id="product-{no:02}">
          <figure class="public-product-media product-image-slot{' is-empty' if not image else ''}" aria-label="{name}の写真">{media}</figure>
          <div class="public-product-body">
            <div class="public-product-index"><span>NO.{no:02}</span><span>{escape(item['category'])}</span></div>
            <{heading}><a class="product-name-link" href="../products/item-{no:02}.html" aria-label="{name}の商品詳細">{name} <span aria-hidden="true">↗</span></a></{heading}>
            <p class="public-product-price"><span>{"仮価格" if temporary else "参考上代"} <small>税抜 / 1点</small></span><strong>¥{item['price']:,}</strong></p>
            <dl class="public-product-specs">
              <div><dt>サイズ</dt><dd>{escape(item['size'] or '個別確認')}</dd></div>
              <div><dt>仕様</dt><dd>{escape(item['spec'])}</dd></div>
              <div><dt>最低ロット</dt><dd>{'仮 ' if temporary else ''}{item['lot']}点〜</dd></div>
              <div><dt>納期目安</dt><dd>{escape(item['lead'])}</dd></div>
            </dl>{conditions}
            <a class="public-product-cta" href="../estimate/index.html?product={no}#auto" aria-label="{name}の簡易見積もり">簡易見積もり <span aria-hidden="true">↗</span></a>
            <a class="product-mail-link" href="../estimate/index.html?product={no}#quick" data-consult-product="{no}" aria-label="{name}についてメールで相談">メールで相談 ↗</a>
            <button class="product-compare-toggle" type="button" data-compare-product="{no}" aria-pressed="false" aria-label="{name}を比較に追加" hidden>＋ 比較に追加</button>
          </div>
        </article>''')
    return '\n'.join(cards)

def render_page(path, items, heading):
    text = path.read_text()
    cards = render_cards(items, heading)
    text = re.sub(r"全\d+アイテム", f"全{len(items)}アイテム", text)
    start = text.index(START) + len(START)
    end = text.index(END)
    result = text[:start] + '\n' + cards + '\n        ' + text[end:]
    if result != text: path.write_text(result)

def render():
    items = [item for item in load_catalog()['products'] if not item['provisional'] or item.get('published')]
    render_page(ROOT / 'products/index.html', items, 'h2')
    sports = [item for item in items if 'スポーツ' in item.get('useCases', [])]
    render_page(ROOT / 'sports/index.html', sports, 'h3')
    from render_details import render as render_details
    render_details(items)

if __name__ == '__main__':
    render()
