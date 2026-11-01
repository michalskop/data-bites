#!/usr/bin/env python3
"""Serve the local site with byte ranges for video playback and seeking."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.remaining = None
        # Draft manifests change as new renders finish; always serve current data.
        if "If-Modified-Since" in self.headers:
            del self.headers["If-Modified-Since"]
        requested = self.headers.get("Range")
        path = Path(self.translate_path(self.path))
        if not requested or not path.is_file():
            return super().send_head()
        match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested.strip())
        stream = path.open("rb")
        size = path.stat().st_size
        start, end = 0, size - 1
        if match and (match[1] or match[2]):
            if match[1]:
                start = int(match[1])
                end = min(int(match[2]), end) if match[2] else end
            else:
                suffix = int(match[2])
                start = max(0, size - suffix)
                if not suffix:
                    start = size
        else:
            start = size
        if start < 0 or start > end or start >= size:
            stream.close()
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None
        self.remaining = end - start + 1
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(self.remaining))
        self.send_header("Last-Modified", self.date_time_string(path.stat().st_mtime))
        self.end_headers()
        stream.seek(start)
        return stream

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def copyfile(self, source, outputfile):
        if self.remaining is None:
            return super().copyfile(source, outputfile)
        while self.remaining:
            block = source.read(min(64 * 1024, self.remaining))
            if not block:
                break
            outputfile.write(block)
            self.remaining -= len(block)

    def do_GET(self):
        try:
            super().do_GET()
        except (BrokenPipeError, ConnectionResetError):
            # Switching video variants normally cancels an in-flight response.
            pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8002)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    with ThreadingHTTPServer(("127.0.0.1", args.port), partial(PreviewHandler, directory=str(root))) as server:
        print(f"Local preview: http://localhost:{args.port}/ (video byte ranges enabled)", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
