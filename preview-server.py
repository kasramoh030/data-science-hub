#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import webbrowser

ROOT = Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

if __name__ == '__main__':
    host, port = '127.0.0.1', 4173
    url = f'http://{host}:{port}/#/'
    print(f'Data Science Hub Preview: {url}')
    print('Press Ctrl+C to stop.')
    try:
        webbrowser.open(url)
    except Exception:
        pass
    ThreadingHTTPServer((host, port), Handler).serve_forever()
