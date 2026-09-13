#!/usr/bin/env python3
"""Generate CanlıSite HUD-style PNG icons (no extra deps)."""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path


def png(width: int, height: int, pixels: bytes) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = b""
    stride = width * 4
    for y in range(height):
        raw += b"\x00" + pixels[y * stride : (y + 1) * stride]
    return b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)),
            chunk(b"IDAT", zlib.compress(raw, 9)),
            chunk(b"IEND", b""),
        ]
    )


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def draw_icon(size: int) -> bytes:
    px = bytearray(size * size * 4)
    cx = cy = (size - 1) / 2.0
    r = size * 0.42

    def setp(x: int, y: int, c: tuple[int, int, int, int]) -> None:
        if 0 <= x < size and 0 <= y < size:
            i = (y * size + x) * 4
            px[i : i + 4] = bytes(c)

    for y in range(size):
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = math.hypot(dx, dy)
            t = min(1.0, dist / (size * 0.72))
            bg = (
                lerp(11, 8, t),
                lerp(21, 14, t),
                lerp(17, 12, t),
                255,
            )
            # rounded-square mask
            nx = abs(dx) / (size * 0.48)
            ny = abs(dy) / (size * 0.48)
            corner = max(nx, ny)
            if corner > 1.08:
                setp(x, y, (0, 0, 0, 0))
                continue
            alpha = 255
            if corner > 0.96:
                alpha = int(255 * (1.08 - corner) / 0.12)
            setp(x, y, (bg[0], bg[1], bg[2], alpha))

            # outer ring
            if abs(dist - r) < size * 0.028:
                setp(x, y, (52, 211, 153, alpha))
            # crosshair ticks
            tick = size * 0.018
            if abs(dx) < tick and (size * 0.12 < abs(dy) < size * 0.46):
                setp(x, y, (16, 185, 129, alpha))
            if abs(dy) < tick and (size * 0.12 < abs(dx) < size * 0.46):
                setp(x, y, (16, 185, 129, alpha))
            # center dot
            if dist < size * 0.055:
                setp(x, y, (52, 211, 153, alpha))

    # status pip (top-right)
    pip_x = int(size * 0.78)
    pip_y = int(size * 0.22)
    pip_r = max(2, int(size * 0.055))
    for y in range(pip_y - pip_r - 2, pip_y + pip_r + 3):
        for x in range(pip_x - pip_r - 2, pip_x + pip_r + 3):
            if math.hypot(x - pip_x, y - pip_y) <= pip_r:
                setp(x, y, (52, 211, 153, 255))

    return png(size, size, bytes(px))


def write_ico(path: Path, pngs: list[tuple[int, bytes]]) -> None:
    # ICO with embedded PNGs (Vista+)
    count = len(pngs)
    header = struct.pack("<HHH", 0, 1, count)
    offset = 6 + 16 * count
    entries = b""
    data = b""
    for size, blob in pngs:
        w = 0 if size >= 256 else size
        entries += struct.pack("<BBBBHHII", w, w, 0, 0, 1, 32, len(blob), offset)
        data += blob
        offset += len(blob)
    path.write_bytes(header + entries + data)


def main() -> None:
    public = Path("public/icons")
    desktop = Path("desktop/icons")
    native = Path("native/icons")
    for d in (public, desktop, native):
        d.mkdir(parents=True, exist_ok=True)

    sizes = {
        public / "icon-192.png": 192,
        public / "icon-512.png": 512,
        public / "apple-touch-icon.png": 180,
        desktop / "icon.png": 512,
        native / "icon.png": 512,
        native / "icon-192.png": 192,
        native / "foreground.png": 432,
    }
    blobs: dict[int, bytes] = {}
    for path, size in sizes.items():
        if size not in blobs:
            blobs[size] = draw_icon(size)
        path.write_bytes(blobs[size])
        print(f"wrote {path} ({path.stat().st_size} bytes)")

    ico_sizes = [16, 32, 48, 256]
    ico_pngs = []
    for s in ico_sizes:
        if s not in blobs:
            blobs[s] = draw_icon(s)
        ico_pngs.append((s, blobs[s]))
    ico_path = desktop / "icon.ico"
    write_ico(ico_path, ico_pngs)
    print(f"wrote {ico_path} ({ico_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
