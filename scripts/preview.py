"""Loopback-only preview of the allowlisted release artifact, including _headers."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit
from pathlib import Path
from fnmatch import fnmatch
from prepare_public import build

PUBLIC = build()
rules = []
for line in (PUBLIC / '_headers').read_text().splitlines():
    if not line.strip(): continue
    if not line.startswith(' '):
        rules.append((line.strip(), {}))
    elif ':' in line:
        key, value = line.strip().split(':', 1)
        rules[-1][1][key] = value.strip()

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)
    def end_headers(self):
        path = unquote(urlsplit(self.path).path)
        headers = {}
        for pattern, additions in rules:
            if fnmatch(path, pattern): headers.update(additions)
        for key, value in headers.items(): self.send_header(key, value)
        super().end_headers()
    def send_head(self):
        path = Path(unquote(urlsplit(self.path).path))
        if '..' in path.parts or any(part.startswith('.') for part in path.parts) or path.name == '_headers':
            self.send_error(404); return None
        return super().send_head()
    def list_directory(self, path):
        self.send_error(404)
    def log_message(self, fmt, *args):
        # URLs can contain user data; do not print request queries to preview logs.
        pass

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 4198), Preview).serve_forever()
