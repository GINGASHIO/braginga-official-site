"""Build an allowlisted static artifact. Never publish the source directory itself."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / '.build' / 'public'
PAGES = ['about', 'products', 'cases', 'estimate', 'trophy', 'sports', 'collections']
ROOT_FILES = ['index.html', '404.html', 'styles.css', 'creative.css', 'navigation.css', 'studio.css', 'catalog-sections.css', 'collection-index.css', 'order-flow.css', 'sports-banner.css', 'sports-feature.css', 'product-detail.css', 'case-story.css', 'renewal.css', 'renewal.js', 'script.js', 'creative.js', 'navigation.js', 'studio.js', 'robots.txt', '_headers']

def build():
    # Only this generated directory is recreated; never erase source/user folders.
    if PUBLIC.is_symlink():
        raise RuntimeError('Build directory must not be a symlink')
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)
    for name in ROOT_FILES + [f'{page}/index.html' for page in PAGES] + ['estimate/estimate-data.js']:
        copy(ROOT / name, PUBLIC / name)
    from render_catalog import load_catalog
    for item in load_catalog()['products']:
        if not item['provisional'] or item.get('published'):
            name = f"products/item-{item['no']:02}.html"
            copy(ROOT / name, PUBLIC / name)
    for src in (ROOT / 'assets').rglob('*'):
        if src.is_file() and not any(part.startswith('.') for part in src.relative_to(ROOT).parts) and src.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.woff2'}:
            copy(src, PUBLIC / src.relative_to(ROOT))
    return PUBLIC

def copy(src, dst):
    if src.is_symlink():
        raise RuntimeError(f'Symlink is not a public asset: {src.name}')
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

if __name__ == '__main__':
    print(build())
