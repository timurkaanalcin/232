#!/usr/bin/env python3
"""Read havuz/src/lib/local-studio.json for shell automations."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CATALOG_PATH = ROOT.parent / "src" / "lib" / "local-studio.json"


def load():
    return json.loads(CATALOG_PATH.read_text())


def models(data, wave=None, include_banned=False):
    rows = data["models"]
    if not include_banned:
        rows = [m for m in rows if not m.get("banned")]
    if wave in (None, "", "all"):
        return [m for m in rows if m.get("wave") != "never"]
    if wave == "never":
        return [m for m in data["models"] if m.get("banned") or m.get("wave") == "never"]
    if wave == "1":
        wave = 1
    elif wave == "2":
        wave = 2
    elif wave == "3":
        wave = 3
    return [m for m in rows if m.get("wave") == wave]


def get_model(data, mid):
    for m in data["models"]:
        if m["id"] == mid:
            return m
    return None


def print_gets(m):
    chunks = []
    for g in m.get("gets") or []:
        repo = g["repo"]
        if g.get("quant"):
            repo = f"{repo}@{g['quant']}"
        flags = " ".join(g.get("flags") or [])
        chunks.append(f"{repo}\t{flags}".rstrip())
    print("\n".join(chunks))


def cmd_ids(data, wave):
    for m in models(data, wave):
        print(m["id"])


def cmd_table(data, wave="all"):
    print("id\twave\tsizeGb\tkind\tverdict")
    for m in models(data, wave, include_banned=True):
        print(f"{m['id']}\t{m.get('wave')}\t{m.get('sizeGb')}\t{m.get('kind')}\t{m.get('verdict')}")


def cmd_needles(data, mid):
    m = get_model(data, mid)
    if not m:
        sys.exit(f"unknown model: {mid}")
    print("\n".join(m.get("loadNeedles") or []))


def cmd_json(data, mid):
    m = get_model(data, mid)
    if not m:
        sys.exit(f"unknown model: {mid}")
    json.dump(m, sys.stdout, ensure_ascii=False)
    print()


def main(argv):
    if len(argv) < 2 or argv[1] in ("-h", "--help"):
        print(
            "usage: catalog.py ids|gets|needles|json|table|banned|trial|defaults [wave|id]",
            file=sys.stderr,
        )
        return 2
    data = load()
    op = argv[1]
    if op == "ids":
        cmd_ids(data, argv[2] if len(argv) > 2 else "1")
    elif op == "gets":
        mid = argv[2]
        m = get_model(data, mid)
        if not m:
            sys.exit(f"unknown model: {mid}")
        print_gets(m)
    elif op == "needles":
        cmd_needles(data, argv[2])
    elif op == "json":
        cmd_json(data, argv[2])
    elif op == "table":
        cmd_table(data, argv[2] if len(argv) > 2 else "all")
    elif op == "banned":
        for m in data["models"]:
            if m.get("banned"):
                print(m["id"])
    elif op == "trial":
        print("\n".join(data["trialOrder"]))
    elif op == "defaults":
        json.dump(data["defaults"], sys.stdout)
        print()
    elif op == "field":
        m = get_model(data, argv[2])
        if not m:
            sys.exit(f"unknown model: {argv[2]}")
        val = m.get(argv[3], "")
        if isinstance(val, (dict, list, bool)) or val is None:
            json.dump(val, sys.stdout)
            print()
        else:
            print(val)
    else:
        sys.exit(f"unknown op: {op}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
