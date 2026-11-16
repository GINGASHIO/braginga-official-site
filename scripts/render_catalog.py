"""Render public product cards from the shared, public-only catalog."""
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import urlsplit, quote

from refresh_shell import refresh

ROOT = Path(__file__).resolve().parents[1]
START = '<!-- PUBLIC PRODUCTS START -->'
END = '<!-- PUBLIC PRODUCTS END -->'

def load_catalog():
    text = (ROOT / 'estimate/estimate-data.js').read_text(encoding='utf-8')
    catalog = json.loads(text.split('window.estimateCatalog =', 1)[1].strip().removesuffix(';'))
    # Older editor exports may still carry private working values for ASK items.
    catalog.pop('temporaryDefaults', None)
    for item in catalog['products']:
        if item.get('priceStatus') == 'temporary':
            item['price'] = item['lot'] = None
    return catalog


def write_catalog(path, catalog):
    data = json.dumps(catalog, ensure_ascii=False, indent=2)
    path.write_text('// 公開用商品マスター。未確定の価格・最低ロットは掲載しない。\n'
                    f'window.estimateCatalog = {data};\n', encoding='utf-8')


def render_cards(items, heading):
    cards = []
    for item in items:
        ask = item.get('priceStatus') == 'temporary'
        scenes = escape(' '.join(item.get('scenes', [])), quote=True)
        aliases = escape(' '.join(item.get('searchAliases', [])), quote=True)
        individual = item.get('priceStatus') == 'individual'
        price = 'ASK' if ask else '個別確認' if individual else f"¥{item['price']:,}"
        price_label = '価格' if ask or individual else '参考上代'
        lot = 'ASK' if ask else '個別確認' if item['lot'] is None else f"{item['lot']}点〜"
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
        actions = []
        if not ask:
            actions.append(f'<a class="public-product-cta" href="../estimate/index.html?product={no}#auto" aria-label="{name}の簡易見積もり">簡易見積もり <span aria-hidden="true">↗</span></a>')
        consult_class = 'public-product-cta' if ask else 'product-mail-link'
        actions.append(f'<a class="{consult_class}" href="../estimate/index.html?product={no}#quick" data-consult-product="{no}" aria-label="{name}についてメールで相談">メールで相談 <span aria-hidden="true">↗</span></a>')
        action_html = '\n            '.join(actions)
        cards.append(f'''        <article class="public-product-card" data-category="{escape(item['category'])}" data-scenes="{scenes}" data-search-aliases="{aliases}" data-product-no="{no}" id="product-{no:02}">
          <figure class="public-product-media product-image-slot{' is-empty' if not image else ''}" aria-label="{name}の写真">{media}</figure>
          <div class="public-product-body">
            <div class="public-product-index">{escape(item['category'])}</div>
            <{heading}><a class="product-name-link" href="../products/item-{no:02}.html" aria-label="{name}の商品詳細">{name} <span aria-hidden="true">↗</span></a></{heading}>
            <p class="public-product-price"><span>{price_label} {"" if ask or individual else "<small>税抜 / 1点</small>"}</span><strong>{price}</strong></p>
            <dl class="public-product-specs">
              <div><dt>サイズ</dt><dd>{escape(item['size'] or '個別確認')}</dd></div>
              <div><dt>仕様</dt><dd>{escape(item['spec'])}</dd></div>
              <div><dt>最低ロット</dt><dd>{lot}</dd></div>
              <div><dt>納期目安</dt><dd>{escape(item['lead'])}</dd></div>
            </dl>
            {action_html}
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

def render_home(items, featured_numbers):
    featured = {item['no']: item for item in items if item.get('image')}
    cards = []
    for number in featured_numbers:
        if number not in featured:
            continue
        item = featured[number]
        name = escape(item['name'])
        image = escape(item['image'], quote=True)
        cards.append(f'''          <article class="product-card">
            <a class="list-card-link" href="./products/item-{number:02}.html">
              <figure class="list-card-media"><img src="./{image}" alt="" loading="lazy" decoding="async" width="{item.get('imageWidth', 800)}" height="{item.get('imageHeight', 600)}"></figure>
              <h3>{name}</h3>
            </a>
          </article>''')
    path = ROOT / 'index.html'
    text = path.read_text()
    start = text.index('<!-- HOME PRODUCTS START -->') + len('<!-- HOME PRODUCTS START -->')
    end = text.index('<!-- HOME PRODUCTS END -->', start)
    result = text[:start] + '\n' + '\n'.join(cards) + '\n          ' + text[end:]
    if result != text:
        path.write_text(result)


def render_sports_picks(path, items):
    featured = {
        'sports-cheering': (6, 41, 20),
        'sports-merch': (15, 7, 17),
        'sports-awards': (12, 13, 27),
    }
    original = path.read_text()
    text = original
    for tag, numbers in featured.items():
        cards = []
        candidates = [item for item in items if tag in item.get('scenes', []) and item.get('image')]
        priorities = {no: index for index, no in enumerate(numbers)}
        candidates.sort(key=lambda item: (
            not item.get('newInEditor', False), priorities.get(item['no'], len(numbers)), -item['no'],
        ))
        for item in candidates[:3]:
            no = item['no']
            name = escape(item['name'])
            image = escape(item['image'], quote=True)
            cards.append(f'''            <li>
              <a href="../products/item-{no:02}.html?return=%2Fsports%2Findex.html%23{tag}">
                <span class="sports-pick-photo"><img src="../{image}" width="{item['imageWidth']}" height="{item['imageHeight']}" alt="" loading="lazy" decoding="async"></span>
                <strong>{name}</strong><span aria-hidden="true">↗</span>
              </a>
            </li>''')
        start_marker = f'<!-- {tag} START -->'
        start = text.index(start_marker) + len(start_marker)
        end = text.index(f'<!-- {tag} END -->', start)
        text = text[:start] + '\n' + '\n'.join(cards) + '\n            ' + text[end:]
    if text != original:
        path.write_text(text)


def render():
    refresh()
    catalog = load_catalog()
    items = [item for item in catalog['products'] if not item['provisional'] or item.get('published')]
    render_page(ROOT / 'products/index.html', items, 'h2')
    render_home(items, catalog.get('homeFeatured', [15, 6, 7, 20, 41]))
    sports = [item for item in items if 'sports' in item.get('scenes', [])]
    sports_page = ROOT / 'sports/index.html'
    render_sports_picks(sports_page, sports)
    from render_details import render as render_details
    render_details(items)

if __name__ == '__main__':
    render()
