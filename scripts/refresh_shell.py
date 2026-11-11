"""Keep the existing static page shells aligned; details inherit the catalog header."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def refresh():
    pages=[ROOT/'index.html',ROOT/'404.html']+[ROOT/d/'index.html' for d in ('about','cases','collections','products','sports','estimate','trophy')]
    for p in pages:
        s=p.read_text();pre='./' if p.parent==ROOT else '../'
        links=[('products/index.html#lineup','products','PRODUCTS','商品を探す'),('collections/index.html','collections','COLLECTIONS','特集'),('cases/index.html','cases','WORKS','制作実績'),('index.html#faq','faq','FAQ','よくある質問'),('estimate/index.html#quick','contact','CONSULT','メールで相談')]
        nav='<nav class="site-nav" id="site-nav" aria-label="メインメニュー" data-site-nav>\n'+''.join(f'        <a href="{pre}{url}" data-nav="{key}"><span>{en}</span><small>{ja}</small></a>\n' for url,key,en,ja in links)+'      </nav>'
        s=re.sub(r'<nav class="site-nav"[^>]*>.*?</nav>',lambda _:nav,s,flags=re.S)
        s=re.sub(r'creative.js\?v=[\w]+','creative.js?v=20261112r1',s)
        if 'renewal.css?' not in s:s=s.replace('</head>',f'<link rel="stylesheet" href="{pre}renewal.css?v=20261112r1">\n  </head>')
        if p.parent.name=='sports' and 'product-detail.css' not in s:s=s.replace('</head>',f'<link rel="stylesheet" href="{pre}product-detail.css?v=20261112renewal1">\n  </head>')
        s=s.replace('<main', '<a class="skip-link" href="#main-content">本文へ移動</a>\n    <main',1) if 'skip-link' not in s else s
        s=s.replace('<main ', '<main id="main-content" ',1) if 'id="main-content"' not in s else s
        s=s.replace('<main>', '<main id="main-content">',1)
        p.write_text(s)
if __name__=='__main__':refresh()
