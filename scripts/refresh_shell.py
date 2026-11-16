"""Render the common header into the static page shells."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAV_VERSION = '20261116logo2'
CATALOG_VERSION = '20261116catalog3'
BASE_PAGES = (
    'index.html', 'about/index.html', 'cases/index.html', 'collections/index.html',
    'products/index.html', 'sports/index.html', 'estimate/index.html', 'trophy/index.html',
    '404.html',
)
NAV_LINKS = (
    ('/collections/', 'collections', 'COLLECTION', '特集コレクション'),
    ('/products/#lineup', 'products', 'PRODUCT', '商品を探す'),
    ('/about/', 'about', 'ABOUT', '私たちについて'),
    ('/cases/', 'cases', 'WORKS', '制作実績'),
    ('/#order', 'order', 'ORDER', '注文の流れ'),
    ('/#faq', 'faq', 'FAQ', 'よくある質問'),
    ('/estimate/#auto', 'estimate', 'ESTIMATE', '簡易見積もり'),
    ('/estimate/#quick', 'contact', 'CONSULT', 'メールで相談'),
)


def header_html():
    links = '\n'.join(
        f'        <a href="{url}" data-nav="{key}"><span>{en}</span><small>{ja}</small></a>'
        for url, key, en, ja in NAV_LINKS
    )
    return f'''<header class="site-header" data-header>
      <a class="brand" href="/#home" aria-label="GINGA PRINT FACTORY トップページ">
        <img class="brand-logo" src="/assets/images/pront-blk-header.png" width="1636" height="994" alt="">
      </a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-button>
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 2h18M0 7h18M0 12h18"/></svg>
        <span class="menu-label">メニュー</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="メインメニュー" data-site-nav>
{links}
      </nav>
    </header>'''


def footer_brand_html():
    return ('<span class="footer-brand">'
            '<img src="/assets/images/pront-wt-footer.png" width="1636" height="994" '
            'alt="GINGA PRINT FACTORY" loading="lazy" decoding="async"></span>')


def refresh():
    for name in BASE_PAGES:
        page = ROOT / name
        original = page.read_text(encoding='utf-8')
        html, count = re.subn(r'<header class="site-header"[^>]*>.*?</header>',
                              lambda _: header_html(), original, flags=re.S)
        if count != 1:
            raise ValueError(f'Expected one site header in {name}')
        html = re.sub(r'(<footer class="site-footer">\s*)<span>GINGA PRINT FACTORY</span>',
                      lambda match: match[1] + footer_brand_html(), html)
        html = re.sub(r'(navigation\.(?:css|js)\?v=)[\w-]+',
                      lambda match: match[1] + NAV_VERSION, html)
        html = re.sub(r'((?:/script|estimate-data|product-detail)\.(?:css|js)\?v=)[\w-]+',
                      lambda match: match[1] + CATALOG_VERSION, html)
        if html != original:
            page.write_text(html, encoding='utf-8')


if __name__ == '__main__':
    refresh()
