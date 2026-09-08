"""Vercel serverless entrypoint for the Flask API.

This file is a catch-all function (`[...path].py`), so Vercel routes every
`/api/*` request here **with the original path preserved** and `@vercel/python`
serves the module-level `app` as a WSGI handler. Using a catch-all instead of a
`rewrites` rule avoids Vercel's newer behavior of routing rewrites by their
rewritten destination path (which would hand Flask the wrong URL).

The real app lives in `quiz_backend.py` at the repo root, bundled into this
function via the build's `includeFiles` setting.

Locally the backend is still run directly: `python quiz_backend.py`.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from quiz_backend import app  # noqa: E402  (path set up above)

# `app` is a WSGI callable — Vercel's Python runtime picks it up by name.
