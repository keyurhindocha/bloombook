#!/usr/bin/env python3
"""Stamp every published plant-photo URL with ?v=<date>.

Photo filenames are stable across check-ins (02-calathea.jpg is always the
Calathea), which is what makes the dated history folders comparable — but it
also means a browser that cached the old photo never re-fetches the new one.
Bumping this stamp is what actually makes updated photos show up for viewers.

Idempotent: re-running replaces an existing stamp rather than appending one.
"""
import datetime
import re
import sys

TARGETS = [
    ("index.html",             r'(src="plants/[^"?]+\.jpg)(\?v=[0-9]+)?"',    r'\1?v={v}"'),
    ("app/src/data/plants.js", r"(photo: 'plants/[^'?]+\.jpg)(\?v=[0-9]+)?'", r"\1?v={v}'"),
]


def main() -> int:
    v = sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().strftime("%Y%m%d")
    if not re.fullmatch(r"[0-9]{8}", v):
        print(f"bump-cache-bust: expected a YYYYMMDD stamp, got {v!r}", file=sys.stderr)
        return 2
    for path, pattern, replacement in TARGETS:
        try:
            src = open(path, encoding="utf-8").read()
        except FileNotFoundError:
            print(f"  {path}: not found, skipped")
            continue
        out, n = re.subn(pattern, replacement.format(v=v), src)
        if out != src:
            open(path, "w", encoding="utf-8").write(out)
        print(f"  {path}: {n} urls stamped v={v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
